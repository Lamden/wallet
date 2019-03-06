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

function savePrivateKeys(privKeys) {
  const encrypted =
    CryptoJS.AES.encrypt(JSON.stringify(privKeys), password, { format: JsonFormatter }).toString();

  localStorage.setItem('privKeys', encrypted);
}

function getSuppotedTokens () {
  return tokenInfo;
}

function getActiveTokens() {
  let activeTokens = JSON.parse(localStorage.activeTokens);
  return activeTokens;
};

function saveActiveTokens(activeTokens){
  localStorage.setItem('activeTokens', JSON.stringify(activeTokens));
}

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

    let activeTokens = ['BitcoinBTC', 'EthereumETH'];
    const JSONactiveTokens = JSON.stringify(activeTokens);
    localStorage.setItem('activeTokens', JSONactiveTokens);
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
// Returns an object that combines:
//   - The metadata about all tokens (for displaying UI) "token_info.js"
//   - Which tokens the user has added to the Clove wallet "localstorage.activeTokens"
//   - The public key and key info for each token if it exists "localstorage.privKeys"
   
  if (storageUnlocked()){
    let allTokens = getSuppotedTokens();
    const privKeys = getPrivateKeys();
    const activeTokens = getActiveTokens();

    for(let key in allTokens) {
      //Add active status of token (these will be shown in the user's main Clove screen)
      activeTokens.includes(key) ? allTokens[key].active = true : allTokens[key].active = false;

      //Add the key info to each token
      if (privKeys[key]) {
        allTokens[key]['keys'] = {}
        for (let publicKey in privKeys[key]) {
            allTokens[key]['keys'][publicKey] = privKeys[key][publicKey];

            //don't send private key to UI. We will send the private key to the UI from a different
            //method only after the user re-enters their password.
            allTokens[key]['keys'][publicKey].privatekey = null;
        }
      }
    }
    return allTokens;
  }else{
    throw new Error('Storage is locked');
  }  
}

exports.setActiveToken = (tokenKey) => {
// Added the tokenKey to the list of tokens that will exists on the user's Clove page
  let activeTokens = getActiveTokens();
  activeTokens.push(tokenKey);
  saveActiveTokens(activeTokens);
}

exports.getActiveTokens = () => {
  // Added the tokenKey to the list of tokens that will exists on the user's Clove page
    return getActiveTokens()
  }

exports.removeActiveToken = (tokenKey) => {
// Removes the tokenKey from the list of tokens that will exists on the user's Clove page
  let activeTokens = getActiveTokens();
  let filtered = activeTokens.filter(function(value, index, arr){
    return !(value === tokenKey);
  });
  saveActiveTokens(filtered);
}

exports.addKey = (tokenKey, networkSymbol, privateKey, label) => {
  // Accepts a private key entered by the user and attempts to match it to the proper network
  // to get the public key.  If it's able to it will store the keypair in localStorage.privKeys
  // and return the public key back to the UI.
  // We are also storing balance and price to localStorage, to be populated by future updates.
  
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
    const privKeys = getPrivateKeys();
    //Initialize object if it does not exist
    privKeys[tokenKey] = privKeys[tokenKey] || {};

    if (privKeys[tokenKey][publicKey]) {
      throw new Error(`This address already exists in your ${networkSymbol} wallet`);
    } else {
      //Save keypait to localStorage and return public key to UI
      privKeys[tokenKey][publicKey] = {privatekey, label, balance: 0, price: 0};
      savePrivateKeys(privKeys);

      return publicKey;
    }
  }else{
    throw new Error('Storage is locked');
  }
};

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
