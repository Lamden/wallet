import { writable, derived } from 'svelte/store';
import { SettingsStore } from './settingsStore';
import whitelabel from '../../../whitelabel.json';

export const createExchangeRateStore = () => {
    //Create Intial Store
    const ExchangeRateStore = writable({})

    const getStore = () => {
        //Set the Coinstore to the value of the chome.storage.local
        chrome.storage.local.get({"exchangeRate": {}}, function(getValue) {
            ExchangeRateStore.set(getValue.exchangeRate)
        });
    }

    chrome.storage.onChanged.addListener(function(changes) {
        for (let key in changes) {
            if (key === 'exchangeRate') {
                ExchangeRateStore.set(changes[key].newValue)
            }
        }
    });

    getStore()

    return ExchangeRateStore
}
//Create BalancesStore instance
export const ExchangeRateStore = createExchangeRateStore();


export const FiatListDown = derived([ExchangeRateStore, SettingsStore], ([$ExchangeRateStore, $SettingsStore]) => {
    let returnList = []
    let fiat = $SettingsStore.fiat || "USD"
    let fiatSymbol = Object.keys(whitelabel.fiat)
    
    if (fiatSymbol.indexOf(fiat) === -1 ) fiat = "USD"

    if (!$ExchangeRateStore.rates) return;

    Object.keys($ExchangeRateStore.rates).map(key => {
        if (fiatSymbol.indexOf(key) !== -1) {
            returnList.push({
                value: $ExchangeRateStore.rates[key],
                name: key,
                selected: fiat === key? true : false
            })
        }
    })
    return returnList
});
