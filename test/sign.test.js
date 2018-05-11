import { signEthereumTx, stripHexPrefix } from '../src/scripts/utils/sign';

describe('stipHexPrefix', () => {
  test('returns string without 0x prefix', () => {
    expect(stripHexPrefix('0x12345')).toBe('12345');
  });
  test('returns the same string if it is not prefixed with 0x', () => {
    expect(stripHexPrefix('12345')).toBe('12345');
  });
});

const privateKey = '3a1076bf45ab87712ad64ccb3b10217737f7faacbf2872e88fdd9a537d8fe266';
const txData = '095ea7b30000000000000000000000007657ca877fac31d20528b473162e39b6e152fd2e00000000000000000000000000000000000000000000003635c9adc5dea00000';
const tx = `f8693e8504a817c80082b2089453e546387a0d054e7ff127923254c0a679da6dbf80b844${txData}808080`;

describe('signEthereumTx', () => {
  test('returns signed transaction', () => {
    const signedTx = signEthereumTx(tx, privateKey);
    expect(signedTx.length).toBeGreaterThan(txData.length);
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
