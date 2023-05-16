import { writable, derived } from 'svelte/store';

export const createDappStore = () => {
    let startValue = {};

    const getStore = () => {
        //Set the Coinstore to the value of the chome.storage.local
        chrome.storage.local.get({"dapps": startValue}, function(getValue) {
            DappStore.set(getValue.dapps)
        });
    }

    //Create Intial Store
    const DappStore = writable(startValue);

    chrome.storage.onChanged.addListener(function(changes) {
        for (let key in changes) {
            if (key === 'dapps') {
                DappStore.set(changes[key].newValue)
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
export const DappStore = createDappStore();

//Create a derived store to total all wallets
export const dappsDropDown = derived(DappStore, ($DappStore) => {
    let returnList = []
    Object.keys($DappStore).forEach(d => {
        let value = $DappStore[d]
        returnList.push({
            value,
            name: `${value.appName}: ${value.url.length > 40 ? value.url.substring(0, 40) + '...' : value.url}`,
            selected: false
        })
    })
    return returnList;
});
