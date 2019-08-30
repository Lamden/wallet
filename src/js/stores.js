import { readable, writable, derived } from 'svelte/store';
import { defaultSettings, defaultCoinStore, coin, pubkey } from './defaults.js'

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
export const firstRun = writable(true);
export const loggedIn = writable(false);

export const Hash = createLocalStore('Hash', { 'encode' : undefined });
Hash.useLocalStorage();

export const defaultOjects = readable({coin, pubkey});

//export const totalUsdBal = writable(0);

// Coin Stores
export const CoinStore = createLocalStore('networks', defaultCoinStore);

export const coinList = derived(
	CoinStore,
	$CoinStore => [...Object.entries($CoinStore.bitcoin), ...Object.entries($CoinStore.ethereum)]
);

export const numberOfCoins = derived(
    coinList,
    $coinList => $coinList.length
);

export const coinTotals = derived(
    coinList,
    ($coinList) => {
        let totals = {'wallets':0,'USD_value':0,'coins':$coinList.length};
        for (let coin in $coinList){
            for (let pubkey in $coinList[coin][1].pubkeys){
                totals.wallets += 1;
                totals.USD_value += $coinList[coin][1].pubkeys[pubkey].USD_value;
            }
        }
        totals.USD_value = "$" + totals.USD_value.toFixed(2)
        return totals;
    }

);

export const totalUsdBal = derived(
    coinList,
    ($coinList) => {
        let total = 0;
        for (let coin in $coinList){
            for (let pubkey in $coinList[coin][1].pubkeys){
                total += $coinList[coin][1].pubkeys[pubkey].USD_value
            }
        }
        return total;
    }

);

//Settings Stores
export const SettingsStore = createLocalStore('settings', defaultSettings);
SettingsStore.useLocalStorage();

export const currentPage = derived(
	SettingsStore,
	$SettingsStore => loggedIn ? $SettingsStore.currentPage : {'name' : 'LockScreen', 'data' : {} }
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
                        'label': 'First LTC wallet',
                        'address': pubkey_address,
                        'balance': 0.33,
                        'USD_value' : 10,
                        'privkey' : encrypted private key

                    },
                    pubkey_address_2:{
                        'label': 'Second LTC wallet',
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
                    'label': 'First LTC wallet',
                    'address': 'pubkey_address',
                    'balance': 0.1,
                    'USD_value' : 10,
                    'privkey' : 'encrypted',

                },
                'pubkey_address_2':{
                    'label': 'Second LTC wallet',
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
                    'label': 'First BTC wallet',
                    'address': 'pubkey_address',
                    'balance': 0.1,
                    'USD_value' : 10,
                    'privkey' : 'encrypted',

                },
                'pubkey_address_2':{
                    'label': 'Second BTC wallet',
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
                    'label': 'First ETH wallet',
                    'address': 'pubkey_address',
                    'balance': 0.1,
                    'USD_value' : 10,
                    'privkey' : 'encrypted',

                },
                'pubkey_address_2':{
                    'label': 'Second ETH wallet',
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
                    'label': 'First TAU wallet',
                    'address': 'pubkey_address',
                    'balance': 0.1,
                    'USD_value' : 10,
                    'privkey' : 'encrypted',

                },
                'pubkey_address_2':{
                    'label': 'Second TAU wallet',
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