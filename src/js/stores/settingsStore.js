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
        if (current && Object.keys(current).length > 0) {
            localStorage.setItem(key, JSON.stringify(current));
            return;
        }else{
            let json = localStorage.getItem("settings")
            if (json) SettingsStore.set(JSON.parse(json))
        }
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
        changePage: (pageInfo) => {
            //Reject undefined or missing info.
            if (!pageInfo || typeof pageInfo === 'undefined') return;
            if (!pageInfo.name) return;
            //Default data to empty object
            if (!pageInfo.data) pageInfo.data = {};
            SettingsStore.update(settingsStore => {
                //Set name and data in Settings store
                settingsStore.currentPage = pageInfo;
                return settingsStore;
            })
        },
        //Set a new theme in the setting store
        changeTheme: (theme) => {
            //Reject undefined or missing info.
            if (!theme || typeof theme === 'undefined') return;
            SettingsStore.update(settingsStore => {
                //Set theme in Settings store
                settingsStore.themeStyle = theme;
                return settingsStore;
            })
        },
        //Make a network the current selected network
        //This sets the value of the derived "currentNetwork" store
        setCurrentNetwork: (networkInfo) => {
            //Reject undefined or missing info
            if (!networkInfo || typeof networkInfo === 'undefined') return;
            if (!networkInfo.name || !networkInfo.ip || !networkInfo.port) return;
            SettingsStore.update(settingsStore => {
                let foundNetwork = settingsStore.networks.find(f => 
                    f.name === networkInfo.name && 
                    f.ip === networkInfo.ip && 
                    f.port === networkInfo.port
                )
                //If the network exixts in the list then switch it to active
                if (foundNetwork){
                    settingsStore.networks.map(item => {
                        //Default all unmatched networks to false
                        item.selected = false;
                        //Change the matched network to true
                        if(item.name === networkInfo.name && 
                            item.ip === networkInfo.ip && 
                            item.port === networkInfo.port
                        ) item.selected = true;
                    })
                }
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
            if (!networkInfo.online) networkInfo.online = false;
            //Default to not selected.  Networks can only be selected using "setNetworkStatus"
            networkInfo.selected = false;

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
            if (!networkInfo.ip || !networkInfo.port) return;
            //Status should be true of false
            if (typeof status !== 'boolean') return;
            
            SettingsStore.update(settingsStore => {
                settingsStore.networks.map(network => {
                    //change the Status to the networks that match the IP and Port
                    if (network.ip === networkInfo.ip && network.port === networkInfo.port) network.online = status
                })
                return settingsStore;
            })
        },
        //Delete a network from the network list
        deleteNetwork: (networkInfo) => {
            //Reject undefined or missing info
            if (!networkInfo || typeof networkInfo === 'undefined') return;
            if (!networkInfo.name || !networkInfo.ip || !networkInfo.port) return;
            //Reject if the network passed in is a default lamden netowrk
            if (networkInfo.lamden) return;
            SettingsStore.update(settingsStore => {
                //Filter out the matching network.
                let newNetworks = settingsStore.networks.filter(f => {
                    if (f.name === networkInfo.name && f.ip === networkInfo.ip && f.port === networkInfo.port) return false
                    return true;
                })
                //Make another network in the list "selected"
                newNetworks.map((network, index) => {
                    network.selected = index === 0 ? true : false;
                })
                //Set the network list into the settings store
                settingsStore.networks = newNetworks;
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

export const currentPage = derived(
	SettingsStore,
	$SettingsStore => {
        try{
            return $SettingsStore.currentPage;
        }
        catch (e){
            return defualtSettingsStore.currentPage;
        }
    }
);

export const firstRun = derived(
	SettingsStore,
	$SettingsStore => {
        try{
            return $SettingsStore.firstRun;
        }
        catch (e){
            return defualtSettingsStore.firstRun;
        }
    }
);

export const themeStyle = derived(
	SettingsStore,
	$SettingsStore => {
        try{
            return $SettingsStore.themeStyle;
        }
        catch (e){
            return defualtSettingsStore.themeStyle;
        }
    }
);

export const networks = derived(
	SettingsStore,
	$SettingsStore => {
        let networks = [];
        try{
            $SettingsStore.networks.map(network => {
                networks.push({
                    name: network.name,
                    value: network,
                    selected: network.selected
                })
            })
        }
        catch (e){
            defualtSettingsStore.networks.map(network => {
                networks.push({
                    name: network.name,
                    value: network,
                    selected: network.selected
                })
            })
        }
        return networks;
    }
);

export const currentNetwork = derived(
	SettingsStore,
	$SettingsStore => {
        try{
            return $SettingsStore.networks.find(network => network.selected === true)
        }
        catch (e){
            return defualtSettingsStore.networks[0];
        }
    }
);

export const storageInfo = derived(
	SettingsStore,
	$SettingsStore => {
        try{
            return $SettingsStore.storage;
        }
        catch (e){
            return defualtSettingsStore.storage;
        }
    }
);