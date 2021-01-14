import { writable, get, derived } from 'svelte/store';

import * as validators from 'types-validate-assert'
const { validateTypes } = validators; 

import { Encoder } from '../utils.js'

export const createTokenBalancesStore = () => {
    const getStore = () => {
        //Set the TokenTokenBalancesStore to the value of the chome.storage.local
        chrome.storage.local.get({"token_balances": []}, function(getValue) {
            TokenBalancesStore.set(getValue.token_balances)
        });
    }

    //Create Intial Store
    const TokenBalancesStore = writable({});

    chrome.storage.onChanged.addListener(function(changes) {
        for (let key in changes) {
            if (key === 'token_balances') {
                if (JSON.stringify(changes[key].newValue) !== JSON.stringify(get(TokenBalancesStore))) {
                    TokenBalancesStore.set(changes[key].newValue)
                }
            }
        }
    });

    //Set the Coinstore to the value of the chome.storage.local
    getStore()

    let subscribe = TokenBalancesStore.subscribe;
    let update = TokenBalancesStore.update;
    let set = TokenBalancesStore.set;

    return {
        subscribe,
        set,
        update/*,
        getBalance: (networkObj, vk) => {
            if (!validateTypes.isSpecificClass(networkObj, "Network")) return;

            let netkey = networkKey(networkObj)

            if (validateTypes.isStringWithValue(netkey) && validateTypes.isStringWithValue(vk)){
                const balanceStore = get(TokenBalancesStore)
                if (!balanceStore[netkey]) return Encoder('bigNumber', '0')
                if (!balanceStore[netkey][vk]) return Encoder('bigNumber', '0')
                if (!balanceStore[netkey][vk].balance) return Encoder('bigNumber', '0')
                return Encoder('bigNumber', balanceStore[netkey][vk].balance)
            }else{
                return Encoder('bigNumber', '0');
            }
        },
        refreshNetworkCache: (networkObj) => {
            //Reject missing or undefined arguments
            if (!validateTypes.isSpecificClass(networkObj, "Network")) return;
            chrome.runtime.sendMessage({type: 'TokenBalancesStoreClearNetwork', data: networkObj.getNetworkInfo()})
        },
        refreshAllCache: () => {
            chrome.runtime.sendMessage({type: 'TokenBalancesStoreClearAllNetworks'})
        }*/
    };
}
//Create TokenBalancesStore instance
export const TokenBalancesStore = createTokenBalancesStore();

//Create a derived store to total all wallets
export const tokenBalanceTotal = derived(TokenBalancesStore, ($TokenBalancesStore) => {
    let totals = {};
    Object.keys($TokenBalancesStore).forEach(vk =>{
        Object.keys($TokenBalancesStore[vk]).forEach(token => {
            if (!totals[token]) totals[token] = Encoder('bigNumber', $TokenBalancesStore[vk][token])
            else totals[token] = totals[token].plus($TokenBalancesStore[vk][token])
        })
    })
    return totals;
});
