import whitelabel from '../../../whitelabel.json'

import { writable, derived, get } from 'svelte/store';

import * as validators from 'types-validate-assert'
const { validateTypes } = validators; 

import { networkKey } from './stores.js';
import { isNetworkStoreObj, isNetworkObj } from '../objectValidations';

import Lamden from 'lamden-js'

let lamdenNetworks = whitelabel.networks

let defualtNetworksStore = {
    lamden: lamdenNetworks,
    user : [],
    current: `${whitelabel.networks[0].name}|${whitelabel.networks[0].type}|lamden`
}

const makeList = (networkStore) => {
    return [...networkStore.user, ...networkStore.lamden];
}

const foundNetwork = (networkStore, matchKey) => {
    let networks = makeList(networkStore);
    return networks.find(network => networkKey(network) === matchKey)
}

//A Derrived Store of both user and lamden networks
export const mainnetNetwork = new Lamden.Network(whitelabel.networks.find(network => network.type === "mainnet"));

//A Derrived Store of both user and lamden networks
export const testnetNetwork = new Lamden.Network(whitelabel.networks.find(network => network.type === "testnet"));

export const createNetworksStore = () => {
    let initialized = false;
    let startValue = defualtNetworksStore;

    const getStore = () => {
        //Set the Coinstore to the value of the chome.storage.local
        chrome.storage.local.get({"networks": startValue}, function(getValue) {
            initialized = true;
            NetworksStore.set(getValue.networks)
        });
    }
    const updateAllBalances = (netKey = undefined) => {
        let networkStore = get(NetworksStore);
        let currentNetwork = foundNetwork(get(NetworksStore), !netKey ? networkStore.current : netKey)
        chrome.runtime.sendMessage({type: 'handleSwitchNetwork', data: currentNetwork})
    }
    
    //Create Intial Store
    const NetworksStore = writable(startValue);

    //This is called everytime the NetworksStore updated
    NetworksStore.subscribe(currentStore => {
        if (!initialized) {
            return currentStore
        }
        //Only accept an object that can be determined to be a networks storage object
        // if store has already been initialized
        if (isNetworkStoreObj(currentStore)){
            currentStore.lamden = lamdenNetworks;
            let found = foundNetwork(currentStore, currentStore.current)
            if (!found) currentStore.current = defualtNetworksStore.current
            chrome.storage.local.set({"networks": currentStore});
        }else{
            //If non-object found then set the store back to the previous local store value
            getStore();
        }
    });

    //Set the NetworksStore to the value of the chome.storage.local
    getStore()

    let subscribe = NetworksStore.subscribe;
    let update = NetworksStore.update;
    let set = NetworksStore.set;

    return {
        subscribe,
        set,
        update,
        mainnetNetwork,
        testnetNetwork,
        //Make a network the current selected network
        //This sets the value of the derived "currentNetwork" store
        setCurrentNetwork: (networkInfo) => {
            //Reject undefined or missing Network info
            if (!isNetworkObj(networkInfo)) return;

            let netKey = networkKey(networkInfo);

            //If this is already the current network then do nothing
            if (netKey !== get(NetworksStore).current){
                NetworksStore.update(networksStore => {
                    //If the network is found then set this as the current network
                    if (foundNetwork(networksStore, netKey)) networksStore.current = netKey;
                    return networksStore;
                })
                updateAllBalances(netKey)
                chrome.runtime.sendMessage({type: 'updateNodes'})
            }
        },
        setNetworkByKey: (netKey) => {
            if (!validateTypes.isStringWithValue(netKey)) return

            //If this is already the current network then do nothing
            if (netKey === get(NetworksStore).current) return
            //Match netKey to a network
            let foundNetwork = foundNetwork(get(NetworksStore), netKey)
            //If network is found, make it current
            if(foundNetwork){
                NetworksStore.update(networksStore => {
                    networksStore.current = netKey;
                    return networksStore;
                })
                updateAllBalances(netKey)
            }

        },
        //Add a new network into the Networks Array
        addNetwork: (networkInfo) => {
            //Reject undefined or missing Network info
            if (!isNetworkObj(networkInfo)) return {added: false, reason: 'badArg'};

            if (networkInfo.name.includes("|")) return {added: false, reason: 'badArg'};

            //Set Defaults if they weren't passed
            if (!networkInfo.online) networkInfo.online = false;


            //Don't add network if a similar one exits
            let netKey = networkKey(networkInfo);
            if (foundNetwork(get(NetworksStore), netKey)) return {added: false, reason: 'duplicate'};
            
            NetworksStore.update(networksStore => {
                //Push new network to the networks Array
                networksStore.user.push(networkInfo);
                return networksStore;
            })
            return {added: true};
        },
        //Add a new network into the Networks Array
        updateNetwork: (oldNetworkInfo, newNetworkInfo) => {
            //Reject undefined or missing Network info
            if (!isNetworkObj(newNetworkInfo)) return {updated: false, reason: 'badArg'};

            if (newNetworkInfo.name.includes("|")) return {updated: false, reason: 'badArg'};

            //Set Defaults if they weren't passed
            if (!newNetworkInfo.online) newNetworkInfo.online = false;


            //Don't add network if a similar one exits
            let netKey = networkKey(oldNetworkInfo);
            let networks = makeList(get(NetworksStore));
            let index = networks.findIndex(network => networkKey(network) === netKey)
            
            NetworksStore.update(networksStore => {
                //Override the old networkinfo
                networksStore.user[index] = newNetworkInfo;
                return networksStore;
            })
            return {updated: true};
        },
        //Change the online status of network to true/false
        setNetworkStatus: (networkInfo, status) => {
            //Reject undefined or missing info
            if (!isNetworkObj(networkInfo)) return;
            if (!validateTypes.isBoolean(status)) return;
            let netKey = networkKey(networkInfo)
            NetworksStore.update(networksStore => {
                makeList(networksStore).map(network => {
                    //change the Status to the networks that match the IP and Port
                    if (networkKey(network) === netKey) network.online = status
                })
                return networksStore;
            })
        },
        //Delete a network from the network list
        deleteNetwork: (networkObj) => {
            //Reject undefined or missing Network info
            if (!networkObj.classname === 'Network') return;

            let netKey = networkKey(networkObj)
            NetworksStore.update(networksStore => {
                
                //Filter out the matching network.
                networksStore.user = networksStore.user.filter(network => {
                    if (networkKey(network) === netKey) return false
                    return true;
                })
                //If this was the currently selected network then change to another network
                if (netKey === networksStore.current){
                    networksStore.current = networkKey(networksStore.lamden[0])
                }

                return networksStore;
            })
            updateAllBalances(netKey)
        }
    };
}

//Networks Stores
export const NetworksStore = createNetworksStore();

//A Derrived Store of both user and lamden networks
export const allNetworks = derived(
	NetworksStore,
    $NetworksStore => {
        return makeList($NetworksStore)
})



//A Derrived Store that contains values formatted for a DropDown Box
export const networksDropDownList = derived(
	NetworksStore,
	$NetworksStore => {
        let networks = [];
        function isSelected(network){
            return networkKey(network) === $NetworksStore.current
        }
        function pushItem(item){
            console.log(item)
            if (new Date().getTime() < 1675116000000 && item.networkName === "arko" && item.type === "mainnet") {
                return
            }
            item.status = false
            networks.push({
                name: item.name,
                value: item,
                selected: isSelected(item)
            })
        }
        $NetworksStore.lamden.map(network => pushItem(network))
        $NetworksStore.user.map(network => pushItem(network))
        return networks;
    }
);

//A Derrived Store that contains values formatted for a DropDown Box
export function networkTypesDropDownList(){
    return ['mockchain', 'testnet', 'mainnet'].map(type => {
        return {
            name: type,
            value: type,
            selected: type === 'mockchain'
        }
    })
}


//A Derrived Store that returns the currenly seletecd network object
export const currentNetwork = derived(
	NetworksStore,
	$NetworksStore => {
        let current;
        let found = foundNetwork($NetworksStore, $NetworksStore.current);
        if (found) {
            current =  new Lamden.Network(found);
            current.online = found.online ? found.online : false
        } else {
            current = new Lamden.Network($NetworksStore.lamden[0])
            current.online = $NetworksStore.lamden[0].online ? $NetworksStore.lamden[0].online : false
        }
        return current
    }
);

//A Derrived Store that returns the currenly seletecd network object
export const currentNetworkOnline = derived(
	NetworksStore,
	async ($NetworksStore, set) => {
        // set(null)
        let found = foundNetwork($NetworksStore, $NetworksStore.current);
        let currentNetwork
        if (found) currentNetwork = new Lamden.Network(found);
        else currentNetwork = new Lamden.Network($NetworksStore.lamden[0])
        currentNetwork.API.pingServer().then(set).catch(e => set(false))
    }
);


export const currentNetworkName = derived(
	NetworksStore,
	$NetworksStore => {
        let found = foundNetwork($NetworksStore, $NetworksStore.current);
        let net = whitelabel.networks.find(t => found.name === t.name)
        if (net) {
            return net.networkName
        } else {
            return "legacy"
        }
    }
);