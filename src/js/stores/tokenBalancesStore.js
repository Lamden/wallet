import { writable, get, derived } from 'svelte/store';

import * as validators from 'types-validate-assert'
const { validateTypes } = validators; 

import { networkKey } from './stores.js'
import { Encoder } from '../utils.js'

export const createTokenBalancesStore = () => {
    const getStore = () => {
        //Set the TokenTokenBalancesStore to the value of the chome.storage.local
        chrome.storage.local.get({"token_balances": {}}, function(getValue) {
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
        update,
        getNetworkTokenBalances: (networkObj) => {
            if (!validateTypes.isSpecificClass(networkObj, "Network")) return;

            let netkey = networkKey(networkObj)
            if (!validateTypes.isStringWithValue(netkey)) return {}

            let tokenBalancesStore = get(TokenBalancesStore)
            if (!tokenBalancesStore[netkey]) return {}
            return tokenBalancesStore[netkey]
        }
    };
}
//Create TokenBalancesStore instance
export const TokenBalancesStore = createTokenBalancesStore();

//Create a derived store to total all wallets
export const tokenBalanceTotal = derived(TokenBalancesStore, ($TokenBalancesStore) => {
    let totals = {};
    Object.keys($TokenBalancesStore).forEach(network =>{
        Object.keys($TokenBalancesStore[network]).forEach(vk =>{
            Object.keys($TokenBalancesStore[network][vk]).forEach(token => {
                if (!totals[network]) totals[network] = {}
                if (!totals[network][token]) totals[network][token] = Encoder('bigNumber', $TokenBalancesStore[network][vk][token])
                else totals[network][token] = totals[network][token].plus($TokenBalancesStore[network][vk][token])
            })
        })
    })
    
    return totals;
});