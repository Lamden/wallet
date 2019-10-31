import { writable, get, derived } from 'svelte/store';
import { API, makeBalancesPost } from '../api.js';
import { currencyCode, MarketInfoStore } from './stores.js';

const createCoinStore = (key, startValue) => {
    const CoinStore = writable(startValue);
    let subscribe = CoinStore.subscribe;
    let update = CoinStore.update;
    let set = CoinStore.set;

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
            const json = localStorage.getItem(key);
            if (json) {
                let returnstr = JSON.parse(json)
                set(returnstr);
            }
            set(startValue)
        },
        getCoin: (coin) => {
            return get(CoinStore).find( f => {
                if (coin.is_token){
                    return f.network === coin.network && f.token_address === coin.token_address && f.vk === coin.vk;
                }
                return  f.network === coin.network && f.symbol === coin.symbol && f.vk === coin.vk;
            });
        },
        updateBalances: (storeValue) => {
            console.log('!! REFRESHING BALANCES !!')
            const postObj = makeBalancesPost(storeValue);

            if (postObj){
                return API('POST', 'get-balances', "", postObj)
                .then(balances => {
                    console.log(balances)
                    update (coinstore => {
                        balances.value.map(b => {
                            let coin = coinstore.find(f =>  f.network_symbol === b.network_symbol &&
                                                            f.symbol === b.symbol &&  
                                                            f.vk === b.wallet_address)
                            if(coin) coin.balance = b.balance;
                        })
                        console.log('!! BALANCES REFRESHED !!')
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
export const CoinStore = createCoinStore('coins', []);

export const numberOfCoins = derived(
    CoinStore,
    $CoinStore => $CoinStore.length
);

export const allTotals = derived(
    CoinStore,
    $CoinStore => {
        let majorTotals = {'fiat_value':0, 'coins':$CoinStore.length};
        let marketInfo = get(MarketInfoStore)
        let code = get(currencyCode)
        $CoinStore.map(coin =>{
            if (!coin.network_symbol.includes('TESTNET')){
                if (coin.balance && coin.balance !== undefined){
                    try{
                        let coin_value = marketInfo[coin.symbol].quote[code].price;
                        majorTotals.fiat_value += (coin_value * coin.balance);
                    } catch (e){
                        null
                    }
                }
            }
        })
        return majorTotals;
    }
);

export const symbolList = derived(
    CoinStore,
    ($CoinStore) => {
        let symbols = [];

        $CoinStore.map(coin =>{
            if (!coin.symbol.includes('TESTNET')) symbols.push(coin.symbol);
        })
        return Array.from(new Set(symbols));
    }
);