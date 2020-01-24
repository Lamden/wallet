import { writable, get } from 'svelte/store';

const createStore = (key, startValue) => {
    const json = localStorage.getItem(key);
    if (json) {
        startValue = JSON.parse(json)
    }
    const CacheStore = writable(startValue);
    CacheStore.subscribe(current => {
        if (Object.prototype.toString.call(current) === "[object Object]") {
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
        addContract: (contractName, networkName) =>{
            //Reject missing or undefined arguments
            if (!contractName || typeof contractName === 'undefined') return;
            if (!networkName || typeof networkName === 'undefined') return;
            CacheStore.update(cacheStore => {
                //Store network / contract pair under the contracts key in the cash
                if (!cacheStore['contracts']) cacheStore['contracts'] = {};
                if (!cacheStore['contracts'][networkName]) cacheStore['contracts'][networkName] = {};
                cacheStore['contracts'][networkName][contractName] = true;
                return cacheStore;
            })
        },
        //Check if we have already called the API to check this contract name
        contractExists: (contractName, networkName) => {
            //Reject missing or undefined arguments
            if (!contractName || typeof contractName === 'undefined') return false;
            if (!networkName || typeof networkName === 'undefined') return false;
            let cacheStore = get(CacheStore);
            if (!cacheStore['contracts']) return false;
            if (!cacheStore['contracts'][networkName]) return false;
            if (!cacheStore['contracts'][networkName][contractName]) return false;
            return true;
        },
        //Remove all contracts under a network so that the API will cheeck them again
        refreshNetwork: (networkName) => {
            //Reject missing or undefined arguments
            if (!networkName || typeof networkName === 'undefined') return;
            //Clear all contracts under the supplied network
            CacheStore.update(cacheStore => {
                if (!cacheStore['contracts']) return;
                cacheStore['contracts'][networkName] = {};
                return cacheStore;
            })
        }
    };
}

//Create Cache Stores
export const CacheStore = createStore('contracts', {});