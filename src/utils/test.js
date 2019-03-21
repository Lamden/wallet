const ks = require('./key_storage');
const tokenInfo = require('./token_info');
const ethNetworks = require('./ethereum_networks');
const sign = require('./sign');
/*
rawTx = '01000000015f49128f812dc9d25be25cd693220e43672d78059366768d7b37e9aa9de7d9ac01000000000000000002c0d401000000000017a914951e3e57195e2f26f70dca15b1170ed394655f77879c4d2200000000001976a9144dc9b0ea4af3b0bec33c9406dcbb48013d86eb4788ac00000000'
key = 'L55r8d3apuqyZ3Ly47BEFA4hiC6w5b8F7v3LufXgv67QLD2Gf2gs'
network ='BTC'

signedTx = sign.signTx(
  rawTx,
  key,
  network,)
  
console.log(signedTx);
*/
rawTx2 = 'f8681e84b2d05e0082778394c27a2f05fa577a83ba0fdb4c38443c071835650180b844095ea7b30000000000000000000000000ff1c3dd4b262a0324910a6e30caa182204d91630000000000000000000000000000000000000000000000056bc75e2d63100000808080'
key2 = '49f876a17dc1c3ffe94e688db8513c817208789fb8b811042c8189283195bc1f'
network2 ='ETH'

let ethtx = sign.signEthereumTx(rawTx2, key2);

console.log(ethtx)



