const ks = require('./key_storage');
const tokenInfo = require('./token_info');
const ethNetworks = require('./ethereum_networks');

//console.log(ks.genEthKey('ETH'));
//console.log(ks.genBtcKey('BTC'));

//console.log(ks.generateWallet('BitcoinBTC'))

/*
for (let token in tokenInfo){
  console.log('Creating wallet for ' + tokenInfo[token].name)
  console.log(ks.generateWallet(token))
}*/

let tokenKey1 = ethNetworks['TAU'].tokenKey || null;

if (ethNetworks['XXX']){
  console.log(ethNetworks['XXX'].tokenKey)
}

if (ethNetworks['TAU']){
  console.log(ethNetworks['TAU'].tokenKey)
}


//if (tokenKey2){console.log(tokenKey2)}