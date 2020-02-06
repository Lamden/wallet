import { get } from 'svelte/store';
import { TxStore } from '../../../src/js/stores/txStore.js';
import "cypress-localstorage-commands";

export function networkKey(networkObj){
    return `${networkObj.ip}:${networkObj.port}`
}

function getCopy(item){
    return JSON.parse(JSON.stringify(item))
}

const storeSpys = {
    'addTx': (txInfo) => {
        return TxStore.addTx(txInfo);
    },
    'getTxList': (network, vk) => {
        return TxStore.getTxList(network, vk);
    },
    'clearTx': (network, vk) => {
        return TxStore.clearTx(network, vk);
    },
    'set': (value) => {
        return TxStore.set(value);
    }
}

let newNetwork = {
    name: 'New Testing Network', 
    ip: '1.1.1.1', 
    port: '5555'
}

const mockStore = {
    sender: {vk: 'test-public-key'},
    result: {},
    txInfo: {},
    network: JSON.parse(JSON.stringify(newNetwork)),
    resultInfo: {}
}

const badTxDataValues = [
    undefined, null, [], true, 10, '', 
    {network: {ip: '1.1.1.1'}},
    {network: {port: '5555'}}
]
const badNetworkValues = [
    undefined, null, [], {}, 
    {ip: '1.1.1.1'}, {port:'5555'}, 
    true, 10, ''
]
const badVkValues = [undefined, null, [], {}, true, '']
const badSetValues = [undefined, null, [], true, '', 0.01]

describe('Test the Transaction Store', () => {
    before(function() {
        window.localStorage.setItem("txs", JSON.stringify(get(TxStore)))
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
        cy.expect(Object.keys(get(TxStore)).length).to.eq(0)
    })

    it('Store: Saves updates to local storage', () => {
        //Add a contract to the Store
        storeSpys.addTx(getCopy(mockStore))
        //Store values should match
        let ls = window.localStorage.getItem("txs") 
        let storeString = JSON.stringify(get(TxStore))
        cy.expect(ls).to.eq(storeString)
    })

    it('addTx: Can add a txData object to the store', () => {
        //Create a transacation object
        let txData = getCopy(mockStore)

        //Get the current value of the localstorage
        let beforeLs = window.localStorage.getItem("txs");
        
        //Add a contract to the Store
        storeSpys.addTx(txData)

        //Get the new value of the localstorage
        let afterLs = window.localStorage.getItem("txs");
        
        //Expect the local storage to not have been overwritten and still contain the file
        cy.expect(beforeLs).to.not.eq(afterLs)

        //Check the transaction was stored in the correct key
        let store = get(TxStore)
        let netKey = networkKey(txData.network)
        cy.expect(store[netKey][txData.sender.vk].length).to.be.greaterThan(0)
    })

    it('addTx: Rejects bad or undefined arguments and does not error', () => {
        //Get the JSON value of the store so we can compare it later
        let storeStringBefore = JSON.stringify(get(TxStore))

        //Try a bunch of bad values
        try {
            badTxDataValues.map(value => storeSpys.addTx(value))
        } catch (e) {}
        //Makes sure the bad values didn't cause an error
        cy.expect(storeSpys.addTx).to.not.have.thrown(Error)

        let storeStringAfter = JSON.stringify(get(TxStore))
        //No new objects should have been added
        cy.expect(storeStringBefore).to.eq(storeStringAfter)
    })

    it('getTxList: Can get all transactions assoicated with a network and vk', () => {
        //Add an object to the store witch we will attempt to retrieve
        let txData = getCopy(mockStore)
        txData.testing = true
        txData.sender.vk = 'return-this'
        storeSpys.addTx(txData)

        let transactions = storeSpys.getTxList(txData.network, txData.sender.vk)

        transactions.map(tx => {
            if (tx.testing) cy.expect(tx.sender.vk).to.eq('return-this')
        })
    })

    it('getTxList: Reject bad or undefined arguments and don\'t error ', () => {
        function testGetTx(networkObj, vk){
            //Try a bunch of bad values
            try {
                storeSpys.getTxList(networkObj, vk)

            } catch (e) {}
            //Makes sure the bad values didn't cause an error
            cy.expect(storeSpys.getTxList).to.have.returned(undefined)
            cy.expect(storeSpys.getTxList).to.not.have.thrown(Error)
        }

        //Add some objects to the store that we hopefully don't retrieve
        let txData = getCopy(mockStore)
        txData.sender.vk = 'getTxList-test'
        storeSpys.addTx(txData)
        storeSpys.addTx(txData)
        storeSpys.addTx(txData)

        //Get a JSON copy of the store so we can compare later 
        let storeStringBefore = JSON.stringify(get(TxStore))
        
        //Try bad values 
        badNetworkValues.map(value => testGetTx(value, 'getTxList-test'))
        badVkValues.map(value => testGetTx(txData.network, value))

        let storeStringAfter = JSON.stringify(get(TxStore))
        //No new objects should have been added
        cy.expect(storeStringBefore).to.eq(storeStringAfter)
    })

    it('clearTx: Can delete all transactions assoicated with a network and vk', () => {
        //Add some objects to the store that we hopefully don't retrieve
        let txData = getCopy(mockStore)
        txData.network.ip = '2.2.2.2'
        txData.sender.vk = 'clearTx-test'
        storeSpys.addTx(txData)
        storeSpys.addTx(txData)
        storeSpys.addTx(txData)

        //Retrieve transactions Array from the store to validate they are there
        let txListBefore = storeSpys.getTxList(txData.network, txData.sender.vk)
        cy.expect(txListBefore.length).to.eq(3)

        //Clear [networkKey][vk] key
        storeSpys.clearTx(txData.network, txData.sender.vk)

        //Attempt to retrieve the transcation Array again, should be empty
        let txListAfter = storeSpys.getTxList(txData.network, txData.sender.vk)
        cy.expect(txListAfter.length).to.eq(0)
    })

    it('clearTx: Reject bad or undefined arguments and don\'t error ', () => {
        function testClearTx(networkObj, vk){
            try {
                storeSpys.clearTx(networkObj, vk)
            } catch (e) {}
            //Makes sure the bad values didn't cause an error
            cy.expect(storeSpys.clearTx).to.have.returned(undefined)
            cy.expect(storeSpys.clearTx).to.not.have.thrown(Error)
        }

        //Add some objects to the store
        let txData = getCopy(mockStore)
        txData.sender.vk = 'clearTx-test2'
        storeSpys.addTx(txData)
        storeSpys.addTx(txData)
        storeSpys.addTx(txData)

        //Get a JSON copy of the store so we can compare later 
        let storeStringBefore = JSON.stringify(get(TxStore))

        //Try a bunch of bad values for clearTx
        badNetworkValues.map(value => testClearTx(value, 'clearTx-test2'))
        badVkValues.map(value => testClearTx(txData.network, value))

        let storeStringAfter = JSON.stringify(get(TxStore))
        //Nothing should have been cleared or altered from the store
        cy.expect(storeStringBefore).to.eq(storeStringAfter)
    })

    //Test Store Corruptability
    it('set: Cannot set a non Object Value', () => {
        //Get the current value of the localstorage
        let beforeLs = window.localStorage.getItem("txs");

        //Attempt to set the Store Value to corrupt values
        try {
            badSetValues.map(value => storeSpys.set(value))
        } catch (e) {}

        //Makes sure the bad values didn't cause an error
        cy.expect(storeSpys.set).to.not.have.thrown(Error)
        
        //Get the new value of the localstorage
        let afterLs = window.localStorage.getItem("txs");
        
        //Expect the local storage to not have been overwritten and still contain the file
        cy.expect(beforeLs).to.eq(afterLs)
        cy.expect(afterLs).to.eq(JSON.stringify(get(TxStore)))
    })

    //Test Store Corruptability
    it('set: Can set an Object Value', () => {
        //Add some objects to the store that we hopefully don't retrieve
        let txData = getCopy(mockStore)
        txData.network.ip = '6.6.6.6'
        txData.sender.vk = 'clearTx-test'
        storeSpys.addTx(txData)

        //Attempt to set the Store Value to corrupt values
        try {
            storeSpys.set({})
        } catch (e) {}

        //Makes sure the bad values didn't cause an error
        cy.expect(storeSpys.set).to.not.have.thrown(Error)
        
        //Get the new value of the localstorage
        let afterLs = window.localStorage.getItem("txs");
        
        //Expect the local storage to not have been overwritten and still contain the file
        cy.expect(afterLs).to.eq('{}')
        cy.log(JSON.stringify(get(TxStore)))
        //cy.expect(afterLs).to.eq(JSON.stringify(get(TxStore)))
    })
})