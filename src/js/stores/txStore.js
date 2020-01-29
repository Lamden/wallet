import { writable, derived, get } from 'svelte/store';

function isObject(value){
    if(Object.prototype.toString.call(value) === "[object Object]") return true;
    return false;
}

function isString(value){
    if(Object.prototype.toString.call(value) === "[object String]") return true;
    return false;
}

const createTxStore = (key, startValue) => {
    //Get store value from localstorate
    const json = localStorage.getItem(key);
    //If there is a value then set it as the inital value
    if (json) {
        startValue = JSON.parse(json)
    }
    //Create TxStore with the inital value
    const TxStore = writable(startValue);

    TxStore.subscribe(current => {
        //Only accept object to be saved to the localstorage
        if (Object.prototype.toString.call(current) === "[object Object]") {
            localStorage.setItem(key, JSON.stringify(current));
        }else{
            //If non-object found then set the store back to the previous local store value
            let json = localStorage.getItem(key)
            if (json) CacheStore.set(JSON.parse(json))
            console.log('Recovered from bad Transaction Store Value')
        }
    });
    let subscribe = TxStore.subscribe;
    let update = TxStore.update;
    let set = TxStore.set;

    //Network Key used to store transactions
    const networkKey = (networkObj) => {
        return networkObj.ip + networkObj.port
    }

    //Remove sensitive info from being stored in the txData.sender (sk, etc)
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
        //Add a transaction into the transaction dict
        //Transactions are stored in a List under [NetworkKey][VK]
        //Network Key is a concat of ip and port
        addTx: (txData) => {
            //Return if arguments are undefined and incorrect types
            if (!txData || typeof txData === 'undefined' || !isObject(txData)) return;
            if (!txData.network || !txData.sender ) return;
            if (!txData.network.ip || !txData.network.port || !txData.sender.vk) return;
            TxStore.update(txstore => {
                //Create networkKey
                let netKey = networkKey(txData.network)
                if (!txstore[netKey]) txstore[netKey] = {}
                if (!txstore[netKey][txData.sender.vk]) txstore[netKey][txData.sender.vk] = [];
                //Clear sender sensitive info
                txData.sender = cleanSender(txData.sender);
                txData.date = new Date().toUTCString();
                //Add tx to List
                txstore[netKey][txData.sender.vk].push(txData);
                return txstore;
            })
        },
        getTx: (networkObj, vk) => {
            //Return if arguments are undefined and incorrect types
            if (!vk || typeof vk === 'undefined' || !isString(vk)) return;
            if (!networkObj || typeof networkObj === 'undefined' || !isObject(networkObj)) return;
            if (!networkObj.ip || !networkObj.port) return;
            //Get Network Key
            let netKey = networkKey(networkObj)
            let txstore = get(TxStore);
            //Return empty lists if the keys can't be found
            if (!txstore[netKey]) return [];
            if (!txstore[netKey][vk]) return [];
            //List is found so return it
            return txstore[netKey][vk]
        },
        clearTx: (networkObj, vk) => {
            //Return if arguments are undefined and incorrect types
            if (!vk || typeof vk === 'undefined' || !isString(vk)) return;
            if (!networkObj || typeof networkObj === 'undefined' || !isObject(networkObj)) return;
            if (!networkObj.ip || !networkObj.port) return;

            TxStore.update(txstore => {
                let netKey = networkKey(networkObj)
                //If the key paths don't exists then just return
                if (!txstore[netKey]) return;
                if (!txstore[netKey][vk]) return;
                //Set key to an empty Array
                txstore[netKey][vk] = [];
                return txstore;
            })
        },
    };
}

//Create TxStore
export const TxStore = createTxStore('txs', {});

//Returns a derived store that has a list of all transactions
export const allTransactions = derived(TxStore, ($TxStore) => {
    let txList = [];
    Object.keys($TxStore).map(key => {
        txList = [...txList, ...key]
    })
    return txList;
});