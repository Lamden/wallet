const ks = require('./key_storage');

let allTokens = {
    BitcoinBTC: 
           {name: "Bitcoin",
           active: null,
           symbol: "BTC",
           balance: 5.12345678,
           icon: "/icons/tokens/BTC-c.svg",
           color: {color:"#f2a900"}},
    EthereumETH: 
           {name: "Ethereum",
           active: null,
           symbol: "ETH",
           balance: 12.12345678,
           icon: "/icons/tokens/ETH-c.svg",
           color: {color:"#3c3c3d"}},
    LitecoinLTC: 
           {name: "Litecoin",
           active: null,
           symbol: "LTC", 
           balance: 130.12345678, 
           icon: "/icons/tokens/LTC-c.svg", 
           color: {color:"#8d8d8d"}}
}

let activeTokens = ['BitcoinBTC', 'EthereumETH','LiteCoinLTC']

let privKeys = {BitcoinBTC: {'0923u09234203q9u0wq9uf4g45eyrtyh': {privatekey: null, label:"BTC-Jeff"}}}

for(var key in allTokens) {
    activeTokens.includes(key) ? allTokens[key].active = true : null;
    if (privKeys[key]) {
        for (var address in privKeys[key]) {
            allTokens[key].keys = [];
            allTokens[key].keys.push({public: address, label: privKeys[key][address].label});
        }
    }
}
console.log (allTokens);

for(var key in allTokens) {
    console.log(allTokens[key].keys);
}
