import { writable, get, derived } from 'svelte/store';

import * as validators from 'types-validate-assert'
const { validateTypes } = validators; 
import { copyItem } from './stores.js';
import { isCoinInfoObj } from '../objectValidations';

export const createCoinStore = () => {
    let initialized = false;

    const getStore = () => {
        //Set the Coinstore to the value of the chome.storage.local
        chrome.storage.local.get({"coins": []}, function(getValue) {
            initialized = true;
            console.log(getValue.coins)
            CoinStore.set(getValue.coins)
        });
    }

    //Create Intial Store
    const CoinStore = writable([]);
    /*
    //This is called everytime the CoinStore updated
    CoinStore.subscribe(current => {
        if (!initialized) {
            return current
        }
        //Only accept and Array Object to be saved to the storage and only
        //if store has already been initialized
        if (validateTypes.isArray(current)) {
            console.log('setting to storage from CoinStore')
            console.log(current)
            //chrome.storage.local.set({"coins": current});
        }else{
            //If non-object found then set the store back to the previous local store value
            getStore()
            console.log('Recovered from bad Coin Store Value')
        }
    });
*/
    chrome.storage.onChanged.addListener(function(changes) {
        for (let key in changes) {
            console.log(changes)
            if (key === 'coins') {
                console.log('setting CoinStore from listener')
                if (JSON.stringify(changes[key].newValue) !== JSON.stringify(get(CoinStore))) {
                    CoinStore.set(changes[key].newValue)
                }
            }
        }
    });

    //Set the Coinstore to the value of the chome.storage.local
    getStore()

    let subscribe = CoinStore.subscribe;
    let update = CoinStore.update;
    let set = CoinStore.set;

    return {
        subscribe,
        set,
        update,
        //Add a coin to the internal coin storage
        addCoin: (coinInfo) => {
            //Reject missing or undefined arguments
            if (!isCoinInfoObj(coinInfo)) return {added: false, reason: 'badArg'};

            //Set the coin to watch only if no private key supplied
            if (!coinInfo.sk) coinInfo.sk = 'watchOnly'
            
            coinInfo = copyItem(coinInfo);
            //Check if the coin already exists in coinstore
            let coinFound = get(CoinStore).find( f => {
                return f.network === coinInfo.network && f.symbol === coinInfo.symbol && f.vk === coinInfo.vk;
            });
            if (!coinFound){
                //If the coin doesn't exists then push it to the array
                CoinStore.update(coinstore => {
                    coinstore.push(coinInfo)
                    chrome.storage.local.set({"coins": coinstore});
                    return coinstore;
                })
                return {added: true, reason: 'new'}
            } else {
                //Check if we need to update the sk of a previously added "watch only" coin
                if (coinFound.sk === "watchOnly" && coinInfo.sk !== "watchOnly"){
                    CoinStore.update(coinstore => {
                        coinstore.map( coin => {
                            if(coin.network === coinInfo.network && coin.symbol === coinInfo.symbol && coin.vk === coinInfo.vk){
                                coin.sk = coinInfo.sk;
                            }
                        });
                        chrome.storage.local.set({"coins": coinstore});
                        return coinstore;
                    })
                    return {added: true, reason: `${coinFound.nickname}'s Private Key Updated`}
                } else {
                    //Reject adding a dupliate Coin
                    return {added: false, reason: 'duplicate'}
                }
            }
        },
        //Retrive a specific coin from the Coin Store
        getCoin: (vk) => {
            //Reject missing or undefined arguments
            if (!validateTypes.isStringWithValue(vk)) return;

            //Return the matching coin (will be undefined if not matched)
            return get(CoinStore).find( f => f.vk === vk);
        }
    };
}
//Create CoinStore instance
export const CoinStore = createCoinStore();

//Create a derived store to total all wallets
export const balanceTotal = derived(CoinStore, ($CoinStore) => {
    let totals = {};
    $CoinStore.forEach(coin =>{
        if (coin.balances){
            Object.keys(coin.balances).forEach(key => {
                if (!totals[key]) totals[key] = 0;
                totals[key] = totals[key] + coin.balances[key];
            })
        }
    })
    return totals;
});

//Create a derived store to total all wallets
export const coinsDropDown = derived(CoinStore, ($CoinStore) => {
    let returnList = [{
        value: undefined,
        name: `Select Wallet`,
        selected: true
    }]
    $CoinStore.map(c => {
        returnList.push({
            value: c,
            name: `${c.nickname} \n${c.vk.substring(0, 52)}...`,
            selected: false
        })
    })
    return returnList
});