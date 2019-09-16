const bitcoin = require('bitcoinjs-lib');
const ethUtil = require('ethereumjs-util');
const ethTx = require('ethereumjs-tx');
const ethWallet = require('ethereumjs-wallet');
import { networks } from './networks';


export function pubFromPriv(network, symbol, privateKey) {
  let pubkey = undefined;
  let key;
  
  if (network === 'ethereum') {
    try {
      key = getHexBuffer(privateKey);
      if (key.length === 0) {
        throw new Error(`Not a valid ${network} private key`);
      }
      pubkey = ethUtil.privateToAddress(key).toString('hex');
    } catch {
      console.log('pubkey error ')
      throw new Error(`Not a valid ${network} private key`);
    }    
  } 
  
  if (network === 'bitcoin') {
    try {
      const BTCnetwork = networks[network][symbol];
      key = bitcoin.ECPair.fromWIF(privateKey, BTCnetwork);
      const { address } = bitcoin.payments.p2pkh({ pubkey: key.publicKey, network: BTCnetwork });
      pubkey = address;
    } catch {
      throw new Error(`Not a valid ${network} private key`);
    }
  }
/*
  if (network === 'lamden') { 
    pubkey = lamdenWallet.get_vk(privateKey);
  }
*/
  if (!pubkey){
    throw new Error(`${network} is not a supported network `);
  }
  
  return pubkey;
};

export function keysFromNew(network, symbol) {
  let keyPair = {};
  if (network === 'ethereum') {
    let myWallet;
    try{
      myWallet = ethWallet.generate();
      keyPair.vk = myWallet.getAddressString()
      keyPair.sk = myWallet.getPrivateKeyString()
    } catch(e) {
      console.log(e);
      throw new Error(`Error creating ethereum network wallet for ${symbol}: ${e}`);
    }

  }
  
  if (network === 'bitcoin') {
    const BTCnetwork = networks[network][symbol];
    if (!BTCnetwork){
      throw new Error(`${symbol} is not a supported symbol on the bitcoin network`);
    }
    try{
      const ecPair = bitcoin.ECPair.makeRandom({compressed: false, network: BTCnetwork});
      const { address } = bitcoin.payments.p2pkh({ pubkey: ecPair.publicKey, network: BTCnetwork })
      keyPair.vk = address;
      keyPair.sk =  ecPair.toWIF();      
    } catch(e) {
      console.log(e);
      throw new Error(`Error creating bitcoin network wallet for ${symbol}: ${e}`);
    }
  }

  if (network === 'lamden') { 
    pubkey = lamdenWallet.get_vk(privateKey);
  }

  if (!keyPair.vk || !keyPair.sk){
    throw new Error(`${network} is not a supported network `);
  }

  keyPair.network = network;
  keyPair.symbol = symbol;
  return keyPair;
};

export function validateAddress(network, wallet_address){
  
  if (network === 'bitcoin'){
    try{
      bitcoin.address.fromBase58Check(wallet_address)
      return
    } catch (e) {
      console.log(e)
      throw new Error(`Not a valid ${network} public key`);
    }
  }

  if (network === 'ethereum'){
    try{
      ethUtil.isValidChecksumAddress(ethUtil.toChecksumAddress(wallet_address))
      return
    } catch (e) {
      throw new Error(`Not a valid ${network} public key`);
    }
  }
  throw new Error(`${network} is not a supported network `);
}

export function signTx(rawTransaction = '', privateKey = '', network, networkSymbol = '', ) {
  if (network === 'ethereum') {
    return signEthereumTx(rawTransaction, privateKey);
  }

  if (network === 'bitcoin') {
    return signBitcoinTx(rawTransaction, privateKey, networks[network][networkSymbol]);
  }

  throw new Error(`${networkSymbol} network is not supported`);
};

function stripHexPrefix(hexString) {
  return hexString.slice(0, 2) === '0x' ? hexString.slice(2) : hexString;
};

function getHexBuffer(hexstring) {
  return Buffer.from(stripHexPrefix(hexstring), 'hex');
} 

function getEthereumTx (rawTransaction){
  const rawTx = getHexBuffer(rawTransaction);

  if (rawTx.length === 0) {
    throw new Error('Invalid transaction');
  }

  try {
    return new EthereumTx(rawTx);
  } catch (e) {
    throw new Error('Invalid transaction');
  }
};

function signEthereumTx(rawTransaction = '', privateKey = '') {
  const key = getHexBuffer(privateKey);

  if (key.length === 0) {
    throw new Error('Missing or invalid private key');
  }

  const ethTransaction = getEthereumTx(rawTransaction);

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

function getBitcoinTx(rawTransaction) {
  try {
    return bitcoin.Transaction.fromHex(rawTransaction);
  } catch (e) {
    throw new Error('Invalid transaction');
  }
};

function getBitcoinKey(privateKey, network) {
  try {
    return bitcoin.ECPair.fromWIF(privateKey, network);
  } catch (e) {
    if (e.message === 'Invalid checksum' || e.message === 'Non-base58 character') {
      throw new Error('Invalid private key');
    }
    throw e;
  }
};

function signBitcoinTx(rawTransaction = '', privateKey = '', network) {
  const tx = getBitcoinTx(rawTransaction);

  const txb = bitcoin.TransactionBuilder.fromTransaction(tx, network);

  const key = getBitcoinKey(privateKey, network);

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