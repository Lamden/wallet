const EthereumTx = require('ethereumjs-tx');

export function stripHexPrefix(hexString) {
  return hexString.slice(0, 2) === '0x' ? hexString.slice(2) : hexString;
}

export function signEthereumTx(rawTransaction = '', privateKey = '') {
  const rawTx = Buffer.from(stripHexPrefix(rawTransaction), 'hex');
  const key = Buffer.from(stripHexPrefix(privateKey), 'hex');

  if (rawTx.length === 0) {
    throw new Error('Missing or invalid transaction.');
  }

  if (key.length === 0) {
    throw new Error('Missing or invalid private key.');
  }

  let ethTransaction;
  try {
    ethTransaction = new EthereumTx(rawTx);
  } catch (e) {
    throw new Error('Invalid transaction.');
  }

  try {
    ethTransaction.sign(key);
  } catch (e) {
    if (e instanceof RangeError) {
      throw new Error('Invalid private key length.');
    } else {
      throw new Error('Signing failed.');
    }
  }
  return ethTransaction.serialize().toString('hex');
}
