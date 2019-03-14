const ks = require('./key_storage');

let ETHpubkey = ks.addKeyTest('LamdenTAU', '49f876a17dc1c3ffe94e688db8513c817208789fb8b811042c8189283195bc1f');
console.log(ETHpubkey);

let BTCpubKey = ks.addKeyTest('BitcoinBTC', 'L55r8d3apuqyZ3Ly47BEFA4hiC6w5b8F7v3LufXgv67QLD2Gf2gs');
console.log(BTCpubKey);

