/* global localStorage

Token Storage Notes:
 -  Tokens are now stored with a "name + symbol" key. 
    This is to allow for the possibilty of two different project with the same symbol
*/
const tokenInfo = require('./token_info');
const ethUtil = require('ethereumjs-util');
const keythereum = require('keythereum');
const bitcoin = require('bitcoinjs-lib')
const btcNetworks = require('./bitcoin_networks');
const ethNetworks = require('./ethereum_networks');
const tauNetworks = require('./cilantro_networks');
const tauWallet = require('./wallet');
const nodeCryptoJs = require('node-cryptojs-aes');
const sign = require('./sign');

const { CryptoJS, JsonFormatter } = nodeCryptoJs;

let password;

function getPrivateKeys() {
  if (password === undefined) {
    throw new Error('Storage is locked');
  }
  const privKeys = localStorage.privKeys;
  if (privKeys === undefined) {
    return {};
  }

  try {
    const decrypted = CryptoJS.AES.decrypt(privKeys, password, { format: JsonFormatter });
    return JSON.parse(CryptoJS.enc.Utf8.stringify(decrypted));
  } catch (e) {
    throw new Error('Decryption failed');
  }
}

function setPrivateKeys(privKeys) {
  const encrypted =
    CryptoJS.AES.encrypt(JSON.stringify(privKeys), password, { format: JsonFormatter }).toString();

  localStorage.setItem('privKeys', encrypted);
}

function getSuppotedTokens () {
  return tokenInfo;
}

function getUnencrypted(storeName){
  let storageObj = JSON.parse(localStorage[storeName]);
  return storageObj;
}

function setUnencrypted(storageObj, storeName) {
  const jsonObj = JSON.stringify(storageObj);
  localStorage.setItem(storeName, jsonObj);
}

function storageUnlocked(){
  return password === undefined ? false : true;
}

function generateDTAUWallet(pass){
  var kp = tauWallet.new_wallet()
  var enckp = CryptoJS.AES.encrypt(kp.sk, pass);
  return {
      wallet: kp,
      encsk: enckp
  }
}

exports.authenticate = (pass) => {
  const auth = localStorage.authenticate;
  try {
    const decrypted = CryptoJS.AES.decrypt(auth, pass, { format: JsonFormatter });
    JSON.parse(CryptoJS.enc.Utf8.stringify(decrypted));
    password = pass;
    return true;
  } catch (e) {
    password = undefined;
    throw new Error('Incorrect Password');
  }
}

exports.firstRun = () => {
  return localStorage.privKeys ? true : false;
}

exports.initiateKeyStore = (pass) => {
  password = pass;

  if (!localStorage.privKeys){
    let testnetKey = ['DarkTauDTAU'];
    let mainnetKey = ['LamdenMainNet'];
    let darkTAUWallet = generateDTAUWallet(password);
    //use this storage object to authenticate the user's password withough having to decrypt the private key store
    const authenticate = CryptoJS.AES.encrypt(JSON.stringify('authenticate'), password, { format: JsonFormatter }).toString();
    localStorage.setItem('authenticate', authenticate);

    //Encrypted storage for private keys.  
    //This only unencrypted when something needs to be signed, exported or the user wants to view it
    let privKeys = {};
    privKeys[testnetKey] = {};
    privKeys[testnetKey][darkTAUWallet.wallet.vk] = darkTAUWallet.wallet.sk;

    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(privKeys), password, { format: JsonFormatter }).toString();
    localStorage.setItem('privKeys', encrypted);

    //unencrypted storage for the public key information as well as UI info for each key
    let pubKeys = {};
    pubKeys[testnetKey] = {};
    pubKeys[testnetKey][darkTAUWallet.wallet.vk] = {label: "Lamden Wallet Dark TAU Address", balance: 0, stamps: 0, uiDefault: true};
    pubKeys[mainnetKey] = {};
    pubKeys[mainnetKey]['unavailable'] = {label:'Comming Soon', balance: 0, stamps: 0, uiDefault: true, };
    setUnencrypted(pubKeys, 'pubKeys')

    //unencrypted storage of the user's active token list. 
    //These are tokens the user added to their clove wallet view
    let activeTokens = ['LamdenTAU','BitcoinBTC', 'EthereumETH'];
    setUnencrypted(activeTokens, 'activeTokens')

    //Instantiate the transactions storage
    let transactions = {};
    transactions[testnetKey] = [];
    transactions[mainnetKey] = [];
    setUnencrypted(transactions, 'transactions')
  }
}

exports.newCilantroWallet = (tokenKey, labelText) => {
  if (tokenKey === 'DarkTauDTAU'){
    try{
      let privKeys = getPrivateKeys();
      let pubKeys = getUnencrypted('pubKeys');
      let darkTAUWallet = generateDTAUWallet(password);
      let rollbackPrivate = getPrivateKeys();
      let rollbackPublic = getUnencrypted('pubKeys');

      //Store PRIVATE key of new Dark TAU Wallet
      privKeys[tokenKey][darkTAUWallet.wallet.vk] = darkTAUWallet.wallet.sk;
      //Store PUBLIC key info of new Dark TAU Wallet
      pubKeys[tokenKey][darkTAUWallet.wallet.vk] = {label: labelText, balance: 0, stamps: 0, uiDefault: false};
      setPrivateKeys(privKeys);
      setUnencrypted(pubKeys, 'pubKeys')
      return darkTAUWallet.wallet.vk;
    } catch (e) {
      setPrivateKeys(rollbackPrivate);
      setUnencrypted(rollbackPublic, 'pubKeys');
      throw new Error('New Wallet Failed: ' + e.message);
    }
  }
}

exports.newCilantroWallet_FromPrivateKey = (tokenKey, privKey, labelText) => {
  let pubKey = tauWallet.get_vk(privKey);
  let privKeys = getPrivateKeys();
  let pubKeys = getUnencrypted('pubKeys');
  try{
    //Store PRIVATE key of new Dark TAU Wallet
    privKeys[tokenKey][pubKey] = privKey;
    //Store PUBLIC key info of new Dark TAU Wallet
    pubKeys[tokenKey][pubKey] = {label: labelText, balance: 0, stamps: 0, uiDefault: false};
    setPrivateKeys(privKeys);
    setUnencrypted(pubKeys, 'pubKeys')
    return pubKey;
  }catch (e){
    throw new Error('Key Import Failed: ' + e.message);
  }
  
}

exports.backupPrivateKeys = () => {
  let href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(localStorage.privKeys);
  return href;
}

exports.getPrivateKeysStorage = () => {
  if (storageUnlocked()){
    let storedTokens = localStorage.privKeys;
    const decrypted = CryptoJS.AES.decrypt(storedTokens, password, { format: JsonFormatter });
    storedTokens = JSON.parse(CryptoJS.enc.Utf8.stringify(decrypted));
    return storedTokens;
  } else {
    throw new Error('Storage is locked');
  }
}

exports.getPrivateKey = (tokenKey, pubKey) => {
  try {
    let privKeys = getPrivateKeys();
    return privKeys[tokenKey][pubKey];

  } catch (e) {
    return e.message;
  }
}

exports.deletePrivateKey = (tokenKey, pubKey) => {
  let privKeys = getPrivateKeys();
  let rollbackPrivate = getPrivateKeys();
  let pubKeys = getUnencrypted('pubKeys');
  let rollbackPublic = getUnencrypted('pubKeys');
  try{
    delete pubKeys[tokenKey][pubKey];
    delete privKeys[tokenKey][pubKey];
    setPrivateKeys(privKeys);
    setUnencrypted(pubKeys, 'pubKeys')
  } catch (e) {
    setPrivateKeys(rollbackPrivate);
    setUnencrypted(rollbackPublic, 'pubKeys');
    throw new Error('Delete failed: ' + e.message);
  }
}

exports.getPubKeyInfo = (tokenKey) => {
  let pubKeyInfo = {};
  if (storageUnlocked()){
    pubKeyInfo  = getUnencrypted('pubKeys');
    if (pubKeyInfo[tokenKey]) {
      return pubKeyInfo[tokenKey]
    }
    return {};
  }else{
    throw new Error('Storage is locked');
  }
}

exports.setPubKeyLabel = (tokenKey, pubKey, newLabel) => {
  let pubKeys = getUnencrypted('pubKeys');
  try {
    pubKeys[tokenKey][pubKey].label = newLabel;
    setUnencrypted(pubKeys, 'pubKeys');
  } catch (e){
    throw new Error('Label save failed: ' + e.message);
  }
}

exports.setWalletUIDefault = (tokenKey, newUIDefault) => {
  let pubKeys = getUnencrypted('pubKeys');
  for (let p in pubKeys[tokenKey]){
    if (newUIDefault === p){
      pubKeys[tokenKey][p].uiDefault = true;
    }else{
      pubKeys[tokenKey][p].uiDefault = false;
    }
  }
  try {
    setUnencrypted(pubKeys, 'pubKeys');
  } catch (e){
    throw new Error('Set Default Failed: ' + e.message);
  }
}

exports.getAllTokens = () => {
// Returns an object with all supported Clove tokens.
// Adds a "visible" property so the UI knows which ones to show in the wallet
  if (storageUnlocked()){
    let allTokens = getSuppotedTokens();
    const activeTokens = getUnencrypted('activeTokens');

    for(let key in allTokens) {
      //Add active status of token (these will be shown in the user's main Clove screen)
      activeTokens.includes(key) ? allTokens[key].active = true : allTokens[key].active = false;
    }
    return allTokens;
  }else{
    throw new Error('Storage is locked');
  }  
}
  
exports.getActiveTokens = () => {  
  // Added the tokenKey to the list of tokens that will exists on the user's Clove page
  let activeTokens = getUnencrypted('activeTokens');
    return  activeTokens;
  }

exports.setActiveToken = (tokenKey) => {
  // Added the tokenKey to the list of tokens that will exists on the user's Clove page
    let activeTokens = getUnencrypted('activeTokens');
    activeTokens.push(tokenKey);
    setUnencrypted(activeTokens);
  }

exports.removeActiveToken = (tokenKey) => {
// Removes the tokenKey from the list of tokens that will exists on the user's Clove page
  let activeTokens = getUnencrypted('activeTokens');
  let filtered = activeTokens.filter(function(value, index, arr){
    return !(value === tokenKey);
  });
  setUnencrypted(filtered);
}

exports.addKey = (tokenKey, networkSymbol, privateKey, label) => {
  // Accepts a private key entered by the user and attempts to match it to the proper network
  // to get the public key.  If it's able to it will store the keypair in localStorage.privKeys
  // and return the public key back to the UI.
  // We are also storing balance but it will only be populated by future updates.
  
  if (storageUnlocked()) {
    let publicKey;
    let key;
  
    //Match tokenKey to the network
    if (tokenInfo[tokenKey].network === 'Ethereum') {
      key = sign.getHexBuffer(privateKey);
      if (key.length === 0) {
        throw new Error('Invalid private key');
      }
      publicKey = ethUtil.privateToAddress(key).toString('hex');
    } else if (tokenInfo[tokenKey].network === 'Bitcoin') {
        key = sign.getBitcoinKey(privateKey, btcNetworks[networkSymbol]);
        publicKey = key.getAddress();

    } else if (tokenInfo[tokenKey].network === 'Cilantro') {
      throw new Error(`Cilantro networks are not supported yet`);
    } else {
      throw new Error(`${networkSymbol} network is not supported`);
    }

    //Get privateKeys object from localStorage
    let privKeys = getPrivateKeys();
    //Initialize object if it does not exist
    privKeys[tokenKey] = privKeys[tokenKey] || {};

    if (privKeys[tokenKey][publicKey]) {
      throw new Error(`This address already exists in your ${networkSymbol} wallet`);
    } else {
      //Save keypair to localStorage and return public key to UI
      privKeys[tokenKey][publicKey] = {privatekey, label, balance: 0, uiDefault:false};
      setPrivateKeys(privKeys);

      return publicKey;
    }
  }else{
    throw new Error('Storage is locked');
  }
};

exports.getBalance_Cilantro = (pubKey) => {
  try {
    let balance = tauWallet.get_balance(pubKey);
    return balance;
  } catch (e){
    throw new Error("Balance Failed: " + e.message);
  }
}

exports.getToken = (TokenKey) => {
  if (password === undefined) {
    throw new Error('Storage is locked');
  }
  let tokens = getPrivateKeys();
  return tokens[tokenKey];
}

exports.genEthKey = () => {
    /* ethKey = {
     *   privateKey: <Buffer ...>,
     *   iv: <Buffer ...>,
     *   salt: <Buffer ...>
    }*/
    const ethKey = keythereum.create({ keyBytes: 32, ivBytes: 16 });
    const ethPriv = ethKey.privateKey.toString('hex');
    return ethPriv;
}

exports.genBtcKey = (network) => {
    var network;
    if (network === undefined) {
        throw new Error("No network defined for BTC based keygen, cannot continue with keygen");
    }
    // btcKey = <ECPair ...>
    const btcKey = bitcoin.ECPair.makeRandom({ network: network });
    const btcPriv = btcKey.toWIF();
    return btcPriv;
}

exports.generateKey = (networkSymbol) => {
    var privKey = null;
    if (networkSymbol in btcNetworks) {
        privKey = genBtcKey(btcNetworks[networkSymbol]);
    } else if (networkSymbol in ethNetworks) {
        privKey = genEthKey();
    } else if (networkSymbol in tauNetworks) {
        privKey = genTauKey();
    } else {
        throw new Error("Network Symbol provided (" + networkSymbol + ") not supported");
    }

}

exports.addTauKey = (networkSymbol) => {
}

exports.unlockStorage = (pass) => {
  password = pass;
  try {
    getPrivateKeys();
  } catch (e) {
    console.log(e.message);
    password = undefined;
    if (e.message === 'Decryption failed') {
      throw new Error('Incorrect password');
    } else {
      throw e;
    }
  }
};

exports.lockStorage = () => {
  password = undefined;
};

exports.removePrivateKey = (networkSymbol, address) => {
  if (password === undefined) {
    throw new Error('Storage is locked');
  }
  const keys = getPrivateKeys();
  if (keys[networkSymbol] === undefined || keys[networkSymbol][address] === undefined) {
    throw new Error('Key not found');
  }
  delete keys[networkSymbol][address];
  if (Object.keys(keys[networkSymbol]).length === 0) {
    delete keys[networkSymbol];
  }
  setPrivateKeys(keys);
};

exports.getAvailableKeys = () => {
  if (password === undefined) {
    throw new Error('Storage is locked');
  }
  const keys = getPrivateKeys();
  return Object.keys(keys).sort().reduce((obj, key) => {
    // eslint-disable-next-line no-param-reassign
    obj[key] = Object.keys(keys[key]).map(address => ({
      address,
      label: keys[key][address].label || '',
    })).sort((keyA, keyB) => {
      const keyDiff = keyA.address.localeCompare(keyB.address);
      if (keyA.label && keyB.label) {
        const labelDiff = keyA.label.localeCompare(keyB.label);
        return labelDiff === 0 ? keyDiff : labelDiff;
      } else if (keyA.label) {
        return -1;
      } else if (keyB.label) {
        return 1;
      }
      return keyDiff;
    });
    return obj;
  }, {});
};  

exports.getTauWallet = () => {
  return tauWallet;
}

exports.getSupportedNetworks = () => Object.keys(btcNetworks).concat(ethNetworks).sort();
