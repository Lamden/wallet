import { writable, derived, get } from 'svelte/store';

import * as validators from 'types-validate-assert'
const { validateTypes } = validators; 

import { networkKey } from './stores.js';
import { isNetworkStoreObj, isNetworkObj } from '../objectValidations';

import Lamden from 'lamden-js'

const lamdenNetworks = [
    {name: 'Lamden Public Testnet', host:'https://testnet.lamden.io', port: '443', type:'mockchain', lamden: true}
]

const defualtNetworksStore = {
    lamden: [],
    user : [],
    current: 'https://testnet.lamden.io:443'
}

function makeList(networkStore){
    return [...networkStore.user, ...networkStore.lamden];
}

function foundNetwork(networkStore, matchKey){
    let networks = makeList(networkStore);
    let foundNetwork = networks.find(network => networkKey(network) === matchKey)
    return foundNetwork;
}

export const createNetworksStore = (startValue) => {
    startValue = defualtNetworksStore;
    //Get store value from localstorate
    const json = localStorage.getItem('networks');
    //If there is a value then set it as the inital value
    if (json) {
        startValue = JSON.parse(json)
    }
    //Update store with lamdenNetwork info
    startValue.lamden = lamdenNetworks;
    //Create NetworksStore with the inital value
    const NetworksStore = writable(startValue);

    //This gets called everytime the Store updates
    NetworksStore.subscribe(current => {
        //If the store was updated to an empty or non Object then recover to previous value
        if (isNetworkStoreObj(current)){
            //Save Value to local storage
            localStorage.setItem('networks', JSON.stringify(current));
        } else {
            //Recover store value in memory to previous local storage value
            let json = localStorage.getItem("networks")
            if (json) NetworksStore.set(JSON.parse(json))
            console.log('Recovered from bad Networks Store Value')
        }
    });

    let subscribe = NetworksStore.subscribe;
    let update = NetworksStore.update;
    let set = NetworksStore.set;

    return {
        startValue,
        subscribe,
        set,
        update,
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
                    //if (foundNetwork(networksStore, netKey)) throw new Error('found')
                    //throw new Error('not found')
                    if (foundNetwork(networksStore, netKey)) networksStore.current = netKey;
                    return networksStore;
                })
            }
        },
        //Add a new network into the Networks Array
        addNetwork: (networkInfo) => {
            //Reject undefined or missing Network info
            if (!isNetworkObj(networkInfo)) return {added: false, reason: 'badArg'};

            //Set Defaults if they weren't passed
            if (!networkInfo.online) networkInfo.online = false;

            //Don't add network if ip/port already exists
            let netKey = networkKey(networkInfo);
            if (foundNetwork(get(NetworksStore), netKey)) return {added: false, reason: 'duplicate'};
            
            NetworksStore.update(networksStore => {
                //Push new network to the networks Array
                networksStore.user.push(networkInfo);
                return networksStore;
            })
            return {added: true};
        },
        //Change the online status of network to true/false
        setNetworkStatus: (networkInfo, status) => {
            //Reject undefined or missing info
            if (!isNetworkObj(networkInfo) || !validateTypes.isBoolean(status)) return;

            let netKey = networkKey(networkInfo)
            NetworksStore.update(networksStore => {
                makeList(networksStore).map(network => {
                    //change the Status to the networks that match the IP and Port
                    if (networkKey(network) === netKey) network.online = status
                })
                return networksStore;
            })
        },
        //Returns the current network Object
        getCurrentNetwork: () => {
            let found = foundNetwork(get(NetworksStore), get(NetworksStore).current);
            if (found) return found;
            return $NetworksStore.lamden[0]
        },
        //Delete a network from the network list
        deleteNetwork: (networkInfo) => {
            //Reject undefined or missing Network info
            if (!isNetworkObj(networkInfo)) return;

            let netKey = networkKey(networkInfo)
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

//A Derrived Store that returns the currenly seletecd network object
export const currentNetwork = derived(
	NetworksStore,
	$NetworksStore => {
        let found = foundNetwork($NetworksStore, $NetworksStore.current);
        if (found) new Lamden.Network(found);
        return new Lamden.Network($NetworksStore.lamden[0])
    }
);
