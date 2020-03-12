import { writable, get } from 'svelte/store';

export const createPendingTxStore = () => {
    const getStore = () => {
        //Set the Coinstore to the value of the chome.storage.local
        chrome.storage.local.get({"pendingTxs": []}, function(getValue) {
            PendingTxStore.set(getValue.pendingTxs)
        });
    }

    //Create Intial Store
    const PendingTxStore = writable([]);

    chrome.storage.onChanged.addListener(function(changes) {
        for (let key in changes) {
            if (key === 'pendingTxs') {
                if (JSON.stringify(changes[key].newValue) !== JSON.stringify(get(PendingTxStore))) {
                    PendingTxStore.set(changes[key].newValue)
                }
            }
        }
    });

    //Set the Coinstore to the value of the chome.storage.local
    getStore()

    let subscribe = PendingTxStore.subscribe;
    let update = PendingTxStore.update;
    let set = PendingTxStore.set;

    return {
        subscribe,
        set,
        update
    };
}
//Create PendingTxStore instance
export const PendingTxStore = createPendingTxStore();