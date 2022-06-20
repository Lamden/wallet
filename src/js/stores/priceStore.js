import { writable, derived } from 'svelte/store';
import { SettingsStore } from './settingsStore';
import { ExchangeRateStore } from './exchangeRateStore';

export const createPriceStore = () => {
    //Create Intial Store
    const PriceStore = writable({})

    const getStore = () => {
        //Set the Coinstore to the value of the chome.storage.local
        chrome.storage.local.get({"price": {}}, function(getValue) {
            PriceStore.set(getValue.price)
        });
    }

    chrome.storage.onChanged.addListener(function(changes) {
        for (let key in changes) {
            if (key === 'price') {
                PriceStore.set(changes[key].newValue)
            }
        }
    });

    getStore()

    return PriceStore
}
//Create BalancesStore instance
export const PriceStore = createPriceStore();

export const TauPrice = derived([PriceStore, SettingsStore, ExchangeRateStore], ([$PriceStore, $SettingsStore, $ExchangeRateStore]) => {
    let fiat = $SettingsStore.fiat || "USD"
    let rate = $ExchangeRateStore.rates && $ExchangeRateStore.rates[fiat]? $ExchangeRateStore.rates[fiat] : 0 
    if ($PriceStore["currency"]) {
        if (fiat === "USD") {
            return $PriceStore["currency"]["value"]
        } else {
            return $PriceStore["currency"]["value"] * rate
        }
    } else {
        return '0'
    }
})