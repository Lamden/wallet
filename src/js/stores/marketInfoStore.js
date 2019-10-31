import { writable, derived, get } from 'svelte/store';
import { API } from '../api.js';
import { symbolList, currencyCode, CoinStore } from './stores.js';

const createMarketInfoStore = (key, startValue) => {
    const MarketInfo = writable(startValue);
    let subscribe = MarketInfo.subscribe;
    let update = MarketInfo.update;
    let set = MarketInfo.set;

    return {
        startValue,
        subscribe,
        set,
        update,
        useLocalStorage: () => {  
            const json = localStorage.getItem(key);
            if (json) {
                let returnstr = '';
                try {
                    returnstr = JSON.parse(json)
                } catch (e) {
                    console.log('MarketInfo store corrupted, recreating')
                    set(startValue);
                }
                set(returnstr);
            }
            
            subscribe(current => {
                localStorage.setItem(key, JSON.stringify(current));
            });
        },
        reset: () => {
            set(startValue)
        },
        refresh_marketInfo(){
            console.log('!! REFRESHING MARKET INFO !!')
            let symbols = get(symbolList)
            if ( symbols.length > 0 ){
                return API('POST', 'get-prices', "", {"symbol_list": symbols, "currency_symbol" : get(currencyCode) })
                .then(info => {
                    set (info.value.data);
                })
                .catch(e => console.log(e))
            }            
        }
    };
}

//Settings Stores
export const MarketInfoStore = createMarketInfoStore('marketInfo', {});

export const fiatWalletTotal = derived(
    MarketInfoStore,
    $MarketInfoStore => {
        let fiatTotal = 0;
        let coinstore = get(CoinStore)
        let code = get(currencyCode)
        coinstore.map(coin =>{
            if (!coin.network_symbol.includes('TESTNET')){
                if (coin.balance && coin.balance !== undefined){
                    try{
                        let coin_value = $MarketInfoStore[coin.symbol].quote[code].price;
                        fiatTotal += (coin_value * coin.balance);
                    } catch (e){
                        null
                    }
                }
            }
        })
        return fiatTotal;
    }
);