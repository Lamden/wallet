const keyStorage = require('../src/utils/key_storage');

const ethTestKey = '3a1076bf45ab87712ad64ccb3b10217737f7faacbf2872e88fdd9a537d8fe266';
const ethAddress = 'c2d7cf95645d33006175b78989035c7c9061d3f9';
const btcTestKey = 'cSYq9JswNm79GUdyz6TiNKajRTiJEKgv4RxSWGthP3SmUHiX9WKe';
const btcAddress = 'msJ2ucZ2NDhpVzsiNE5mGUFzqFDggjBVTM';

beforeEach(() => {
  keyStorage.lockStorage();
  localStorage.clear();
});

describe('getAvailableKeys', () => {
  test('returns empty object for empty localStorage', () => {
    keyStorage.unlockStorage('test_pass');
    expect(keyStorage.getAvailableKeys()).toEqual({});
  });
  test('throws an error if storage is locked', () => {
    expect(() => keyStorage.getAvailableKeys()).toThrow('Storage is locked');
  });
  test('returns networks and list of addresses for all added private keys', () => {
    keyStorage.unlockStorage('test_pass');
    keyStorage.addKey('ETH-TESTNET', ethTestKey, 'Alice');
    keyStorage.addKey('BTC-TESTNET', btcTestKey, 'Bob');
    expect(keyStorage.getAvailableKeys()).toEqual({
      'BTC-TESTNET': [{ address: btcAddress, label: 'Bob' }],
      'ETH-TESTNET': [{ address: ethAddress, label: 'Alice' }],
    });
  });
});

describe('unlockStorage', () => {
  test('throws error given wrong password', () => {
    keyStorage.unlockStorage('test_pass');
    keyStorage.addKey('ETH-TESTNET', ethTestKey);
    keyStorage.lockStorage();
    expect(() => keyStorage.unlockStorage('wrong_pass')).toThrow('Incorrect password');
  });
});

describe('addKey', () => {
  test('adds key to storage', () => {
    keyStorage.unlockStorage('test_pass');
    keyStorage.addKey('ETH-TESTNET', ethTestKey);
    expect(keyStorage.getAvailableKeys()).toEqual({
      'ETH-TESTNET': [{ address: ethAddress, label: '' }],
    });
  });
  test('throws an error if storage is locked', () => {
    expect(() => keyStorage.addKey('BTC-TESTNET', btcTestKey)).toThrow('Storage is locked');
  });
  ['ETH', 'BTC'].forEach((network) => {
    test('throws an error if key is invalid', () => {
      keyStorage.unlockStorage('test_pass');
      expect(() => keyStorage.addKey(network, 'invalid_key')).toThrow('Invalid private key');
    });
  });
  test('throws an error if network is not supported', () => {
    keyStorage.unlockStorage('test_pass');
    expect(() => keyStorage.addKey('NON-SUPPORTED', '')).toThrow('NON-SUPPORTED network is not supported');
  });
});

describe('getPrivateKey', () => {
  test('returns private key given network and address', () => {
    keyStorage.unlockStorage('test_pass');
    keyStorage.addKey('ETH-TESTNET', ethTestKey);
    expect(keyStorage.getPrivateKey('ETH-TESTNET', ethAddress)).toBe(ethTestKey);
  });
  test('throws an error if storage is locked', () => {
    expect(() => keyStorage.getPrivateKey('ETH-TESTNET', ethAddress)).toThrow('Storage is locked');
  });
  test('throws an error if private key does not exist', () => {
    keyStorage.unlockStorage('test_pass');
    expect(() => keyStorage.getPrivateKey('ETH-TESTNET', btcAddress)).toThrow('Key not found');
  });
});
