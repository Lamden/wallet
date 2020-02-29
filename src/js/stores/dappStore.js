import { writable } from 'svelte/store';

import * as validators from 'types-validate-assert'
const { validateTypes } = validators; 

export const createDappStore = () => {
    let initialized = false;
    let startValue = {};

    const getStore = () => {
        //Set the Coinstore to the value of the chome.storage.local
        chrome.storage.local.get({"dapps": startValue}, function(getValue) {
            initialized = true;
            DappStore.set(getValue.dapps)
        });
    }

    //Create Intial Store
    const DappStore = writable(startValue);

    //This is called everytime the DappStore updated
    DappStore.subscribe(current => {
        if (!initialized) {
            return current
        }
        // Dapp Store should only every accept an array
        // if store has already been initialized
        if (validateTypes.isObject(current)){
            chrome.storage.local.set({"dapps": current});
        }else{
            //If non-object found then set the store back to the previous local store value
            getStore();
            console.log('Recovered from Bad Dapps Store Value')
        }
    });

    chrome.storage.onChanged.addListener(function(changes) {
        for (let key in changes) {
            if (key === 'dapps') {
                if (changes[key].newValue !== get(DappStore)) DappStore.set(changes[key].newValue)
            }
        }
    });

    //Get the value of the dapp Store from chome.storage.local
    getStore()

    let subscribe = DappStore.subscribe;
    let update = DappStore.update;
    let set = DappStore.set;

    return {
        subscribe,
        set,
        update
    };
}

//Networks Stores
export const DappStore = '' //createDappStore();

