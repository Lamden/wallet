/* global localStorage */
const ethUtil = require('ethereumjs-util');
const keythereum = require('keythereum');
const bitcoin = require('bitcoinjs-lib')
const btcNetworks = require('./bitcoin_networks');
const ethNetworks = require('./ethereum_networks');
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

function addEthKey(networkSymbol) {
    /* ethKey = {
     *   privateKey: <Buffer ...>,
     *   iv: <Buffer ...>,
     *   salt: <Buffer ...>
    }*/
    const ethKey = keythereum.create({ keyBytes: 32, ivBytes: 16 });
    const ethPriv = ethKey.privateKey.toString('hex');
    addKey(networkSymbol, ethPriv);
}

function addBtcKey(networkSymbol) {
    var network;
    if (networkSymbol in btcNetworks) {
        network = btcNetworks[networkSymbol];
    } else {
        throw new Error("Network Symbol provided not supported")
    }
    // btcKey = <ECPair ...>
    const btcKey = bitcoin.ECPair.makeRandom({ network: network });
    const btcPriv = btcKey.toString('hex');
    addKey(networkSymbol, btcPriv);
}

function savePrivateKeys(keys) {
  const encrypted =
    CryptoJS.AES.encrypt(JSON.stringify(keys), password, { format: JsonFormatter }).toString();

  localStorage.setItem('privKeys', encrypted);
}

exports.unlockStorage = (pass) => {
  password = pass;
  try {
    getPrivateKeys();
  } catch (e) {
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
