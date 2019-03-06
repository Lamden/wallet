const ks = require('./key_storage');

console.log(

    ks.addKey('BitcoinBTC', 'BTC', 'L55r8d3apuqyZ3Ly47BEFA4hiC6w5b8F7v3LufXgv67QLD2Gf2gs', 'testingBTC')
)

/*
let allTokens = {
    BitcoinBTC: 
           {name: "Bitcoin",
           symbol: "BTC",
           balance: 5.12345678,
           icon: "/icons/tokens/BTC-c.svg",
           color: {color:"#f2a900"}},
    EthereumETH: 
           {name: "Ethereum",
           symbol: "ETH",
           balance: 12.12345678,
           icon: "/icons/tokens/ETH-c.svg",
           color: {color:"#3c3c3d"}},
    LitecoinLTC: 
           {name: "Litecoin",
           symbol: "LTC", 
           balance: 130.12345678, 
           icon: "/icons/tokens/LTC-c.svg", 
           color: {color:"#8d8d8d"}}
}

let activeTokens = ['BitcoinBTC', 'EthereumETH','LiteCoinLTC']
let privKeys = {}
let tokenKey = 'BitcoinBTC';

let privatekey1 = "thisisatestprivatekeyaddress";
let label1 = "Jeff's BTC address1";
let publicKey1 = "0923u09234203q9u0wq9uf4g45eyrtyh";


let privatekey2 = "anotherPrivateAddressthatwehave";
let label2 = "Jeff's second BTC address";
let publicKey2 = "0a22jja8fghalkasdf8233sd9d9ss0s9sjs9";


!privKeys[tokenKey] ? privKeys[tokenKey] || {};

privKeys[tokenKey][publicKey1] = {privatekey: privatekey1, label: label1, balance: 0, price: 0};
privKeys[tokenKey][publicKey2] = {privatekey: privatekey2, label: label2, balance: 0, price: 0};


for(var key in allTokens) {
    activeTokens.includes(key) ? allTokens[key].active = true : allTokens[key].active = false;
    if (privKeys[key]) {
        allTokens[key]['keys'] = {}
        for (var address in privKeys[key]) {
            allTokens[key]['keys'][address] = privKeys[key][address];
            allTokens[key]['keys'][address].privatekey = null;
        }
    }
}
console.log (allTokens);

*/