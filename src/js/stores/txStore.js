import { writable, get } from 'svelte/store';

import * as validators from 'types-validate-assert'
const { validateTypes } = validators; 

import { networkKey } from './stores.js';
import { isNetworkObj } from '../objectValidations';

const createTxStore = () => {
    let initialized = false;

    const getStore = () => {
        //Set the Coinstore to the value of the chome.storage.local
        chrome.storage.local.get({"txs": {}}, function(getValue) {
            initialized = true;
            TxStore.set(getValue.txs)
        });
    }

    //Create TxStore with the inital value
    const TxStore = writable({});
    
    //This is called everytime the value of the store changes
    TxStore.subscribe(current => {
        if (!initialized) {
            return current
        }
        //Only accept object to be saved to the localstorage
        if (validateTypes.isObject(current)) {
            chrome.storage.local.set({"txs": current});
        }else{
            //If non-object found then set the store back to the previous local store value
            getStore()
            console.log('Recovered from bad Transaction Store Value')
        }
    });

    getStore();

    chrome.storage.onChanged.addListener((changes) => {
        for (let key in changes) {
            if (key === 'txs') {
                if (changes[key].newValue !== get(TxStore)) TxStore.set(changes[key].newValue)
            }
        }
    });
    
    let subscribe = TxStore.subscribe;
    let update = TxStore.update;
    let set = TxStore.set;
    

    return {
        subscribe,
        set,
        update,
        getTxList: (networkObj, vk) => {
            //Return if arguments are undefined and incorrect types
            if (!isNetworkObj(networkObj) || !validateTypes.isStringWithValue(vk)) return;

            //Create Network Key
            let netKey = networkKey(networkObj);

            //Get the txStore Value
            let txstore = get(TxStore);

            //Return empty lists if the keys can't be found
            if (!txstore[netKey]) return [];
            if (!txstore[netKey][vk]) return [];

            //List is found so return it
            return txstore[netKey][vk]
        },
        clearTx: (networkObj, vk) => {
            //Return if arguments are undefined and incorrect types
            if (!isNetworkObj(networkObj) || !validateTypes.isStringWithValue(vk)) return;

            //Create network Key
            let netKey = networkKey(networkObj)
            
            TxStore.update(txstore => {
                //If the key paths don't exists then just return
                if (!txstore[netKey]) return txstore;
                if (!txstore[netKey][vk]) return txstore;

                //Set key to an empty Array
                txstore[netKey][vk] = [];
                return txstore;
            })
        },
    };
}

//Create TxStore
export const TxStore = createTxStore();