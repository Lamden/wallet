import { signBitcoinTx, signEthereumTx, stripHexPrefix } from '../src/scripts/utils/sign';
const networks = require('../src/scripts/utils/bitcoin_networks');

describe('stipHexPrefix', () => {
  test('returns string without 0x prefix', () => {
    expect(stripHexPrefix('0x12345')).toBe('12345');
  });
  test('returns the same string if it is not prefixed with 0x', () => {
    expect(stripHexPrefix('12345')).toBe('12345');
  });
});


describe('signEthereumTx', () => {
  const privateKey = '3a1076bf45ab87712ad64ccb3b10217737f7faacbf2872e88fdd9a537d8fe266';
  const txData = '095ea7b30000000000000000000000007657ca877fac31d20528b473162e39b6e152fd2e00000000000000000000000000000000000000000000003635c9adc5dea00000';
  const tx = `f8693e8504a817c80082b2089453e546387a0d054e7ff127923254c0a679da6dbf80b844${txData}808080`;

  test('returns signed transaction', () => {
    const signedTx = signEthereumTx(tx, privateKey);
    expect(signedTx.length).toBeGreaterThan(tx.length);
    expect(signedTx).toMatch(txData);
  });
  test('throws error on invalid private key with correct length', () => {
    expect(() => signEthereumTx(tx, ''.padEnd(64, '0'))).toThrow('Signing failed.');
  });
  test('throws error on invalid private key with incorrect length', () => {
    expect(() => signEthereumTx(tx, 'non_hex_key')).toThrow('Missing or invalid private key.');
  });
  test('throws error on missing private key', () => {
    expect(() => signEthereumTx(tx)).toThrow('Missing or invalid private key.');
  });
  test('throws error on invalid transaction', () => {
    expect(() => signEthereumTx('01234', privateKey)).toThrow('Invalid transaction.');
  });
  test('throws error on missing transaction', () => {
    expect(() => signEthereumTx('', privateKey)).toThrow('Missing or invalid transaction.');
  });
});

describe('signBitcoinTx', () => {
  const btc = networks.btcTest;
  const privateKey = 'cSYq9JswNm79GUdyz6TiNKajRTiJEKgv4RxSWGthP3SmUHiX9WKe';
  const p2shTx = '01000000011e2a8e9d3c68d3006abb2680c29dfe97a615838e80cfb9874f89dc125aad4f2d0000' +
    '0000df47304402204612c166014ca7d4fae3e746e16b027ca359dd17aaf0cc6835d28b66c91f368602206d5cf96' +
    'dd748911769c3773ad0c6eeddcf213881aa5ff71fc2ab6a1d344f0263012102187b57bba6e143aca9da3557fe8b' +
    'cf912379ca7ffb8c1967ca6dbde2dc695f19202e16f369336480ff1e86f082e36745e39fa92fea4ed1cca20ef83' +
    '049d7dc0789514c5163a6143421063396631d8294dd62cf7d649183f601297a8876a9143f8870a5633e4fdac612' +
    'fba47525fef082bbe9616704a39bf55ab17576a914812ff3e5afea281eb3dd7fce9b077e4ec6fba08b6888ac000' +
    '000000137490200000000001976a9143f8870a5633e4fdac612fba47525fef082bbe96188ac00000000';
  const p2pkhTx = '01000000011e2a8e9d3c68d3006abb2680c29dfe97a615838e80cfb9874f89dc125aad4f2d010' +
    '00000000000000002400d03000000000017a914e1553d90403b584264ea456c68e6ca485e9b6f7f876bcd2e0300' +
    '0000001976a914812ff3e5afea281eb3dd7fce9b077e4ec6fba08b88ac00000000';

  test('returns signed p2pkh transaction', () => {
    const signedTx = signBitcoinTx(p2pkhTx, privateKey, btc);
    expect(signedTx.length).toBeGreaterThan(p2pkhTx.length);
  });
  test('returns signed p2sh transaction', () => {
    const signedTx = signBitcoinTx(p2shTx, privateKey, btc);
    expect(signedTx.length).toBeGreaterThan(p2shTx.length);
  });
  test('returns already signed p2pkh transaction without changes', () => {
    const signedTx = signBitcoinTx(p2pkhTx, privateKey, btc);
    const signedTwiceTx = signBitcoinTx(signedTx, privateKey, btc);
    expect(signedTx).toBe(signedTwiceTx);
  });
  test('throws error on invalid transaction', () => {
    expect(() => signBitcoinTx('non_hex_tx', privateKey, btc)).toThrow('Invalid transaction.');
  });
  test('throws error on invalid private key', () => {
    expect(() => signBitcoinTx(p2pkhTx, 'non_hex_key', btc)).toThrow('Invalid private key.');
  });
  test('throws error on not matching private key and network', () => {
    expect(() => signBitcoinTx(p2pkhTx, privateKey, networks.ltc)).toThrow('Invalid network version');
  });
  test('throws error on invalid network', () => {
    expect(() => signBitcoinTx(p2pkhTx, privateKey, {})).toThrow('Invalid network version');
  });
});
