import { writable, derived } from 'svelte/store';

import * as validators from 'types-validate-assert'
const { validateTypes } = validators; 

//import { defualtSettingsStore } from './defaults'

import { isSettingsStoreObj,  isPageInfoObj} from '../objectValidations';

const defualtSettingsStore = {
    'currentPage' : {
        'name': 'FirstRunMain', 
        'data' : {}
    },
    'themeStyle':'dark'
}

const mainnetLaunchDetails = {
    'launchDate': '2020-09-16T16:00:00.000Z',
    'switched': false
}

const createSettingsStore = () => {
    let startValue = defualtSettingsStore
    if (!startValue.mainnetLaunch) startValue.mainnetLaunch = mainnetLaunchDetails
    let initialized = false;

    const getStore = () => {
        //Set the Coinstore to the value of the chome.storage.local
        chrome.storage.local.get({"settings": startValue}, function(getValue) {
            initialized = true;
            // defalut USD fiat
            if (!getValue.settings.fiat) {
                getValue.settings.fiat = "USD"
            }
            SettingsStore.set(getValue.settings)
        });
    }

    //Create Intial Store
    var SettingsStore = writable(startValue);

    //This is called everytime the SettingsStore updated
    SettingsStore.subscribe(current => {
        //Only accept and Array Object to be saved to the storage and only
        //if store has already been initialized
        if (!initialized) {
            return current
        }
        if (isSettingsStoreObj(current)){
            chrome.storage.local.set({"settings": current});
        }else{
            //Recover store value in memory to previous chome.storage.local value
            getStore();
        }
    });

    getStore();

    let subscribe = SettingsStore.subscribe;
    let update = SettingsStore.update;
    let set = SettingsStore.set;

    return {
        subscribe,
        set,
        update,
        initialized: () => initialized,
        //Change the current page of the app
        //an also accept a data package the new page may need;
        changePage: (pageInfoObj) => {
            //Return if the object isn't a proper page object
            if (!isPageInfoObj(pageInfoObj)) return;

            //Default data to empty object
            if (!pageInfoObj.data) pageInfoObj.data = {};
            SettingsStore.update(settingsStore => {
                //Set name and data in Settings store
                settingsStore.currentPage = pageInfoObj;
                return settingsStore;
            })
        },
        setLastBackupDate: () => {
            SettingsStore.update(settingsStore => {
                settingsStore.lastBackupDate = new Date().toLocaleString()
                settingsStore.dismissWarning = false;
                return settingsStore;
            })
        },
        setLastCoinAddedDate: () => {
            SettingsStore.update(settingsStore => {
                settingsStore.lastCoinAddedDate = new Date().toLocaleString()
                settingsStore.dismissWarning = false;
                return settingsStore;
            }) 
        },
        setLastCoinAddedType: (type) => {
            SettingsStore.update(settingsStore => {
                settingsStore.lastCoinAddedType = type
                return settingsStore;
            }) 
        },
        dismissWarning: () => {
            SettingsStore.update(settingsStore => {
                settingsStore.dismissWarning = true;
                return settingsStore;
            })    
        },
        hideTokens: (value) => {
            SettingsStore.update(settingsStore => {
                settingsStore.hideTokens = value;
                return settingsStore;
            }) 
        },
        setIsVaultCreated: (value) => {
            SettingsStore.update(settingsStore => {
                settingsStore.isVaultCreated = value;
                return settingsStore;
            }) 
        },
        setFiatCurrency: (value) => {
            SettingsStore.update(settingsStore => {
                settingsStore.fiat = value;
                return settingsStore;
            }) 
        }
    };
}

//Settings Stores
export const SettingsStore = createSettingsStore();

//Derived Store to return the current page object
export const currentPage = derived(
	SettingsStore,
	$SettingsStore => { return $SettingsStore.currentPage }
);

//Derived Store to return if the user needs to make another backup
export const needsBackup = derived(
	SettingsStore,
	$SettingsStore => {
        if ($SettingsStore.dismissWarning) return false;
        if (validateTypes.isString($SettingsStore.lastBackupDate) && 
            validateTypes.isString($SettingsStore.lastCoinAddedDate)){
            return new Date($SettingsStore.lastCoinAddedDate) > new Date($SettingsStore.lastBackupDate)
        }
        if (typeof $SettingsStore.lastBackupDate === 'undefined' && 
            validateTypes.isString($SettingsStore.lastCoinAddedDate)){
            return true
        }
        return false
    }
);