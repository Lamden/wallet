import { writable, get } from 'svelte/store';
import { isObject, isStringWithValue, networkKey, isNetworkObj } from './stores.js';

const createCacheStore = (key, startValue) => {
    //get the local storage value of the cache store
    const json = localStorage.getItem(key);

    //If the value exists then set the store starting value to it
    if (json) {
        startValue = JSON.parse(json)
    }
    //Create Cache Store (starting value is {})
    const CacheStore = writable(startValue);

    //This is called every time the store value is updated
    CacheStore.subscribe(current => {
        //If the value it's trying to save isn't an object then
        //recover the localstorage value and save it to the store
        if (isObject(current)) {
            localStorage.setItem(key, JSON.stringify(current));
        }else{
            let json = localStorage.getItem(key)
            if (json) CacheStore.set(JSON.parse(json))
            console.log('Recovered from bad Cache Store Value')
        }
    });

    let subscribe = CacheStore.subscribe;
    let update = CacheStore.update;
    let set = CacheStore.set;

    return {
        startValue,
        subscribe,
        set,
        update,
        //Stores a network/contract pair so that we don't call the API again to check it
        addContract: (contractName, networkObj) => {
            //Reject missing or undefined arguments
            if (!isStringWithValue(contractName)) return;
            if (!isNetworkObj(networkObj)) return;

            let netKey = networkKey(networkObj)

            CacheStore.update(cacheStore => {
                //Store network / contract pair under the contracts key in the cash
                if (!cacheStore['contracts']) cacheStore['contracts'] = {};
                if (!cacheStore['contracts'][netKey]) cacheStore['contracts'][netKey] = {};
                cacheStore['contracts'][netKey][contractName] = true;
                return cacheStore;
            })
        },
        //Check if we have already called the API to check this contract name
        contractExists: (contractName, networkObj) => {
            //Reject missing or undefined arguments
            if (!isStringWithValue(contractName)) return;
            if (!isNetworkObj(networkObj)) return;

            let netKey = networkKey(networkObj)

            //Reject missing or undefined arguments

            let cacheStore = get(CacheStore);
            if (!cacheStore['contracts']) return false;
            if (!cacheStore['contracts'][netKey]) return false;
            if (!cacheStore['contracts'][netKey][contractName]) return false;
            return true;
        },
        //Remove all contracts under a network so that the API will cheeck them again
        refreshNetwork: (networkObj) => {
            //Reject missing or undefined arguments
            if (!isNetworkObj(networkObj)) return;

            let netKey = networkKey(networkObj)
            
            //Clear all contracts under the supplied network
            CacheStore.update(cacheStore => {
                if (!cacheStore['contracts']) return;
                cacheStore['contracts'][netKey] = {};
                return cacheStore;
            })
        }
    };
}

//Create Cache Stores
export const CacheStore = createCacheStore('cache', {});