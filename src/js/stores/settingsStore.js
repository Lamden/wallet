import { writable, derived } from 'svelte/store';

const defualtSettingsStore = {
    'currentPage' : {'name': 'CoinsMain', 'data' : {}},
    'firstRun': true,
    'themeStyle':'dark',
    'version':'v0_0_2',
    'storage' : {'used': 0, 'remaining': 5000000, 'max': 5000000},
}

const createSettingsStore = (key, startValue) => {
    const json = localStorage.getItem(key);
    if (json) {
        startValue = JSON.parse(json)
    }
    const SettingsStore = writable(startValue);
    SettingsStore.subscribe(current => {
        localStorage.setItem(key, JSON.stringify(current));
    });
    let subscribe = SettingsStore.subscribe;
    let update = SettingsStore.update;
    let set = SettingsStore.set;

    return {
        startValue,
        subscribe,
        set,
        update,
        reset: () => {
            set(startValue)
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
	$SettingsStore => {
        console.log($SettingsStore.themeStyle);
        return $SettingsStore.themeStyle;
    }
);

export function calcRemainingStorage(){
    SettingsStore.update(settings => {
        settings.storage.used = new Blob(Object.values(localStorage)).size;
        settings.storage.remaining = settings.storage.max - settings.storage.used;
        return settings;
    })
}