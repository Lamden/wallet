const bitcoinLegacy = require('bitcoinjs-lib-332');
const bitcoin = require('bitcoinjs-lib-latest');
const ethUtil = require('ethereumjs-util');
const ethTx = require('ethereumjs-tx').Transaction;
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
      pubkey = ethUtil.toChecksumAddress(pubkey);
    } catch {
      throw new Error(`Not a valid ${network} private key`);
    }    
  } 
  
  if (network === 'bitcoin') {
    try {
      const networkObj = networks[network][symbol];
      key = bitcoin.ECPair.fromWIF(privateKey, networkObj);
      const { address } = bitcoin.payments.p2pkh({ pubkey: key.publicKey, network: networkObj });
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
      keyPair.vk = ethUtil.toChecksumAddress(myWallet.getAddressString());
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
      return wallet_address;
    } catch (e) {
      console.log(e)
      throw new Error(`Not a valid ${network} public key`);
    }
  }

  if (network === 'ethereum'){
    try{
      let checkSumAddress = ethUtil.toChecksumAddress(wallet_address);
      ethUtil.isValidChecksumAddress(checkSumAddress);
      return checkSumAddress;
    } catch (e) {
      throw new Error(`Not a valid ${network} public key`);
    }
  }
  throw new Error(`${network} is not a supported network `);
}

export function signTx(rawTransaction, privateKey, network, networkSymbol) {
  if (network === 'ethereum' ) {
    return signEthereumTx(rawTransaction, privateKey, networkSymbol);
  }

  if (network === 'bitcoin') {
    return signBitcoinTx(rawTransaction, privateKey, networks[network][networkSymbol]);
  }

  throw new Error(`${network} network is not supported`);
};

function signEthereumTx(rawTransaction, privateKey, networkSymbol) {
  const key = getHexBuffer(privateKey);
  if (key.length === 0) {
    throw new Error('Missing or invalid private key');
  }

  const ethTransaction = getEthereumTx(rawTransaction, networkSymbol);

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

function getEthereumTx (rawTransaction, networkSymbol){
  const rawTx = getHexBuffer(rawTransaction);
  let chain = networkSymbol === 'ETH-TESTNET' ? {'chain':42} : {};

  if (rawTx.length === 0) {
    throw new Error('Invalid transaction');
  }

  try {
    return new ethTx(rawTx, chain);
  } catch (e) {
    console.log(e)
    throw new Error('Invalid transaction');
  }
};

function getHexBuffer(hexstring) {
  let striphex = stripHexPrefix(hexstring)
  let buff = Buffer.from(striphex, 'hex')
  return buff;
}

function stripHexPrefix(hexString) {
  let hexstr = hexString.slice(0, 2) === '0x' ? hexString.slice(2) : hexString;
  return hexstr;
};

function getBitcoinTx(rawTransaction) {
  try {
    return bitcoinLegacy.Transaction.fromHex(rawTransaction);
  } catch (e) {
    throw new Error('Invalid transaction');
  }
};

function getBitcoinKey(privateKey, network) {
  try {
    return bitcoinLegacy.ECPair.fromWIF(privateKey, network);
  } catch (e) {
    if (e.message === 'Invalid checksum' || e.message === 'Non-base58 character') {
      throw new Error('Invalid private key');
    }
    throw e;
  }
};

function signBitcoinTx(rawTransaction, privateKey, networkObj, ) {
  const tx = getBitcoinTx(rawTransaction);
  const txb = bitcoinLegacy.TransactionBuilder.fromTransaction(tx, networkObj);
  const key = getBitcoinKey(privateKey, networkObj);

  if (txb.inputs[0].prevOutType === 'nonstandard') {
    const contract = bitcoinLegacy.script.decompile(tx.ins[0].script).pop();
    txb.inputs[0].prevOutScript =
    bitcoinLegacy.script.scriptHash.output.encode(bitcoinLegacy.crypto.hash160(contract));
    txb.inputs[0].prevOutType = bitcoinLegacy.script.types.P2SH;
    txb.inputs[0].signScript = contract;
    txb.inputs[0].signType = bitcoinLegacy.script.types.P2SH;

    txb.inputs[0].pubKeys = [key.getPublicKeyBuffer()];
    txb.inputs[0].signatures = [undefined];

    txb.sign(0, key, contract);

    const sig = bitcoinLegacy.script.scriptHash.input.encodeStack(
      txb.inputs[0].signatures[0],
      txb.inputs[0].pubKeys[0],
    );

    sig.push(...bitcoinLegacy.script.decompile(tx.ins[0].script));
    txb.tx.setInputScript(0, bitcoinLegacy.script.compile(sig));
    return txb.tx.toHex();
  }

  txb.inputs.forEach((input, i) => {
    if (!('signatures' in input) || input.signatures.length === 0) {
      txb.sign(i, key);
    }
  });
  return txb.build().toHex();
};