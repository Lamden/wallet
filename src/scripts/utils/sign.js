const bitcoin = require('bitcoinjs-lib');
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

export function signBitcoinTx(rawTransaction = '', privateKey = '', network) {
  let tx;
  try {
    tx = bitcoin.Transaction.fromHex(rawTransaction);
  } catch (e) {
    throw new Error('Invalid transaction.');
  }

  const txb = bitcoin.TransactionBuilder.fromTransaction(tx, network);

  let key;
  try {
    key = bitcoin.ECPair.fromWIF(privateKey, network);
  } catch (e) {
    if (e.message === 'Invalid checksum' || e.message === 'Non-base58 character') {
      throw new Error('Invalid private key.');
    }
    throw e;
  }


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
}
