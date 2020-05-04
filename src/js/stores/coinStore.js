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
        addCoin: (coinInfo, callback) => {
            //Reject missing or undefined arguments
            if (!isCoinInfoObj(coinInfo))  callback({added: false, reason: 'badArg'});

            coinInfo = copyItem(coinInfo);
            //Check if the coin already exists in coinstore
            let coinFound = get(CoinStore).find( f => {
                return f.network === coinInfo.network && f.symbol === coinInfo.symbol && f.vk === coinInfo.vk;
            });
            if (!coinFound){
                if (coinInfo.sk === "watchOnly") {
                    chrome.runtime.sendMessage({type: 'coinStoreAddWatchOnly', data: coinInfo}, (coinInfo) => {
                        if (chrome.runtime.lastError) callback({added: false, reason: 'Error adding new coin to coinStore'})
                        else callback({added: true, reason: 'new'})
                    })
                }else{
                    //If the coin doesn't exists then push it to the array
                    chrome.runtime.sendMessage({type: 'coinStoreAddNewLamden', data: coinInfo.nickname}, (response) => {
                        if (chrome.runtime.lastError) callback({added: false, reason: 'Error adding new coin to coinStore'})
                        else callback({added: true, reason: 'new'})
                    })
                }

            } else {
                //Check if we need to update the sk of a previously added "watch only" coin
                if (coinFound.sk === "watchOnly" && coinInfo.sk !== "watchOnly"){
                    chrome.runtime.sendMessage({type: 'updateWatchedCoin', data: coinInfo}, () => {
                        callback({added: true, reason: `${coinFound.nickname}'s Private Key Updated`})
                    })        
                } else {
                    //Reject adding a dupliate Coin
                    callback({added: false, reason: 'duplicate'})
                }
            }
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
            name: `${c.nickname} ${c.vk}`,
            selected: false
        })
    })
    return returnList
});