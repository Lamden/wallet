import { writable, derived, get } from 'svelte/store';

import * as validators from 'types-validate-assert'
const { validateTypes } = validators; 


const createSwapsStore = () => {
    let startValue = {}
    let initialized = false;

    const getStore = () => {
        //Set the Coinstore to the value of the chome.storage.local
        chrome.storage.local.get({"swaps": startValue}, function(getValue) {
            initialized = true;
            SwapsStore.set(getValue.swaps)
        });
    }

    //Create Intial Store
    var SwapsStore = writable(startValue);

    //This is called everytime the SwapsStore updated
    SwapsStore.subscribe(current => {
        //Only accept and Array Object to be saved to the storage and only
        //if store has already been initialized
        if (!initialized) {
            return current
        }
        if (typeof current !== 'undefined') chrome.storage.local.set({"swaps": current});
    });

    getStore();

    let subscribe = SwapsStore.subscribe;
    let update = SwapsStore.update;
    let set = SwapsStore.set;

    return {
        subscribe,
        set,
        update,
        //Change the current page of the app
        //an also accept a data package the new page may need;
        createSwap: (netKey, swapInfo, eth_swap_txHash, eth_approval_txHash, lamdenAddress, amount, answers) => {
            //Return if invalid args
            if (!validateTypes.isStringWithValue(netKey)) return;
            if (!validateTypes.isStringWithValue(eth_swap_txHash)) return;

            SwapsStore.update(swapStore => {
                if (!swapStore[netKey]) swapStore[netKey] = {}
                //Set name and data in Settings store
                if (!swapStore[netKey][eth_swap_txHash]) swapStore[netKey][eth_swap_txHash] = {
                    created: new Date().toLocaleString(), swapInfo, eth_swap_txHash, eth_approval_txHash, lamdenAddress, amount, answers, status: 'created', errorMsg: ""
                }
                return swapStore;
            })
        },
        updateStatus: (netKey, eth_swap_txHash, status, errorMsg = undefined) => {
            if (!validateTypes.isStringWithValue(netKey)) return;
            if (!validateTypes.isStringWithValue(eth_swap_txHash)) return;
            if (!validateTypes.isStringWithValue(status)) return;

            SwapsStore.update(swapStore => {
                if (!swapStore[netKey]) return swapStore;
                //Set name and data in Settings store
                if (swapStore[netKey][eth_swap_txHash]) {
                    if (swapStore[netKey][eth_swap_txHash].status !== "success"){
                        swapStore[netKey][eth_swap_txHash].status = status
                        if(errorMsg) swapStore[netKey][eth_swap_txHash].errorMsg = errorMsg
                    }
                }
                return swapStore;
            })
        },
        updateLamdenTxHash: (netKey, eth_swap_txHash, lamden_swap_txHash) => {
            if (!validateTypes.isStringWithValue(netKey)) return;
            if (!validateTypes.isStringWithValue(eth_swap_txHash)) return;
            if (!validateTypes.isStringWithValue(lamden_swap_txHash)) return;

            SwapsStore.update(swapStore => {
                if (!swapStore[netKey]) return swapStore;
                //Set name and data in Settings store
                if (swapStore[netKey][eth_swap_txHash]) {
                    if (swapStore[netKey][eth_swap_txHash].status !== "success"){
                        swapStore[netKey][eth_swap_txHash].lamden_swap_txHash = lamden_swap_txHash
                        swapStore[netKey][eth_swap_txHash].status = 'success'
                    }
                }
                return swapStore;
            })
        }
    };
}

const listFromStore = (swapsStore) => {
    if (!swapsStore) return {}
    let swapListObject = {}
    Object.keys(swapsStore).forEach(networkKey => {
        swapListObject[networkKey] = Object.keys(swapsStore[networkKey]).map(s => swapsStore[networkKey][s]).sort((a, b) => a.created - b.created)
    })
    return swapListObject
}

//Settings Stores
export const SwapsStore = createSwapsStore();

//A Derrived Store to create a date sorted list of all swaps
export const swapsbyCreatedDate = derived(
	SwapsStore,
    $SwapsStore => {
        return listFromStore($SwapsStore)
})