import { writable, get, derived } from 'svelte/store';

const createCoinStore = (key, startValue) => {
    const json = localStorage.getItem(key);
    if (json) {
        startValue = JSON.parse(json)
    }
    const CoinStore = writable(startValue);
    CoinStore.subscribe(current => {
        localStorage.setItem(key, JSON.stringify(current));
    });
    
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