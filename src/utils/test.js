/*
const ks = require('./key_storage');
const nodeCryptoJs = require('node-cryptojs-aes');


const { CryptoJS, JsonFormatter } = nodeCryptoJs;

let password = 'JeffPass'

let tokenKey = 'BitcoinBTC';
let pubKey = "8d88s7s7a6d6f78h5a3a2s5d7f8fd9d0d9s8s6s5s";
let pubKey2 = "d88s7s7a6d6f78h5a38d8aslkjdsfljasdpjfiss";
let privateKey = "d88s7s7a6d6f78h5a3a2s5d7f8fd9d0d9s8sa286s5s";
let label = "JEFF BTC";
let label2 = "JEFF BTC22222";

let privKeys = {};
privKeys[tokenKey] = {};
privKeys[tokenKey]['8d88s7s7a6d6f78h5a3a2s5d7f8fd9d0d9s8s6s5s'] = {privateKey, label, balance: 0, uiDefault:false};
privKeys[tokenKey]['d88s7s7a6d6f78h5a38d8aslkjdsfljasdpjfiss'] = {privateKey, label: label2, balance: 0, uiDefault:false};

console.log(privKeys);
delete privKeys[tokenKey][pubKey2];
console.log(privKeys);
*/

const tauWallet = require('./wallet');
console.log(tauWallet.get_vk('9decc7f7f0b5a4fc87ab5ce700e2d6c5d51b7565923d50ea13cbf78031bb3acf'));
