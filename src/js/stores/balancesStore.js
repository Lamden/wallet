import { writable, get, derived } from 'svelte/store';

import * as validators from 'types-validate-assert'
const { validateTypes } = validators; 

import { networkKey } from './stores.js'
import { Encoder } from '../utils.js'

export const createBalancesStore = () => {
    const getStore = () => {
        //Set the Coinstore to the value of the chome.storage.local
        chrome.storage.local.get({"balances": []}, function(getValue) {
            BalancesStore.set(getValue.balances)
        });
    }

    //Create Intial Store
    const BalancesStore = writable({});

    chrome.storage.onChanged.addListener(function(changes) {
        for (let key in changes) {
            if (key === 'balances') {
                if (JSON.stringify(changes[key].newValue) !== JSON.stringify(get(BalancesStore))) {
                    BalancesStore.set(changes[key].newValue)
                }
            }
        }
    });

    //Set the Coinstore to the value of the chome.storage.local
    getStore()

    let subscribe = BalancesStore.subscribe;
    let update = BalancesStore.update;
    let set = BalancesStore.set;

    return {
        subscribe,
        set,
        update,
        getBalance: (networkObj, vk) => {
            // if (!validateTypes.isSpecificClass(networkObj, "Network")) return;

            let netkey = networkKey(networkObj)

            if (validateTypes.isStringWithValue(netkey) && validateTypes.isStringWithValue(vk)){
                const balanceStore = get(BalancesStore)
                if (!balanceStore[netkey]) return Encoder('bigNumber', '0')
                if (!balanceStore[netkey][vk]) return Encoder('bigNumber', '0')
                if (!balanceStore[netkey][vk].balance) return Encoder('bigNumber', '0')
                return Encoder('bigNumber', balanceStore[netkey][vk].balance)
            }else{
                return Encoder('bigNumber', '0');
            }
        },
        isWatchOnly: (networkObj, vk) => {
            if (!validateTypes.isSpecificClass(networkObj, "Network")) return;
            
            let netkey = networkKey(networkObj)

            if (validateTypes.isStringWithValue(netkey) && validateTypes.isStringWithValue(vk)){
                const balanceStore = get(BalancesStore)
                if (!balanceStore[netkey]) return false
                if (!balanceStore[netkey][vk]) return false
                return balanceStore[netkey][vk].watchOnly
            }else{
                return false;
            }
        },
        refreshNetworkCache: (networkObj) => {
            //Reject missing or undefined arguments
            if (!validateTypes.isSpecificClass(networkObj, "Network")) return;
            chrome.runtime.sendMessage({type: 'balancesStoreClearNetwork', data: networkObj.getNetworkInfo()})
        },
        refreshAllCache: () => {
            chrome.runtime.sendMessage({type: 'balancesStoreClearAllNetworks'})
        }
    };
}
//Create BalancesStore instance
export const BalancesStore = createBalancesStore();

//Create a derived store to total all wallets
export const balanceTotal = derived(BalancesStore, ($BalancesStore) => {
    let totals = {};
    Object.keys($BalancesStore).forEach(network =>{
        totals[network] = Encoder('bigNumber', '0');
        Object.keys($BalancesStore[network]).forEach(vk => {
            if (!$BalancesStore[network][vk].watchOnly){
                totals[network] = Encoder.BigNumber.sum($BalancesStore[network][vk].balance, totals[network]);
                totals[network] = Encoder('bigNumber', totals[network].toFixed(8))
            }
        })
    })
    return totals;
});
