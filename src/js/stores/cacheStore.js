import { writable, get } from 'svelte/store';

const createStore = (key, startValue) => {
    const json = localStorage.getItem(key);
    if (json) {
        startValue = JSON.parse(json)
    }
    const CacheStore = writable(startValue);
    CacheStore.subscribe(current => {
        localStorage.setItem(key, JSON.stringify(current));
    });
    let subscribe = CacheStore.subscribe;
    let update = CacheStore.update;
    let set = CacheStore.set;

    return {
        startValue,
        subscribe,
        set,
        update,
        addContract: (contractName, network) =>{
            CacheStore.update(cacheStore => {
                if (!cacheStore['contracts']) cacheStore['contracts'] = {};
                if (!cacheStore['contracts'][network]) cacheStore['contracts'][network] = {};
                cacheStore['contracts'][network][contractName] = true;
                return cacheStore;
            })
        },
        contractExists: (contractName, network) => {
            let cacheStore = get(CacheStore);
            if (!cacheStore['contracts']) return false;
            if (!cacheStore['contracts'][network]) return false;
            if (!cacheStore['contracts'][network][contractName]) return false;
            return true;
        },
        refreshNetwork: (network) => {
            CacheStore.update(cacheStore => {
                if (!cacheStore['contracts']) return;
                cacheStore['contracts'][network] = {};
                return cacheStore;
            })
        }
    };
}

//Settings Stores
export const CacheStore = createStore('contracts', {});