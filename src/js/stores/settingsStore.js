import { writable, derived } from 'svelte/store';

const lamdenNetworks = [
    {name: 'Lamden Public Testnet', ip:'https://testnet.lamden.io', port: '443', lamden: true, online: false, selected: true}
]

const defualtSettingsStore = {
    'currentPage' : {'name': 'FirstRunMain', 'data' : {}},
    'firstRun': true,
    'themeStyle':'dark',
    'version':'v0_9_8',
    'storage' : {'used': 0, 'remaining': 5000000, 'max': 5000000},
    'networks' : [...lamdenNetworks],
}

const createSettingsStore = (key, startValue) => {
    const json = localStorage.getItem(key);
    if (json) {
        if (json === "undefined"){
            startValue = startValue;
            let coinStore = localStorage.getItem('coins');
            if (coinStore){
                startValue.firstRun = false;
                startValue.currentPage = {'name': 'CoinsMain', 'data' : {}}
            }
        }else{
            startValue = JSON.parse(json);
        }
        Object.keys(defualtSettingsStore).map(m =>{
            if (!startValue.hasOwnProperty(m)){
                startValue[m] = defualtSettingsStore[m]
            }
        })

        lamdenNetworks.map(network => {
            let foundNetwork = startValue.networks.find(f =>{
                return f.lamden && network.name === f.name
            })
            if (!foundNetwork) startValue.networks.unshift(network)
            if (foundNetwork){
                if (foundNetwork.lamden){
                    foundNetwork.ip = network.ip;
                    foundNetwork.port = network.port;
                }
            }
        })
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
        //Add a new network into the Networks Array
        addNetwork: (networkInfo) => {
            //Reject undefined or missing info
            if (!networkInfo || typeof networkInfo === 'undefined') return;
            if (!networkInfo.name || !networkInfo.ip || !networkInfo.port) return;

            //Set Defaults if they weren't passed
            if (!networkInfo.lamden) networkInfo.lamden = false;
            if (!networkInfo.selected) networkInfo.selected = false;
            if (!networkInfo.online) networkInfo.online = false;

            SettingsStore.update(settingsStore => {
                //Push new network to the networks Array
                settingsStore.networks.push(networkInfo);
                return settingsStore;
            }) 
        },
        //Change the online status of network to true/false
        setNetworkStatus: (networkInfo, status) => {
            //Reject undefined or missing info
            if (!networkInfo || typeof networkInfo === 'undefined') return;
            if (typeof status !== 'boolean') return;
            if (!networkInfo.ip || !networkInfo.port) return;

            SettingsStore.update(settingsStore => {
                settingsStore.networks.map(network => {
                    //change the Status to the networks that match the IP and Port
                    if (network.ip === networkInfo.ip && network.port === networkInfo.port) network.online = status
                })
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