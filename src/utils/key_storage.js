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
  const keys = localStorage.privKeys;
  if (keys === undefined) {
    return {};
  }

  try {
    const decrypted = CryptoJS.AES.decrypt(keys, password, { format: JsonFormatter });
    return JSON.parse(CryptoJS.enc.Utf8.stringify(decrypted));
  } catch (e) {
    throw new Error('Decryption failed');
  }
}

function authenticate(){
  if (password === undefined) {
    throw new Error('Storage is locked');
  }
  const init = localStorage.init;
  if (init === undefined) {
    return {};
  }

  try {
    const decrypted = CryptoJS.AES.decrypt(init, password, { format: JsonFormatter });
    return JSON.parse(CryptoJS.enc.Utf8.stringify(decrypted));
  } catch (e) {
    password = undefined;
    throw new Error('Decryption failed');
  }
}

function storageUnlocked(){
  return password === undefined ? false : true;
}

function savePrivateKeys(keys) {
  const encrypted =
    CryptoJS.AES.encrypt(JSON.stringify(keys), password, { format: JsonFormatter }).toString();

  localStorage.setItem('privKeys', encrypted);
}

function saveActiveToken(tokenKey) {
  let activeTokens = getActiveTokens();
  activeTokens.push(tokenKey);
  const encrypted =
    CryptoJS.AES.encrypt(JSON.stringify(activeTokens), password, { format: JsonFormatter }).toString();

  localStorage.setItem('activeTokens', encrypted);
}

function getSuppotedTokens () {
  return tokenInfo;
}

function getActiveTokens() {
  if (storageUnlocked()){
    let activeTokens = localStorage.activeTokens;
    if (activeTokens === undefined) {
      return [];
    }
    const decrypted = CryptoJS.AES.decrypt(activeTokens, password, { format: JsonFormatter });
    return JSON.parse(CryptoJS.enc.Utf8.stringify(decrypted))
  } else {
    throw new Error('Storage is locked');
  }
};

exports.firstRun = () => {
  return localStorage.init ? true : false;
}

exports.initiateKeyStore = (pass) => {
  password = pass;

  if (!localStorage.init){
    let init = true;
    const encrypted1 = CryptoJS.AES.encrypt(JSON.stringify(init), password, { format: JsonFormatter }).toString();
    localStorage.setItem('init', encrypted1);

    let privKeys = {};
    const encrypted2 = CryptoJS.AES.encrypt(JSON.stringify(privKeys), password, { format: JsonFormatter }).toString();
    localStorage.setItem('privKeys', encrypted2);
  }
}

exports.unlock = (pass) => {
  password = pass;
  try {
    authenticate();
  } catch (e) {
    password = undefined;
    if (e.message === 'Decryption failed') {
      throw new Error('Incorrect password');
    } else {
      throw e;
    }
  }
}

exports.getInitStorage = () => {
  const decrypted = CryptoJS.AES.decrypt(localStorage.init, password, { format: JsonFormatter });
  return JSON.parse(CryptoJS.enc.Utf8.stringify(decrypted))
}

exports.getPrivateKeysStorage = () => {
  if (storageUnlocked()){
    let storedTokens = localStorage.privKeys;
    const decrypted = CryptoJS.AES.decrypt(storedTokens, password, { format: JsonFormatter });
    return JSON.parse(CryptoJS.enc.Utf8.stringify(decrypted))
  } else {
    throw new Error('Storage is locked');
  }
}

exports.getAllTokens = () => {
  if (storageUnlocked()){
    let allTokens = getSuppotedTokens();
    const privKeys = getPrivateKeys();
    const activeTokens = getActiveTokens()

    for(var key in allTokens) {
      activeTokens.includes(key) ? allTokens[key].active = true : null;
      if (privKeys[key]) {
          for (var address in privKeys[key]) {
              allTokens[key].keys = [];
              allTokens[key].keys.push({public: address, label: privKeys[key][address].label});
          }
      }
    }
    return allTokens;
  }else{
    throw new Error('Storage is locked');
  }  
}

exports.setTokenActive = (tokenKey) => {
  if (storageUnlocked()){
    saveActiveToken(tokenKey);
    return getActiveTokens();
  }else{
    throw new Error('Storage is locked');
  }
}

exports.getTokens = (TokenKey) => {
  if (password === undefined) {
    throw new Error('Storage is locked');
  }
  const tokens = getPrivateKeys();
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

exports.addKey = (networkSymbol, privateKey, label = '') => {
  if (password === undefined) {
    throw new Error('Storage is locked');
  }
  let address;
  let key;

  if (ethNetworks.includes(networkSymbol)) {
    key = sign.getHexBuffer(privateKey);
    if (key.length === 0) {
      throw new Error('Invalid private key');
    }
    address = ethUtil.privateToAddress(key).toString('hex');
  } else if (networkSymbol in btcNetworks) {
    key = sign.getBitcoinKey(privateKey, btcNetworks[networkSymbol]);
    address = key.getAddress();
  } else {
    throw new Error(`${networkSymbol} network is not supported`);
  }
  const keys = getPrivateKeys();
  keys[networkSymbol] = keys[networkSymbol] || {};
  keys[networkSymbol][address] = {
    privateKey,
    label,
  };

  savePrivateKeys(keys);
  return address;
};

exports.getPrivateKey = (networkSymbol, address) => {
  if (password === undefined) {
    throw new Error('Storage is locked');
  }
  const keys = getPrivateKeys();
  if (keys[networkSymbol] === undefined || keys[networkSymbol][address] === undefined) {
    throw new Error('Key not found');
  }
  return keys[networkSymbol][address].privateKey;
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
  savePrivateKeys(keys);
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

exports.getSupportedNetworks = () => Object.keys(btcNetworks).concat(ethNetworks).sort();
