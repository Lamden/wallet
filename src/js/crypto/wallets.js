const bitcoinLegacy = require('bitcoinjs-lib-332');
const bitcoin = require('bitcoinjs-lib-latest');
const ethUtil = require('ethereumjs-util');
const ethTx = require('ethereumjs-tx').Transaction;
const ethWallet = require('ethereumjs-wallet');
const networks = require("./networks");
const typedFunction = require("../typechecker");

const pubFromPriv = typedFunction( [ String, String, String ],  ( network, symbol, privateKey )=>{
  network = vailidateString(network, 'Network')
  symbol = vailidateString(symbol, 'Symbol')
  privateKey = vailidateString(privateKey, 'Private Key')

  let pubkey = undefined;
  let key;
  
  if (network === 'ethereum') {
    try {
      key = getHexBuffer( privateKey );
      if (key.length === 0) {
        throw new Error(`Not a valid ${network} private key`);
      }
      pubkey = ethUtil.privateToAddress(key).toString('hex');
      pubkey = ethUtil.toChecksumAddress(pubkey);
    } catch (e) {
      throw new Error(`Not a valid ${network} private key`);
    }    
  } 
  
  if (network === 'bitcoin') {
    const networkObj = networks[network][symbol];
    if (!networkObj){
      throw new Error(`Not a valid ${network} network`);
    }
    try {
      key = bitcoin.ECPair.fromWIF(privateKey, networkObj);
      const { address } = bitcoin.payments.p2pkh({ pubkey: key.publicKey, network: networkObj });
      pubkey = address;
    } catch (e) {
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
});

const keysFromNew = typedFunction( [ String, String ],  ( network, symbol )=>{
  network = vailidateString(network, 'Network')
  symbol = vailidateString(symbol, 'Symbol')

  let keyPair = {};

  if (network === 'ethereum') {
    try{
      let myWallet = ethWallet.generate(); 
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
    throw new Error(`${network} is not a supported network`);
  }

  keyPair.network = network;
  keyPair.symbol = symbol;
  return keyPair;
});

const validateAddress = typedFunction( [ String, String ],  ( network, wallet_address )=>{
  network = vailidateString(network, 'Network')
  wallet_address = vailidateString(wallet_address, 'Wallet Address')

  if (network === 'bitcoin'){
    try{
      bitcoin.address.fromBase58Check(wallet_address)
      return wallet_address;
    } catch (e) {
      console.log(e)
      throw new Error(`Not a valid ${network} public key`);
    }
  }

  if (network === 'ethereum' ){
    if (isEthAddress(wallet_address)){
      return ethUtil.toChecksumAddress(wallet_address);
    }else{
      throw new Error(`Not a valid ${network} public key`);
    }
  }
  throw new Error(`${network} is not a supported network `);
});

const isEthAddress = typedFunction( [ String ],  ( wallet_address )=>{
    // function isAddress(address) {
        if (!/^(0x)?[0-9a-f]{40}$/i.test(wallet_address)) {
        // check if it has the basic requirements of an address
        return false;
    } else if (/^(0x)?[0-9a-f]{40}$/.test(wallet_address) || /^(0x)?[0-9A-F]{40}$/.test(wallet_address)) {
        // If it's all small caps or all all caps, return "true
        return true;
    } else {
        // Otherwise check each case
        return ethUtil.isValidChecksumAddress( ethUtil.toChecksumAddress(wallet_address) );
    }
});

const signTx = typedFunction( [ String, String, String, String ],  ( rawTransaction, privateKey, network, networkSymbol )=>{
  privateKey = vailidateString(privateKey, 'Private Key')
  rawTransaction = vailidateString(rawTransaction, 'Raw Transaction')
  network = vailidateString(network, 'Network')

  if (network === 'ethereum' ) {
    return signEthereumTx(rawTransaction, privateKey, networkSymbol);
  }

  if (network === 'bitcoin') {
    return signBitcoinTx(rawTransaction, privateKey, networks[network][networkSymbol]);
  }

  throw new Error(`${network} network is not supported`);
});

const signEthereumTx = typedFunction( [ String, String, String ],  ( rawTransaction, privateKey, networkSymbol )=>{
  const key = getHexBuffer(privateKey);
  if (key.length === 0) {
    throw new Error('Missing or invalid Private Key');
  }

  const ethTransaction = getEthereumTx(rawTransaction, networkSymbol);

  try {
    ethTransaction.sign(key);
  } catch (e) {
    if (e instanceof RangeError) {
      throw new Error('Invalid Private Key length');
    } else {
      throw new Error('Signing failed');
    }
  }
  return ethTransaction.serialize().toString('hex');
});

const getEthereumTx = typedFunction( [ String, String ],  ( rawTransaction, chainID )=>{
  let rawTx;
  try{
    rawTx = getHexBuffer(rawTransaction);
  } catch (e) {
    throw new Error (`Invalid Raw Transaction: ${e}`)
  }
  
  if (rawTx.length === 0) {
    throw new Error('Invalid Raw Rransaction: String Empty');
  }

  try {
    return new ethTx(rawTx, chainID);
  } catch (e) {
    console.log(e)
    throw new Error(`Invalid Raw Transaction: ${e}`);
  }
});

const getHexBuffer = typedFunction( [ String ],  ( hexString )=>{
  let striphex = stripHexPrefix(hexString)
  let buff = Buffer.from(striphex, 'hex')
  return buff;
});

const stripHexPrefix = typedFunction( [ String ],  ( hexString )=>{
  let hexstr = hexString.slice(0, 2) === '0x' ? hexString.slice(2) : hexString;
  return hexstr;
});

const getBitcoinTx = typedFunction( [ String ],  ( rawTransaction )=>{
  try {
    return bitcoinLegacy.Transaction.fromHex(rawTransaction);
  } catch (e) {
    throw new Error(`Invalid Raw Transaction: ${e}`);
  }
});

const getBitcoinKey = typedFunction( [ String, Object ],  ( privateKey, networkObj )=>{
  try {
    return bitcoinLegacy.ECPair.fromWIF(privateKey, networkObj);
  } catch (e) {
    throw new Error(`Invalid Private Key: ${e}`);
  }
});

const signBitcoinTx = typedFunction( [ String, String, Object ],  ( rawTransaction, privateKey, networkObj )=>{
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
});

const vailidateString = typedFunction( [ String, String ],  (  string, propertyName )=>{
  string = string.trim()
  if (string.length === 0) {
    throw new Error(`${propertyName} field cannot be empty`)
  }
  return string;
});

module.exports = {
  pubFromPriv,
  signTx,
  stripHexPrefix,
  getHexBuffer,
  validateAddress, 
  keysFromNew,
  vailidateString
}