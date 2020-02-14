import { writable, derived, get } from 'svelte/store';
import { isNetworkObj, isObject, isStringWithValue, networkKey } from './stores.js';

const createTxStore = () => {
    let initialized = false;

    function getStore(){
        //Set the Coinstore to the value of the local storage
        chrome.storage.local.get({"txs": {}}, function(getValue) {
            initialized = true;
            TxStore.set(getValue.txs)
            console.log(get(TxStore))
        });
    }

    //Create TxStore with the inital value
    const TxStore = writable({});
    
    //This is called everytime the value of the store changes
    TxStore.subscribe(current => {
        //Only accept object to be saved to the localstorage
        if (isObject(current)) {
            if (initialized) chrome.storage.local.set({"txs": current});
        }else{
            //If non-object found then set the store back to the previous local store value
            getStore()
            console.log('Recovered from bad Transaction Store Value')
        }
    });

    getStore();
    
    let subscribe = TxStore.subscribe;
    let update = TxStore.update;
    let set = TxStore.set;
    

    return {
        subscribe,
        set,
        update,
        getTxList: (networkObj, vk) => {
            //Return if arguments are undefined and incorrect types
            if (!isNetworkObj(networkObj) || !isStringWithValue(vk)) return;

            //Create Network Key
            let netKey = networkKey(networkObj);

            //Get the txStore Value
            let txstore = get(TxStore);

            //Return empty lists if the keys can't be found
            if (!txstore[netKey]) return [];
            if (!txstore[netKey][vk]) return [];

            //List is found so return it
            return txstore[netKey][vk]
        },
        clearTx: (networkObj, vk) => {
            //Return if arguments are undefined and incorrect types
            if (!isNetworkObj(networkObj) || !isStringWithValue(vk)) return;

            //Create network Key
            let netKey = networkKey(networkObj)
            
            TxStore.update(txstore => {
                console.log(txstore)
                //If the key paths don't exists then just return
                if (!txstore[netKey]) return txstore;
                if (!txstore[netKey][vk]) return txstore;

                //Set key to an empty Array
                txstore[netKey][vk] = [];
                console.log(JSON.stringify(txstore))
                return txstore;
            })
        },
    };
}

//Create TxStore
export const TxStore = createTxStore();