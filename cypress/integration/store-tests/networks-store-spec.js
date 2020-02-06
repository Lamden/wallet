import { get } from 'svelte/store';
import { NetworksStore, allNetworks, networksDropDownList, currentNetwork } from '../../../src/js/stores/networksStore.js';
import "cypress-localstorage-commands";

const networkKey = (networkObj) => {
    return `${networkObj.ip}:${networkObj.port}`
}

const storeSpys = {
    'setCurrentNetwork': (networkInfo) => {
        return NetworksStore.setCurrentNetwork(networkInfo);
    },
    'addNetwork': (networkInfo) => {
        return NetworksStore.addNetwork(networkInfo);
    },
    'setNetworkStatus': (networkInfo, status) => {
        return NetworksStore.setNetworkStatus(networkInfo, status);
    },
    'deleteNetwork': (networkInfo) => {
        return NetworksStore.deleteNetwork(networkInfo);
    },
    'set': (value) => {
        return NetworksStore.set(value);
    }
}
const badValues = [undefined, null, [], {}, true, '', 0.01]

let newNetwork = {
    name: 'New Testing Network', 
    ip: '1.1.1.1', 
    port: '5555'
}

let makeCurrNetwork = {
    name: 'Make This Current', 
    ip: '2.2.2.2', 
    port: '6666'
}

describe('Test the Settings Store', () => {
    before(function() {
        window.localStorage.setItem("networks", JSON.stringify(get(NetworksStore)))
        cy.saveLocalStorage();
    })

    beforeEach(function() {
        cy.restoreLocalStorage();
        Object.keys(storeSpys).map(func => {
            cy.spy(storeSpys, func)
        })
    })

    afterEach(function() {
        cy.saveLocalStorage();
    })

    it('Store: Loads default settings object and values', () => {
        let store = get(NetworksStore)
        cy.expect(store.user).to.exist
        cy.expect(store.lamden).to.exist
        cy.expect(store.current).to.exist
        cy.expect(store.lamden.length).to.be.greaterThan(0)
    })

    it('Store: Saves updates to local storage', () => {
        //Store values should match
        let ls = window.localStorage.getItem("networks") 
        let storeString = JSON.stringify(get(NetworksStore))
        cy.expect(ls).to.eq(storeString)
    })

    //Testing Default Derived Stores
    it('Derived Stores: Default Derived Store Values are correct', () => {
        let store = get(NetworksStore)

        //allNetworks is the same size as Networks Store
        let storeSize = store.user.length + store.lamden.length
        cy.expect(get(allNetworks).length).to.eq(storeSize)

        //networksDropDownList is the same size as Networks Store and 
        //its selected item is the current network
        cy.expect(get(networksDropDownList).length).to.eq(storeSize)
        get(networksDropDownList).map(network => {
            if (network.selected){
                let netKey = networkKey(network.value)
                cy.expect(netKey).to.eq(store.current)
            }
        })
        //currentNetwork derived store is the current network
        cy.expect(networkKey(get(currentNetwork))).to.eq(store.current)
    })

    //Testing Add Networks
    it('addNetwork: Can Add a network and sets proper defaults', () => {
        //Get the size of the networks array before
        let beforeLen = get(NetworksStore).user.length
        //Create a new network object
        let newNetworkObj = JSON.parse(JSON.stringify(newNetwork))
        newNetworkObj.name = 'addNetwork-test'
        //Add network object and get response
        let response = storeSpys.addNetwork(newNetworkObj)
        cy.expect(response.added).to.eq(true)
        //Get the new size of the array
        let afterLen = get(NetworksStore).user.length
        //Check that it's 1 more, meaning an object was added
        cy.expect(afterLen).to.eq(beforeLen + 1)
        //Check that the object that was added was the one we wanted to be

        let foundItem = false;
        get(NetworksStore).user.map(network => {
            if (network.name === 'addNetwork-test') foundItem = true;
            cy.log(foundItem)
        })  
        cy.expect(foundItem).to.eq(true)
    })

    it('addNetwork: Rejects a duplicate network ip/port combo', () => {
        //Get the size of the networks array before
        let beforeLen = get(NetworksStore).user.length
        //Create new network object
        let newNetworkObj = JSON.parse(JSON.stringify(newNetwork))
        newNetworkObj.name = 'addNetwork-test'
        //Add network object and get response
        let response = storeSpys.addNetwork(newNetworkObj)
        cy.expect(response.added).to.eq(false)
        cy.expect(response.reason).to.eq('duplicate')
        //Get the new size of the array
        let afterLen = get(NetworksStore).user.length
        //Check that it's 1 more, meaning an object was added
        cy.expect(afterLen).to.eq(beforeLen)
    })

    it('addNetwork: Rejects bad and undefined values and doesn\'t error', () => {
        let beforeValue = JSON.stringify(get(NetworksStore).user);
        let name = 'Good Network Name'; 
        let ip = '1.1.1.1';
        let port = '5555';
        //Try a bunch of bad values
        try{
            badValues.map(value => storeSpys.addNetwork(value))
            badValues.map(value => storeSpys.addNetwork({name: value, ip, port}))
            badValues.map(value => storeSpys.addNetwork({name, ip: value, port}))
            badValues.map(value => storeSpys.addNetwork({name, ip, port: value}))
        } catch (e){}
        //Makes sure the bad values didn't cause an error
        cy.expect(storeSpys.addNetwork).to.not.have.thrown(Error)

        //The values of the current page should not have changed
        let afterValue = JSON.stringify(get(NetworksStore).user);
        cy.expect(afterValue).to.eq(beforeValue)
    })

    it('setCurrentNetwork: Can make another network active', () => {
        let netKey = networkKey(makeCurrNetwork)
        //Add network object
        let response = storeSpys.addNetwork(makeCurrNetwork)
        cy.expect(response.added).to.eq(true)
        //Make it current
        storeSpys.setCurrentNetwork(makeCurrNetwork)
        //check 'current' store value is set to this key
        let store = get(NetworksStore)
        cy.expect(store.current).to.eq(netKey)
        //Check the currentNetwork Derived Store is updated
        let currNetworkKey = networkKey(get(currentNetwork))
        cy.expect(currNetworkKey).to.eq(netKey)
    })

    it('setCurrentNetwork: Rejects bad and undefined values and doesn\'t error', () => {
        let store = get(NetworksStore)
        //Change to a different network
        storeSpys.setCurrentNetwork(store.lamden[0])
        //Get the before current Network value to comapre after
        let beforeValue = JSON.stringify(get(NetworksStore).current);
        //Try a bunch of bad values
        let name = makeCurrNetwork.name; 
        let ip = makeCurrNetwork.ip;
        let port = makeCurrNetwork.port;

        try{
            badValues.map(value => storeSpys.setCurrentNetwork(value))
            badValues.map(value => storeSpys.setCurrentNetwork({name: value, ip, port}))
            badValues.map(value => storeSpys.setCurrentNetwork({name, ip: value, port}))
            badValues.map(value => storeSpys.setCurrentNetwork({name, ip, port: value}))
        } catch (e){}
        //Makes sure the bad values didn't cause an error
        cy.expect(storeSpys.setCurrentNetwork).to.not.have.thrown(Error)

        //The values of the current page should not have changed
        let afterValue = JSON.stringify(get(NetworksStore).current);
        cy.expect(afterValue).to.eq(beforeValue)
    })

    it('setNetworkStatus: Can Change network status', () => {
        let networkObj = JSON.parse(JSON.stringify(newNetwork))
        networkObj.ip = '3.3.3.3'
        //Add network object
        let response = storeSpys.addNetwork(networkObj)
        cy.expect(response.added).to.eq(true)
        //Check status of added object (should be false)
        let netKey = networkKey(networkObj)
        get(NetworksStore).user.map(network => {
            if (netKey === networkKey(network)){
                cy.expect(network.online).to.eq(false)
            }
        })
        //Set the network to true
        storeSpys.setNetworkStatus(networkObj, true)
        //Validate the network object is now true
        get(NetworksStore).user.map(network => {
            if (netKey === networkKey(network)){
                cy.expect(network.online).to.eq(true)
            }
        })

    })

    it('setNetworkStatus: Rejects bad and undefined values and doesn\'t error', () => {
        let networkObj = JSON.parse(JSON.stringify(newNetwork))
        networkObj.ip = '4.4.4.4';

        //Add network object
        let response = storeSpys.addNetwork(networkObj)
        cy.expect(response.added).to.eq(true)

        //Check status of added object (should be false)
        let netKey = networkKey(networkObj)
        get(NetworksStore).user.map(network => {
            if (netKey === networkKey(network)){
                cy.expect(network.online).to.eq(false)
            }
        })

        //Try a bunch of bad values
        let name = networkObj.name; 
        let ip = networkObj.ip;
        let port = networkObj.port;
        try{
            badValues.map(value => storeSpys.setCurrentNetwork(value))
            badValues.map(value => storeSpys.setCurrentNetwork({name: value, ip, port}))
            badValues.map(value => storeSpys.setCurrentNetwork({name, ip: value, port}))
            badValues.map(value => storeSpys.setCurrentNetwork({name, ip, port: value}))
        } catch (e){}
        //Makes sure the bad values didn't cause an error
        cy.expect(storeSpys.setCurrentNetwork).to.not.have.thrown(Error)

        //Check the value of the network's online status is still false
        get(NetworksStore).user.map(network => {
            if (netKey === networkKey(network)){
                cy.expect(network.online).to.eq(false)
            }
        })
    })

    it('deleteNetwork: Can delete a network', () => {
        let networkObj = JSON.parse(JSON.stringify(newNetwork))
        networkObj.ip = '5.5.5.5'
        //Add network object
        let response = storeSpys.addNetwork(networkObj)
        cy.expect(response.added).to.eq(true)

        //Delete network object
        storeSpys.deleteNetwork(networkObj)

        //Validate the store does not exist anymore
        let netKey = networkKey(networkObj)
        let found = false;
        get(NetworksStore).user.map(network => {
            if (netKey === networkKey(network)) found = true;
        })
        cy.expect(found).to.eq(false)
    })

    it('deleteNetwork: Sets another network as current if the deleted network was current', () => {
        let networkObj = JSON.parse(JSON.stringify(newNetwork))
        networkObj.ip = '6.6.6.6'
        //Add network object
        let response = storeSpys.addNetwork(networkObj)
        cy.expect(response.added).to.eq(true)

        //Set this network object as current network
        storeSpys.setCurrentNetwork(networkObj)
        let netKey = networkKey(networkObj)
        cy.expect(netKey).to.eq(get(NetworksStore).current)

        //Delete network object
        storeSpys.deleteNetwork(networkObj)

        //The delete function will always default current network back to lamden[0]
        let lamdenNetKey = networkKey(get(NetworksStore).lamden[0])
        cy.expect(lamdenNetKey).to.eq(get(NetworksStore).current)
    })
 
    it('deleteNetwork: Rejects Deleteing undefined network', () => {
        let networkObj = JSON.parse(JSON.stringify(newNetwork))
        networkObj.ip = '7.7.7.7'

        //Add network object
        let response = storeSpys.addNetwork(networkObj)
        cy.expect(response.added).to.eq(true)

        //Try to delete the store with a bunch of bad values
        let name = networkObj.name; 
        let ip = networkObj.ip;
        let port = networkObj.port;
        try{
            badValues.map(value => storeSpys.deleteNetwork(value))
            badValues.map(value => storeSpys.deleteNetwork({name: value, ip, port}))
            badValues.map(value => storeSpys.deleteNetwork({name, ip: value, port}))
            badValues.map(value => storeSpys.deleteNetwork({name, ip, port: value}))
        } catch (e){}
        //Makes sure the bad values didn't cause an error
        cy.expect(storeSpys.deleteNetwork).to.not.have.thrown(Error)

        //Validate the store was not deleted
        let found = false;
        let netKey = networkKey(networkObj);
        get(NetworksStore).user.map(network => {
            if (netKey === networkKey(network)) found = true;
        })
        cy.expect(found).to.eq(true)
    })

    //Test Store Corruptability
    it('set: Cannot set a non NetworkStore Object Value into Local Storage', () => {
        //Get the current value of the localstorage
        let beforeLs = window.localStorage.getItem("networks");
        //Attempt to set the Store Value to corrupt values
        try {
            badValues.map(value => storeSpys.set(value))
            badValues.map(value => {
                //empty array is valid for the user property
                if (!Array.isArray(value)){
                    storeSpys.set({user: value, lamden: [newNetwork], current: 'netKey'})
                }
            })
            badValues.map(value => storeSpys.set({user: [], lamden: value, current: 'netKey'}))
            badValues.map(value => storeSpys.set({user: [], lamden: [newNetwork], current: value}))
        } catch (e) {}

        //Makes sure the bad values didn't cause an error
        cy.expect(storeSpys.set).to.not.have.thrown(Error)

        //Get the new value of the localstorage
        let afterLs = window.localStorage.getItem("networks");

        //Expect the local storage to not have been overwritten and still contain the file
        cy.expect(beforeLs).to.eq(afterLs)
        cy.expect(afterLs).to.eq(JSON.stringify(get(NetworksStore)))
    })

    it('set: Can set a proper Value', () => {
        //Get the current value of the localstorage
        let beforeLs = window.localStorage.getItem("networks");
        //Attempt to set the Store Value to corrupt values
        try {
            storeSpys.set({
                user: [], 
                lamden: [...get(NetworksStore).lamden], 
                current: networkKey(get(NetworksStore).lamden[0])
            })
        } catch (e) {}

        //Makes sure the bad values didn't cause an error
        cy.expect(storeSpys.set).to.not.have.thrown(Error)

        //Get the new value of the localstorage
        let afterLs = window.localStorage.getItem("networks");

        //Expect the local storage to not have been overwritten and still contain the file
        cy.expect(beforeLs).to.not.eq(afterLs)
        cy.expect(afterLs).to.eq(JSON.stringify(get(NetworksStore)))
    })
})