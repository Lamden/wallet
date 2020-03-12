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
            CoinStore.set(getValue.coins)
        });
    }

    //Create Intial Store
    const CoinStore = writable([]);

    chrome.storage.onChanged.addListener(function(changes) {
        for (let key in changes) {
            if (key === 'coins') {
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