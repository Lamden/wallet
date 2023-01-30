import { writable, get } from 'svelte/store';

export const createNodesStore = () => {
    const getStore = () => {
        //Set the Coinstore to the value of the chome.storage.local
        chrome.storage.local.get({"nodes": []}, function(getValue) {
            NodesStore.set(getValue.nodes)
        });
    }

    //Create Intial Store
    const NodesStore = writable([]);

    chrome.storage.onChanged.addListener(function(changes) {
        for (let key in changes) {
            if (key === 'nodes') {
                if (JSON.stringify(changes[key].newValue) !== JSON.stringify(get(NodesStore))) {
                    NodesStore.set(changes[key].newValue)
                }
            }
        }
    });

    //Set the Coinstore to the value of the chome.storage.local
    getStore()

    let subscribe = NodesStore.subscribe;
    let update = NodesStore.update;
    let set = NodesStore.set;

    return {
        subscribe,
        set,
        update,
    };
}

export const NodesStore = createNodesStore();