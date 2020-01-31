import { get } from 'svelte/store';
import { CacheStore } from '../../../src/js/stores/CacheStore.js';
import "cypress-localstorage-commands";

function networkKey(networkObj){
    return `${networkObj.ip}:${networkObj.port}`
}

const storeSpys = {
    'addContract': (contractName, networkObj) => {
        return CacheStore.addContract(contractName, networkObj);
    },
    'contractExists': (contractName, networkObj) => {
        return CacheStore.contractExists(contractName, networkObj);
    },
    'refreshNetwork': (networkObj) => {
        return CacheStore.refreshNetwork(networkObj);
    },
    'set': (value) => {
        return CacheStore.set(value);
    }
}

let newNetwork = {
    name: 'Public TestNet', 
    ip: '1.1.1.1', 
    port: '5555'
}

const badNameValues = [undefined, null, [], {}, true, 10, '']
const badSetValues = [undefined, null, [], true, '', 0.01]

describe('Test the Cache Store', () => {
    before(function() {
        window.localStorage.setItem("cache", JSON.stringify(get(CacheStore)))
        cy.log(window.localStorage.getItem("cache"))
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
    //Testing generic store functions
    it('Store: Initializes to empty object', () => {
        cy.expect(Object.keys(get(CacheStore)).length).to.eq(0)
    })

    it('Store: Saves updates to local storage', () => {
        //Add a contract to the Store
        storeSpys.addContract('save-to-ls', newNetwork)
        cy.log(storeSpys.addContract)
        //Contract exist in store
        storeSpys.contractExists('save-to-ls', newNetwork)
        cy.expect(storeSpys.contractExists).to.have.returned(true);
        //Localstorage matches store in memory
        let ls = window.localStorage.getItem("cache");
        let storeString = JSON.stringify(get(CacheStore))
        cy.expect(ls).to.eq(storeString)
    })

    //Testing Adding a contract to cache
    it('addContract: Can cache a contract on a network', () => {
        //Add a contract to the Store
        storeSpys.addContract('add-new-contract', newNetwork)
        //Contract exist in store
        storeSpys.contractExists('add-new-contract', newNetwork)
        cy.expect(storeSpys.contractExists).to.have.returned(true);
    })

    it('addContract: Rejects undefiend or bad arguments and does not error', () => {
        let keySizeBefore = Object.keys(get(CacheStore)['contracts']).length
        //Try a bunch of bad values
        try {
            badNameValues.map(value => storeSpys.addContract(value, newNetwork))
            badNameValues.map(value => storeSpys.addContract('should-not-exist', value))
        } catch (e) {}
        //Makes sure the bad values didn't cause an error
        cy.expect(storeSpys.addContract).to.not.have.thrown(Error)
        //Make sure the size of the file store didn't change (nothing was deleted)
        let keySizeAfter = Object.keys(get(CacheStore)['contracts']).length
        cy.expect(keySizeAfter).to.eq(keySizeBefore)
    })

    //Testing checking if a contract exists in cache
    it('contractExists: Returns if a contract exists in cache', () => {
        //Create network
        let existsNetwork = JSON.parse(JSON.stringify(newNetwork))
        existsNetwork.name = 'Should Exist'
        existsNetwork.ip = '2.2.2.2'

        //Add a contract to the Store
        storeSpys.addContract('should-exist', existsNetwork)
        //Contract exist in store
        storeSpys.contractExists('should-exist', existsNetwork)
        cy.expect(storeSpys.contractExists).to.have.returned(true);
    })

    it('contractExists: Rejects bad arguments and does not error', () => {
        function testContractExists(contractName, networkName){
            try {
                storeSpys.contractExists(contractName, networkName)
                cy.expect(storeSpys.contractExists).to.have.returned(false);
            } catch (e) {}
            //Makes sure the bad values didn't cause an error
            cy.expect(storeSpys.contractExists).to.not.have.thrown(Error)
        }
        //Try a bunch of bad values
        badNameValues.map(value => testContractExists(value, 'Public TestNet'))
        badNameValues.map(value => testContractExists('should-not-exist', value))
    })

    //Test if the store will refresh the cache of a network
    it('refreshNetwork: Will remove all contracts from a network\'s cache', () => {
        let refreshNetwork = JSON.parse(JSON.stringify(newNetwork))
        refreshNetwork.name = 'Network To Refresh'
        refreshNetwork.ip = '3.3.3.3'

        let netKey = networkKey(refreshNetwork)

        //Add some contracts to a network
        storeSpys.addContract('contract-1', refreshNetwork)
        storeSpys.addContract('contract-2', refreshNetwork)
        storeSpys.addContract('contract-3', refreshNetwork)

        //Get the key size of the network key before refresh
        let keySizeBefore = Object.keys(get(CacheStore)['contracts'][netKey]).length
        cy.expect(keySizeBefore).to.be.greaterThan(0)

        //Refresh Network key
        storeSpys.refreshNetwork(refreshNetwork)

        //Should be nothing under the key
        let keySizeAfter = Object.keys(get(CacheStore)['contracts'][netKey]).length
        cy.expect(keySizeAfter).to.eq(0)
    })

    //Test if the store will refresh the cache of a network
    it('refreshNetwork: Rejects bad arguments and does not error', () => {
        //Try a bunch of bad values
        try {
            badNameValues.map(value => storeSpys.refreshNetwork(value))
        } catch (e) {}
        //Makes sure the bad values didn't cause an error
        cy.expect(storeSpys.refreshNetwork).to.not.have.thrown(Error)
    })

    //Test Store Corruptability
    it('set: Cannot set a non Object Value', () => {
        //Get the current value of the localstorage
        let beforeLs = window.localStorage.getItem("cache");

        //Attempt to set the Store Value to corrupt values
        try {
            badSetValues.map(value => storeSpys.set(value))
        } catch (e) {}

        //Makes sure the bad values didn't cause an error
        cy.expect(storeSpys.set).to.not.have.thrown(Error)

        //Get the new value of the localstorage
        let afterLs = window.localStorage.getItem("cache");

        //Expect the local storage to not have been overwritten and still contain the file
        cy.expect(beforeLs).to.eq(afterLs)
        cy.expect(afterLs).to.eq(JSON.stringify(get(CacheStore)))
    })

    it('set: Can set a proper Value', () => {
        //Add a contract so the store isn't empty
        storeSpys.addContract('contract-1', newNetwork)

        //Get the current value of the localstorage
        let beforeLs = window.localStorage.getItem("cache");

        //Attempt to set the Store Value to corrupt values
        try {
            storeSpys.set({})
        } catch (e) {}

        //Makes sure the bad values didn't cause an error
        cy.expect(storeSpys.set).to.not.have.thrown(Error)

        //Get the new value of the localstorage
        let afterLs = window.localStorage.getItem("cache");

        //Expect the local storage to not have been overwritten and still contain the file
        cy.expect(beforeLs).to.not.eq(afterLs)
        cy.expect(afterLs).to.eq(JSON.stringify(get(CacheStore)))
        cy.log(JSON.stringify(get(CacheStore)))
        
    })
})