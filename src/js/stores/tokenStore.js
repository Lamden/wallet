/*
    get and organize the token storage for the UI

    Two stores:

    1. Tokens:
        - Get the token storage
        - Export it as a Svelte Store
        
        Derived Stores:
            - Tokens as a list


    2. Token Balances:
        - Get the token_balances storage

        Derived Stores:
        - Overall Totals for each coin

*/

import { writable, get, derived } from 'svelte/store';
import { validateTypes } from 'types-validate-assert';

import { networkKey } from './stores.js'

export const createTokenStore = () => {

    const getStore = () => {
        //Set the TokenStore to the value of the chome.storage.local
        chrome.storage.local.get({"tokens": {}}, function(getValue) {
            TokenStore.set(getValue.tokens)
        });
    }

    //Create Intial Store
    const TokenStore = writable({});

    chrome.storage.onChanged.addListener(function(changes) {
        for (let key in changes) {
            if (key === "tokens") {
                if (JSON.stringify(changes[key].newValue) !== JSON.stringify(get(TokenStore))) {
                    TokenStore.set(changes[key].newValue)
                }
            }
        }
    });

    //Set the TokenStore to the value of the chome.storage.local
    getStore()

    let subscribe = TokenStore.subscribe;
    let update = TokenStore.update;
    let set = TokenStore.set;

    return {
        subscribe,
        set,
        update,
        getByContractName: (networkObj, contractName) => {
            if (validateTypes.isStringWithValue(contractName)) return;

            let netkey = networkKey(networkObj)

            let tokenStore = get(TokenStore)
            if (!tokenStore[netkey]) return undefined;

            let foundToken = tokenStore[netkey].find(token => token.contractName === contractName)
            return foundToken
        }
    };
}
//Create TokenStore instance
export const TokenStore = createTokenStore();

//Create a derived store to total all wallets
export const tokensDropDown = derived(TokenStore, () => {
    null
    /*
    let returnList = [{
        value: undefined,
        name: `Select Token`,
        selected: true
    }]
    $TokenStore.map(token => {
        returnList.push({
            value: token,
            name: `${token.token_symbol} ${token.token_name}`,
            selected: false
        })
    })
    return returnList
    */
});