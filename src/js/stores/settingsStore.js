import { writable, derived } from 'svelte/store';
import { currencyList } from './defaults.js';
import { MarketInfoStore } from './stores.js';

const defualtSettingsStore = {
    'currentPage' : {'name': 'CoinsMain', 'data' : {}},
    'firstRun': true,
    'themeStyle':'dark',
    'version':'v0_0_2',
    'storage' : {'used': 0, 'remaining': 5000000, 'max': 5000000},
    'currency': {
        'current': {
            'name' : 'United States Dollar ($)' ,
             'code' : 'USD'
            },
            'list': currencyList
            }
}

const createSettingsStore = (key, startValue) => {
    const SettingsStore = writable(startValue);
    let subscribe = SettingsStore.subscribe;
    let update = SettingsStore.update;
    let set = SettingsStore.set;

    return {
        startValue,
        subscribe,
        set,
        update,
        useLocalStorage: () => {  
            const json = localStorage.getItem(key);
            if (json) {
                let returnstr = JSON.parse(json)
                set(returnstr);
            }
            
            subscribe(current => {
                localStorage.setItem(key, JSON.stringify(current));
            });
        },
        reset: () => {
            set(startValue)
        },
        setCurrency(currency){
            update(settingsstore => {
                settingsstore.currency.current = currency;
                return settingsstore
            })
            MarketInfoStore.refresh_marketInfo();
        }
    };
}

//Settings Stores
export const SettingsStore = createSettingsStore('settings', defualtSettingsStore);

export const loggedIn = writable(true);

export const currentPage = derived(
	SettingsStore,
	$SettingsStore => loggedIn ? $SettingsStore.currentPage : {'name' : 'LockScreen', 'data' : {} }
);

export const firstRun = derived(
	SettingsStore,
	$SettingsStore => $SettingsStore.firstRun
);

export const themeStyle = derived(
	SettingsStore,
	$SettingsStore => $SettingsStore.themeStyle
);

export const currencies = derived(
	SettingsStore,
	$SettingsStore => {
        returnList = $SettingsStore.currency.list.filter(currency => currency !== $SettingsStore.currency.current )
        return returnList
    }
);

export const currencyCode = derived(
	SettingsStore,
	$SettingsStore => $SettingsStore.currency.current.code
);

export function calcRemainingStorage(){
    SettingsStore.update(settings => {
        settings.storage.used = new Blob(Object.values(localStorage)).size;
        settings.storage.remaining = settings.storage.max - settings.storage.used;
        return settings;
    })
}