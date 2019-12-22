import { writable, derived, get } from 'svelte/store';

const createTxStore = (key, startValue) => {
    const json = localStorage.getItem(key);
    if (json) {
        startValue = JSON.parse(json)
    }
    const TxStore = writable(startValue);
    TxStore.subscribe(current => {
        localStorage.setItem(key, JSON.stringify(current));
    });
    let subscribe = TxStore.subscribe;
    let update = TxStore.update;
    let set = TxStore.set;

    const networkKey = (network) => {
        return network.ip + network.port
    }

    const cleanSender = (sender) => {
        return Object.keys(sender)
            .filter(i => ['network', 'name', 'nickname', 'symbol', 'vk'].includes(i))
            .reduce((acc, key) => {
            acc[key] = sender[key];
            return acc;
            }, {})
    }

    return {
        startValue,
        subscribe,
        set,
        update,
        addTx: (txInfo) => {
            TxStore.update(txstore => {
                let netKey = networkKey(txInfo.network)
                if (!txstore[netKey]) txstore[netKey] = {}
                if (!txstore[netKey][txInfo.sender.vk]) txstore[netKey][txInfo.sender.vk] = [];
                txInfo.sender = cleanSender(txInfo.sender);
                txInfo.date = new Date().toUTCString();
                txstore[netKey][txInfo.sender.vk].push(txInfo);
                return txstore;
            })
        },
        getTx: (network, vk) => {
            if (network == null || vk == null) return;
            let netKey = networkKey(network)
            let txstore = get(TxStore);
            if (!txstore[netKey]) return [];
            if (!txstore[netKey][vk]) return [];
            return txstore[netKey][vk]
        },
        clearTx: (network, vk) => {
            TxStore.update(txstore => {
                let netKey = networkKey(network)
                if (!txstore[netKey]) return;
                if (!txstore[netKey][vk]) return;
                txstore[netKey][vk] = [];
                return txstore;
            })
        },
    };
}

//Settings Stores
export const TxStore = createTxStore('txs', {});

export const allTransactions = derived(TxStore, ($TxStore) => {
    let txList = [];
    Object.keys($TxStore).map(key => {
        txList = [...txList, ...key]
    })
    return txList;
});