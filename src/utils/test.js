const ks = require('./key_storage');
const tokenInfo = require('./token_info');
const ethNetworks = require('./ethereum_networks');
const sign = require('./sign');

try{
  ks.getPrivateKey_FromPublic('1DzS1ukkaJCbMydLcyQFaow5sWCipR5v4F')
}catch(e){
  console.log(e.message);
}



