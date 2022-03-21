import { writable, get } from 'svelte/store';

export const createPriceStore = () => {
    //Create Intial Store
    const PriceStore = writable({})

    const getStore = () => {
        //Set the Coinstore to the value of the chome.storage.local
        chrome.storage.local.get({"price": {}}, function(getValue) {
            PriceStore.set(getValue.price)
        });
    }

    chrome.storage.onChanged.addListener(function(changes) {
        for (let key in changes) {
            if (key === 'price') {
                PriceStore.set(changes[key].newValue)
            }
        }
    });

    getStore()

    return PriceStore
}
//Create BalancesStore instance
export const PriceStore = createPriceStore();