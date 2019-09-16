import { readable, writable, derived } from 'svelte/store';
import { API, makeBalancesPost } from './api.js';
import { defaultSettings, defaultCoinStore, coin, pubkey } from './defaults.js'

//Environment constents
export const CURRENT_KS_VERSION = writable("1.0");

const createCoinStore = (key, startValue) => {
    const { subscribe, set, update } = writable(startValue);
    
    return {
        startValue,
        subscribe,
        set,
        update,
        useLocalStorage: () => {  
            const json = localStorage.getItem(key);
            if (json) {
                let returnstr = JSON.parse(json)
                set(returnstr);
            }
            
            subscribe(current => {
                localStorage.setItem(key, JSON.stringify(current));
            });
        },
        reset: () => {
            set(startValue)
        },
        updateBalances: (storeValue) => {
            console.log('!! REFRESHING BALANCES !!')
            const postObj = makeBalancesPost(storeValue);

            if (postObj){
                return API('POST', 'get-balances', "", postObj)
                .then(data => {
                    update (currentStore => {
                        for (const index in data.value){
                            const coin = data.value[index];
                            if (currentStore[coin.network]){
                                if (currentStore[coin.network][coin.network_symbol]){
                                    if (currentStore[coin.network][coin.network_symbol].pubkeys[coin.wallet_address]){
                                        if (coin.token_address){
                                            if (currentStore[coin.network][coin.network_symbol].pubkeys[coin.wallet_address].tokens[coin.token_symbol]){
                                                currentStore[coin.network][coin.network_symbol].pubkeys[coin.wallet_address].tokens[coin.token_symbol].balance = parseFloat(coin.balance);
                                            }
                                        }else{
                                            currentStore[coin.network][coin.network_symbol].pubkeys[coin.wallet_address].balance = parseFloat(coin.balance);
                                        }
                                    }
                                }
                            }
                        }
                        return currentStore
                    });
                })
                .catch(e => console.log(e))
            }
		},
    };
}

const createLocalStore = (key, startValue) => {
    const { subscribe, set, update } = writable(startValue);
    
    return {
        startValue,
        subscribe,
        set,
        update,
        useLocalStorage: () => {  
            const json = localStorage.getItem(key);
            if (json) {
                let returnstr = JSON.parse(json)
                set(returnstr);
            }
            
            subscribe(current => {
                localStorage.setItem(key, JSON.stringify(current));
            });
        },
        reset: () => {
            set(startValue)
        }
    };
}

//MISC Stores
export const loggedIn = writable(true);

export const Hash = createLocalStore('Hash', { 'encode' : undefined });

export const defaultOjects = readable({coin, pubkey});

//export const totalUsdBal = writable(0);

// Coin Stores
export const CoinStore = createCoinStore('networks', defaultCoinStore);

export const coinList = derived(
	CoinStore,
    ($CoinStore) => {
        let coinList = [];
        for (const [netKey, network] of Object.entries($CoinStore) ){
            for (const [coinKey, coin] of Object.entries(network)){
                for (const [pubKey, pubKeyInfo] of Object.entries(coin.pubkeys)){
                    let coinInfo = {
                        network: netKey,
                        name: coin.name,
                        symbol: coin.symbol,
                        nickname: pubKeyInfo.nickname,
                        vk : pubKeyInfo.vk,
                        sk : pubKeyInfo.sk,
                        balance : pubKeyInfo.balance,
                        USD_value : pubKeyInfo.USD_value,
                    }
                    coinList.push(coinInfo);
                    if (pubKeyInfo.tokens){
                        let tokenInfo = JSON.parse(JSON.stringify(coinInfo))
                        for (const [token, tokenValue] of Object.entries(pubKeyInfo.tokens)){
                            tokenInfo.token = true,
                            tokenInfo.tokenDetails = tokenValue,
                            tokenInfo.balance = tokenValue.balance || 0;
                            tokenInfo.USD_value = tokenValue.USD_value || 0;
                        }
                        coinList.push(tokenInfo);
                    }
                }
            }
        }
        console.log(coinList)
        return coinList;
    }
);

export const numberOfCoins = derived(
    coinList,
    $coinList => $coinList.length
);

export const allTotals = derived(
    CoinStore,
    ($CoinStore) => {
        let majorTotals = {'wallets':0,'USD_value':0,'coins':0};
        let coinTotals = {};
        for (const [netKey, network] of Object.entries($CoinStore) ){
            for (const [coinKey, coin] of Object.entries(network)){
                let totalTracker = {};
                majorTotals.coins += 1;
                coinTotals[coin.network] = coinTotals[coin.network] || {};
                coinTotals[coin.network][coin.symbol] = coinTotals[coin.network][coin.symbol] || {};
                for (const [pubKey, pubKeyInfo] of Object.entries(coin.pubkeys)){
                    totalTracker.balance += pubKeyInfo.balance;
                    totalTracker.USD_value += pubKeyInfo.USD_value;
                    totalTracker.numOfWallets += 1;
                    majorTotals.wallets += 1;
                    majorTotals.USD_value += pubKeyInfo.USD_value;
                }
                coinTotals[coin.network][coin.symbol] = totalTracker;
            }
        }
        return {majorTotals, coinTotals};
    }
);

//Settings Stores
export const SettingsStore = createLocalStore('settings', defaultSettings);
SettingsStore.useLocalStorage();

export const currentPage = derived(
	SettingsStore,
	$SettingsStore => loggedIn ? $SettingsStore.currentPage : {'name' : 'LockScreen', 'data' : {} }
);

export const firstRun = derived(
	SettingsStore,
	$SettingsStore => $SettingsStore.firstRun
);

export const themeStyle = derived(
	SettingsStore,
	$SettingsStore => $SettingsStore.themeStyle
);

/*

Store Structure
global variables:
- password (str)
- loggedIn (Bool)

Stores Needed:
Token Stores - All the information about the tokens currently added to the wallet
    network: {
        'bitcoin': {
            'LTC':{
                name: 'litecoin',
                testnet: false,
                'symbol': 'LTC',
                'pubkeys': {
                    pubkey_address_1:{
                        'nickname': 'First LTC wallet',
                        'address': pubkey_address,
                        'balance': 0.33,
                        'USD_value' : 10,
                        'privkey' : encrypted private key

                    },
                    pubkey_address_2:{
                        'nickname': 'Second LTC wallet',
                        'address': pubkey_address,
                        'balance': 0.57,
                        'USD_value' : 50,
                        'privkey' : encrypted private key
                    },
                },
                'market_info': {
                    'market_cap' : 1580666,
                    'price' : 0.011115,
                    'volume' : 8515,
                    'circ_supply' : 142215728
                    'price_change_24h' : -4.14
                },
                'total_value' : 0.6,
                'total_USD_value': 60
            },
            'BTC':{
                ...
            }
        }
    }

Settings Store:
    settings: {
        last_page: 'coins',
        theme: 'dark',
    }

Transactions Store - Transaction History
    transactions: {
        //Example Bitcoin transaction
        date_timestamp : {
            network: 'bitcoin',
            name: 'litecoin',
            symbol: 'LTC',
            pubkey: pubkey_address,
            to: recipient_address,
            value: 0.1,
            details: [{'fee': 0.001}],
            'created': date_timestamp,
            'submitted': date_timestamp,
            'confirmed': date_timestamp,
            'txUrl': transaction_url,
            'result': 'success', 'failure', 'pending',
        },
        // Example Ethereum Token Transaction
        date_timestamp : { 
            network: 'ethereum',
            name: 'Lamden TAU',
            symbol: 'TAU',
            'tokenAddress': "0xFa29E36A7eb4dBaE9ed93D803e5Bf95ae9772A27",
            pubkey: pubkey_address,
            to: recipient_address,
            value: 0.1,
            details: [{'gasprice': 1000000000}, {'gas_limit' : 36496}, {"nonce": 12}],
            'created': date_timestamp,
            'submitted': date_timestamp,
            'confirmed': date_timestamp,
            'txUrl': transaction_url,
            'result': 'success', 'failure', 'pending',
        },
        // Example Ethereum Transaction
        date_timestamp : { 
            network: 'ethereum',
            name: 'ethereum',
            symbol: 'ETH',
            'tokenAddress': null,
            pubkey: pubkey_address,
            to: recipient_address,
            value: 0.6,
            details: [{'gasprice': 1000000000}, {'gas_limit' : 31000}],
            'created': date_timestamp,
            'submitted': date_timestamp,
            'confirmed': date_timestamp,
            'txUrl': transaction_url,
            'result': 'success', 'failure', 'pending',
        }
    }
const testNetworks = {
    'bitcoin': {
        'LTC':{
            'name': 'litecoin',
            'testnet': false,
            'symbol': 'LTC',
            'pubkeys': {
                'pubkey_address_1':{
                    'nickname': 'First LTC wallet',
                    'address': 'pubkey_address',
                    'balance': 0.1,
                    'USD_value' : 10,
                    'privkey' : 'encrypted',

                },
                'pubkey_address_2':{
                    'nickname': 'Second LTC wallet',
                    'address': 'pubkey_address',
                    'balance': 0.5,
                    'USD_value' : 50,
                    'privkey' : 'encrypted',
                },
            },
            'market_info': {
                'market_cap' : 1580666,
                'price' : 0.011115,
                'volume' : 8515,
                'circ_supply' : 142215728,
                'price_change_24h' : -4.14,
            },
            'total_value' : 0.6,
            'total_USD_value': 60,
        },
        'BTC':{
            'name': 'bitcoin',
            'testnet': false,
            'symbol': 'BTC',
            'pubkeys': {
                'pubkey_address_1':{
                    'nickname': 'First BTC wallet',
                    'address': 'pubkey_address',
                    'balance': 0.1,
                    'USD_value' : 10,
                    'privkey' : 'encrypted',

                },
                'pubkey_address_2':{
                    'nickname': 'Second BTC wallet',
                    'address': 'pubkey_address',
                    'balance': 0.5,
                    'USD_value' : 50,
                    'privkey' : 'encrypted',
                },
            },
            'market_info': {
                'market_cap' : 1580666,
                'price' : 0.011115,
                'volume' : 8515,
                'circ_supply' : 142215728,
                'price_change_24h' : -4.14,
            },
            'total_value' : 0.6,
            'total_USD_value': 60,
        }
    },
    'ethereum': {
        'ETH':{
            'name': 'ethereum',
            'testnet': false,
            'symbol': 'ETH',
            'pubkeys': {
                'pubkey_address_1':{
                    'nickname': 'First ETH wallet',
                    'address': 'pubkey_address',
                    'balance': 0.1,
                    'USD_value' : 10,
                    'privkey' : 'encrypted',
                    'tokens' :

                },
                'pubkey_address_2':{
                    'nickname': 'Second ETH wallet',
                    'address': 'pubkey_address',
                    'balance': 0.5,
                    'USD_value' : 50,
                    'privkey' : 'encrypted',
                },
            },
            'market_info': {
                'market_cap' : 1580666,
                'price' : 0.011115,
                'volume' : 8515,
                'circ_supply' : 142215728,
                'price_change_24h' : -4.14,
            },
            'total_value' : 0.6,
            'total_USD_value': 60,
        },
        'TAU':{
            'name': 'Lamden TAU',
            'testnet': false,
            'symbol': 'TAU',
            'pubkeys': {
                'pubkey_address_1':{
                    'nickname': 'First TAU wallet',
                    'address': 'pubkey_address',
                    'balance': 0.1,
                    'USD_value' : 10,
                    'privkey' : 'encrypted',

                },
                'pubkey_address_2':{
                    'nickname': 'Second TAU wallet',
                    'address': 'pubkey_address',
                    'balance': 0.5,
                    'USD_value' : 50,
                    'privkey' : 'encrypted',
                },
            },
            'market_info': {
                'market_cap' : 1580666,
                'price' : 0.011115,
                'volume' : 8515,
                'circ_supply' : 142215728,
                'price_change_24h' : -4.14,
            },
            'total_value' : 0.6,
            'total_USD_value': 60,
        },
    }
}
*/