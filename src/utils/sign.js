const bitcoin = require('bitcoinjs-lib');
const EthereumTx = require('ethereumjs-tx');
const btcNetworks = require('./bitcoin_networks');
const ethNetworks = require('./ethereum_networks');


// eslint-disable-next-line arrow-body-style
exports.stripHexPrefix = (hexString) => {
  return hexString.slice(0, 2) === '0x' ? hexString.slice(2) : hexString;
};

exports.getHexBuffer = hexstring => Buffer.from(exports.stripHexPrefix(hexstring), 'hex');

exports.getEthereumTx = (rawTransaction) => {
  const rawTx = exports.getHexBuffer(rawTransaction);

  if (rawTx.length === 0) {
    throw new Error('Invalid transaction');
  }

  try {
    return new EthereumTx(rawTx);
  } catch (e) {
    throw new Error('Invalid transaction');
  }
};

exports.signEthereumTx = (rawTransaction = '', privateKey = '') => {
  const key = exports.getHexBuffer(privateKey);

  if (key.length === 0) {
    throw new Error('Missing or invalid private key');
  }

  const ethTransaction = exports.getEthereumTx(rawTransaction);

  try {
    ethTransaction.sign(key);
  } catch (e) {
    if (e instanceof RangeError) {
      throw new Error('Invalid private key length');
    } else {
      throw new Error('Signing failed');
    }
  }
  return ethTransaction.serialize().toString('hex');
};

exports.getBitcoinTx = (rawTransaction) => {
  try {
    return bitcoin.Transaction.fromHex(rawTransaction);
  } catch (e) {
    throw new Error('Invalid transaction');
  }
};

exports.getBitcoinKey = (privateKey, network) => {
  try {
    return bitcoin.ECPair.fromWIF(privateKey, network);
  } catch (e) {
    if (e.message === 'Invalid checksum' || e.message === 'Non-base58 character') {
      throw new Error('Invalid private key (msg: ' + e.message + ')');
    }
    throw e;
  }
};

exports.signBitcoinTx = (rawTransaction = '', privateKey = '', network) => {
  const tx = exports.getBitcoinTx(rawTransaction);

  const txb = bitcoin.TransactionBuilder.fromTransaction(tx, network);

  const key = exports.getBitcoinKey(privateKey, network);

  if (txb.inputs[0].prevOutType === 'nonstandard') {
    const contract = bitcoin.script.decompile(tx.ins[0].script).pop();
    txb.inputs[0].prevOutScript =
      bitcoin.script.scriptHash.output.encode(bitcoin.crypto.hash160(contract));
    txb.inputs[0].prevOutType = bitcoin.script.types.P2SH;
    txb.inputs[0].signScript = contract;
    txb.inputs[0].signType = bitcoin.script.types.P2SH;

    txb.inputs[0].pubKeys = [key.getPublicKeyBuffer()];
    txb.inputs[0].signatures = [undefined];

    txb.sign(0, key, contract);

    const sig = bitcoin.script.scriptHash.input.encodeStack(
      txb.inputs[0].signatures[0],
      txb.inputs[0].pubKeys[0],
    );

    sig.push(...bitcoin.script.decompile(tx.ins[0].script));
    txb.tx.setInputScript(0, bitcoin.script.compile(sig));
    return txb.tx.toHex();
  }

  txb.inputs.forEach((input, i) => {
    if (!('signatures' in input) || input.signatures.length === 0) {
      txb.sign(i, key);
    }
  });
  return txb.build().toHex();
};

exports.signTx = (rawTransaction = '', privateKey = '', networkSymbol = '') => {
  if (ethNetworks.includes(networkSymbol)) {
    return exports.signEthereumTx(rawTransaction, privateKey);
  }

  if (networkSymbol in btcNetworks) {
    return exports.signBitcoinTx(rawTransaction, privateKey, btcNetworks[networkSymbol]);
  }

  throw new Error(`${networkSymbol} network is not supported`);
};
