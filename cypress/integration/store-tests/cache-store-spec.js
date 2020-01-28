import { get } from 'svelte/store';
import { CacheStore } from '../../../src/js/stores/CacheStore.js';
import "cypress-localstorage-commands";

const storeSpys = {
    'addContract': (contractName, networkName) => {
        return CacheStore.addContract(contractName, networkName);
    },
    'contractExists': (contractName, networkName) => {
        return CacheStore.contractExists(contractName, networkName);
    },
    'refreshNetwork': (networkName) => {
        return CacheStore.refreshNetwork(networkName);
    }
}

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
        storeSpys.addContract('save-to-ls', 'Public TestNet')
        //Contract exist in store
        storeSpys.contractExists('save-to-ls', 'Public TestNet')
        cy.expect(storeSpys.contractExists).to.have.returned(true);
        //Localstorage matches store in memory
        let ls = window.localStorage.getItem("cache");
        let storeString = JSON.stringify(get(CacheStore))
        cy.expect(ls).to.eq(storeString)
    })

    //Testing Adding a contract to cache
    it('addContract: Can cache a contract on a network', () => {
        //Add a contract to the Store
        storeSpys.addContract('add-new-contract', 'Public TestNet')
        //Contract exist in store
        storeSpys.contractExists('add-new-contract', 'Public TestNet')
        cy.expect(storeSpys.contractExists).to.have.returned(true);
    })

    it('addContract: Rejects undefiend or bad arguments and does not error', () => {
        let keySizeBefore = Object.keys(get(CacheStore)['contracts']).length
        //Try a bunch of bad values
        try {
            storeSpys.addContract(undefined, 'Public TestNet')
            storeSpys.addContract(null, 'Public TestNet')
            storeSpys.addContract('', 'Public TestNet')
            storeSpys.addContract([], 'Public TestNet')
            storeSpys.addContract({}, 'Public TestNet')
            storeSpys.addContract(false, 'Public TestNet')
            storeSpys.addContract(5, 'Public TestNet')
            storeSpys.addContract('should-not-exist')
            storeSpys.addContract('should-not-exist', null)
            storeSpys.addContract('should-not-exist', '')
            storeSpys.addContract('should-not-exist', [])
            storeSpys.addContract('should-not-exist', {})
            storeSpys.addContract('should-not-exist', true)
            storeSpys.addContract('should-not-exist', 5)
        } catch (e) {}
        //Makes sure the bad values didn't cause an error
        cy.expect(storeSpys.addContract).to.not.have.thrown(Error)
        //Make sure the size of the file store didn't change (nothing was deleted)
        let keySizeAfter = Object.keys(get(CacheStore)['contracts']).length
        cy.expect(keySizeAfter).to.eq(keySizeBefore)
    })

    //Testing checking if a contract exists in cache
    it('contractExists: Returns if a contract exists in cache', () => {
        //Add a contract to the Store
        storeSpys.addContract('should-exist', 'Public TestNet')
        //Contract exist in store
        storeSpys.contractExists('should-exist', 'Public TestNet')
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
        testContractExists(undefined, 'Public TestNet')
        testContractExists(null, 'Public TestNet')
        testContractExists('', 'Public TestNet')
        testContractExists([], 'Public TestNet')
        testContractExists({}, 'Public TestNet')
        testContractExists(true, 'Public TestNet')
        testContractExists(5, 'Public TestNet')
        testContractExists('should-not-exist')
        testContractExists('should-not-exist', null)
        testContractExists('should-not-exist', '')
        testContractExists('should-not-exist', [])
        testContractExists('should-not-exist', {})
        testContractExists('should-not-exist', true)
        testContractExists('should-not-exist', 5)
    })

    //Test if the store will refresh the cache of a network
    it('refreshNetwork: Will remove all contracts from a network\'s cache', () => {
        //Add some contracts to a network
        storeSpys.addContract('contract-1', 'Network To Refresh')
        storeSpys.addContract('contract-2', 'Network To Refresh')
        storeSpys.addContract('contract-3', 'Network To Refresh')
        //Get the key size of the network key before refresh
        let keySizeBefore = Object.keys(get(CacheStore)['contracts']['Network To Refresh']).length
        cy.expect(keySizeBefore).to.be.greaterThan(0)
        //Refresh Network key
        storeSpys.refreshNetwork('Network To Refresh')
        //Should be nothing under the key
        let keySizeAfter = Object.keys(get(CacheStore)['contracts']['Network To Refresh']).length
        cy.expect(keySizeAfter).to.eq(0)
    })

    //Test if the store will refresh the cache of a network
    it('refreshNetwork: Rejects bad arguments and does not error', () => {
        //Try a bunch of bad values
        try {
            storeSpys.refreshNetwork(undefined)
            storeSpys.refreshNetwork(null)
            storeSpys.refreshNetwork('')
            storeSpys.refreshNetwork([])
            storeSpys.refreshNetwork({})
            storeSpys.refreshNetwork(true)
            storeSpys.refreshNetwork(5)
        } catch (e) {}
        //Makes sure the bad values didn't cause an error
        cy.expect(storeSpys.refreshNetwork).to.not.have.thrown(Error)
    })

    //Test Store Corruptability
    it('set: Cannot set a non Object Value', () => {
        storeSpys.addContract('contract-5', 'Set Testing')
        storeSpys.addContract('contract-6', 'Set Testing')
        storeSpys.addContract('contract-7', 'Set Testing')
        //Get the current value of the localstorage
        let beforeLs = window.localStorage.getItem("cache");

        //Attempt to set the Store Value to corrupt values
        CacheStore.set(undefined)
        CacheStore.set(null)
        CacheStore.set([])
        CacheStore.set('')
        CacheStore.set(true)
        CacheStore.set(5)

        //Get the new value of the localstorage
        let afterLs = window.localStorage.getItem("cache");
        //Expect the local storage to not have been overwritten and still contain the file
        cy.expect(beforeLs).to.eq(afterLs)
    })
})