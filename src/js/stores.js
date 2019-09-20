import { readable, writable, derived } from 'svelte/store';
import { API, makeBalancesPost } from './api.js';
import { defaultSettings, defaultCoinStore, coin, pubkey, token } from './defaults.js'

//Environment constents
export const CURRENT_KS_VERSION = writable("1.0");

const createCoinStore = (key, startValue) => {
    const { subscribe, set, update } = writable(startValue);

    const getCoin = (coin, coinstore) => {
        if (coin.is_token){
            return coinstore.find(f=> f.network === coin.network && f.token_address === coin.token_address && f.vk === coin.vk);
        }
        return  coinstore.find(f=> f.network === coin.network && f.symbol === coin.symbol && f.vk === coin.vk);
    }
    
    return {
        startValue,
        subscribe,
        set,
        update,
        getCoin,
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
                .then(balances => {
                    update (coinstore => {
                        for (const item of balances.value){
                            let coin;
                            if (item.token_address){
                                coin = coinstore.find(f=> f.network === item.network && f.token_address === item.token_address && f.vk === item.wallet_address);
                            }else{
                                coin = coinstore.find(f=> f.network === item.network && f.network_symbol === item.symbol && f.vk === item.wallet_address);
                            }
                            if(coin) coin.balance=item.balance;
                        }
                        console.log('!! REFRESHED !!')
                        return coinstore;
                    });
                })
                .catch(e => console.log(e))
            }
        },
        updateCoinTransaction: (coinToUpdate, tx_info) => {
            update(coinstore => {
                let coin = getCoin(coinToUpdate, coinstore)
                coin.txList = !coin.txList ? [tx_info] : [...coin.txList, tx_info];
                return coinstore;
            })
        }
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

export const defaultOjects = readable({coin, pubkey, token});

//export const totalUsdBal = writable(0);

// Coin Stores
export const CoinStore = createCoinStore('coins', []);

export const numberOfCoins = derived(
    CoinStore,
    $CoinStore => $CoinStore.length
);

export const allTotals = derived(
    CoinStore,
    ($CoinStore) => {
        let majorTotals = {'USD_value':0, 'coins':$CoinStore.length};
        $CoinStore.map(coin =>{
            majorTotals.USD_value += coin.USD_value;
        })
        return majorTotals;
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