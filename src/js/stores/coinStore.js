import { writable, get, derived } from 'svelte/store';
import { validateTypes } from 'types-validate-assert';

import {  formatAccountAddress } from '../utils'

const sanatizedAccounts = (accounts) => {
    return accounts.map(account => {
        if (account.sk !== "watchOnly") account.sk = "encrypted"
        return account
    })
}

export const createCoinStore = () => {
    let initialized = false;

    const getStore = () => {
        //Set the Coinstore to the value of the chome.storage.local
        chrome.storage.local.get({"coins": []}, function(getValue) {
            initialized = true;
            CoinStore.set(sanatizedAccounts(getValue.coins))
        });
    }

    //Create Intial Store
    const CoinStore = writable([]);

    chrome.storage.onChanged.addListener(function(changes) {
        for (let key in changes) {
            if (key === 'coins') {
                if (JSON.stringify(changes[key].newValue) !== JSON.stringify(get(CoinStore))) {
                    CoinStore.set(sanatizedAccounts(changes[key].newValue))
                }
            }
        }
    });

    //Set the Coinstore to the value of the chome.storage.local
    getStore()

    let subscribe = CoinStore.subscribe;
    let update = CoinStore.update;
    let set = CoinStore.set;

    return {
        subscribe,
        set,
        update,
        getByVk: (vk) => {
            if (!validateTypes.isStringWithValue(vk)) return;
            let foundAccount = get(CoinStore).find(account => account.vk === vk)
            return foundAccount
        }
    };
}
//Create CoinStore instance
export const CoinStore = createCoinStore();

//Create a derived store to total all wallets
export const coinsDropDown = derived(CoinStore, ($CoinStore) => {
    let returnList = [{
        value: undefined,
        name: `Select Account`,
        selected: true
    }]
    $CoinStore.map(c => {
        if (c.value && c.value.sk === "watchOnly") return;
        returnList.push({
            value: c,
            name: `${formatAccountAddress(c.vk, 10,4)} - ${c.nickname}`,
            selected: false
        })
    })
    return returnList
});