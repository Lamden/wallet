import { writable, derived, get } from 'svelte/store';

const defualtSettingsStore = {
    'currentPage' : {'name': 'FirstRunMain', 'data' : {}},
    'firstRun': true,
    'themeStyle':'dark',
    'version':'v0_0_2',
    'storage' : {'used': 0, 'remaining': 5000000, 'max': 5000000},
    'networks' : [{name: 'Public Testnet', ip:'192.168.1.82', port: '8000', del: false, selected: true}]
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
        },
        setNetwork: (network) => {
            if (!network) return;
            SettingsStore.update(settingsStore => {
                settingsStore.networks.map(item => {
                    item.selected = false;
                    if(item.name === network.name && item.ip === network.ip && item.port === network.port) item.selected = true;
                })
                return settingsStore;
            })
        },
        addNetwork: (networkInfo) => {
            SettingsStore.update(settingsStore => {
                settingsStore.networks.push(networkInfo);
                return settingsStore;
            }) 
        },
        deleteNetwork: (networkInfo) => {
            if (!networkInfo) return;
            SettingsStore.update(settingsStore => {
                let newNetworks = settingsStore.networks.filter(f => {
                    if (f.name === networkInfo.name && f.ip === networkInfo.ip && f.port === networkInfo.port) return false
                    return true;
                })
                
                newNetworks.map((network, index) => {
                    network.selected = index === 0 ? true : false;
                })
                settingsStore.networks = newNetworks;
                return settingsStore;
            })
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
        return $SettingsStore.themeStyle;
    }
);

export const networks = derived(
	SettingsStore,
	$SettingsStore => {
        let networks = [];
        $SettingsStore.networks.map(network => {
            networks.push({
                name: network.name,
                value: network,
                selected: network.selected
            })
        })
        return networks;
    }
);

export const currentNetwork = derived(
	SettingsStore,
	$SettingsStore => {
        return $SettingsStore.networks.find(network => network.selected === true)
    }
);

export function calcRemainingStorage(){
    SettingsStore.update(settings => {
        settings.storage.used = new Blob(Object.values(localStorage)).size;
        settings.storage.remaining = settings.storage.max - settings.storage.used;
        return settings;
    })
}