import { writable, derived } from 'svelte/store';
import { isSettingsStoreObj,  isPageInfoObj, isStringWithValue} from './stores.js';

const defualtSettingsStore = {
    'currentPage' : {'name': 'FirstRunMain', 'data' : {}},
    'firstRun': true,
    'themeStyle':'dark',
    'version':'v0_9_8',
    'storage' : {'used': 0, 'remaining': 5000000, 'max': 5000000}
}

const createSettingsStore = (key, startValue) => {
    //Get store value from localstorate
    const json = localStorage.getItem(key);
    //If there is a value then set it as the inital value
    if (json) {
        startValue = JSON.parse(json)
    }

    //Create NetworksStore with the inital value
    const SettingsStore = writable(startValue);

    //This gets called everytime the Store updates
    SettingsStore.subscribe(current => {
        //If the store was updated to an empty or non Object then recover to previous value
        if (isSettingsStoreObj(current)){
            //Save Value to local storage
            localStorage.setItem(key, JSON.stringify(current));
        } else {
            //Recover store value in memory to previous local storage value
            let json = localStorage.getItem("settings");
            if (json) SettingsStore.set(JSON.parse(json));
            console.log('Recovered from bad Settings Store Value');
        }
    })

    let subscribe = SettingsStore.subscribe;
    let update = SettingsStore.update;
    let set = SettingsStore.set;

    return {
        startValue,
        subscribe,
        set,
        update,
        //Store that the first run setup has been completed
        firstRunComplete: () => {
            SettingsStore.update(settingsStore => {
                settingsStore.firstRun = false;
                settingsStore.currentPage = {name: 'CoinsMain', data: {}};
                return settingsStore;
            })
        },
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
        //Set a new theme in the setting store
        changeTheme: (theme) => {
            //Reject undefined or missing info.
            if (!isStringWithValue(theme)) return;
            SettingsStore.update(settingsStore => {
                //Set theme in Settings store
                settingsStore.themeStyle = theme;
                return settingsStore;
            })
        },
        //Calculates the amount of local storage used and remaining
        calcStorage: () => {
            SettingsStore.update(settings => {
                settings.storage.used = new Blob(Object.values(localStorage)).size;
                settings.storage.remaining = settings.storage.max - settings.storage.used;
                return settings;
            })   
        }
    };
}

//Settings Stores
export const SettingsStore = createSettingsStore('settings', defualtSettingsStore);

//Derived Store to return the current page object
export const currentPage = derived(
	SettingsStore,
	$SettingsStore => { return $SettingsStore.currentPage }
);

//Derived Store to return the firstRun value
export const firstRun = derived(
	SettingsStore,
    $SettingsStore => { return $SettingsStore.firstRun }
);

//Derived Store to return the themeStyle
export const themeStyle = derived(
	SettingsStore,
	$SettingsStore => { return $SettingsStore.themeStyle }
);

//Derived Store to return the storageInfo Object
export const storageInfo = derived(
	SettingsStore,
	$SettingsStore => { return $SettingsStore.storage }
);