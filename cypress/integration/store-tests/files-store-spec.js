import { get } from 'svelte/store';
import { FilesStore, activeTab } from '../../../src/js/stores/filesStore.js';
import "cypress-localstorage-commands";

const storeSpys = {
    'addDefaultFile': () => {
        return FilesStore.addDefaultFile();
    },
    'addFile': (name, code, methods, networkObj) => {
        return FilesStore.addFile(name, code, methods, networkObj);
    },
    'activeTab': (index) => {
        return FilesStore.activeTab(index);
    },
    'changeName': (newName, index) => {
        return FilesStore.changeName(newName, index);
    },
    'updateCode': (code, index) => {
        return FilesStore.updateCode(code, index);
    },
    'deleteTab': (index) => {
        return FilesStore.deleteTab(index);
    },
    'set': (value) => {
        return FilesStore.set(value);
    }
}

const badValues = [undefined, null, [], {}, true, '', 0.01]

const badNameValues = [undefined, null, [], {}, true, 10, '']
const badCodeValues = [undefined, null, [], {}, true, 10]
const badIndexValues = [undefined, null, [], {}, true, '', 0.01]
const badSetValues = [undefined, null, {}, true, '', 0.01]

let newNetwork = {
    name: 'Public Test Network', 
    ip: '1.1.1.1', 
    port: '5555'
}

const setThisFile = {
    name: 'Should Set this file',
    code: '',
    type: 'good stuff',
    selected: false
}

describe('Test the Files Store', () => {
    before(function() {
        window.localStorage.setItem("files", JSON.stringify(get(FilesStore)))
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

    //Test adding new default files to the store
    it('addDefaultFile: Store can add new default file', () => {
        let currentStoreLength = get(FilesStore).length
        storeSpys.addDefaultFile()
        cy.expect(get(FilesStore).length).to.eq(currentStoreLength + 1)
    })

    it('addDefaultFile: Saves new file to local storeage', () => {
        let ls = JSON.parse(window.localStorage.getItem("files"));
        cy.expect(ls.length).to.eq(2)
    })

    it('addFile: Can Store a file with provided details', () => {
        let currentStoreLength = get(FilesStore).length
        let name = 'New Test Contract'
        let code = 'Testing Code'
        let methods = ['testing-1', 'testing-2']
        let network = newNetwork
        storeSpys.addFile(name, code, methods, network)
        let newFile = get(FilesStore)[currentStoreLength]
        cy.expect(get(FilesStore).length).to.eq(3)
        cy.expect(newFile.name).to.eq('New Test Contract')
        cy.expect(newFile.code).to.eq('Testing Code')
        cy.expect(newFile.methods[0]).to.eq('testing-1')
        cy.expect(newFile.methods[1]).to.eq('testing-2')
        cy.expect(newFile.network).to.eq("Public Test Network")
        
    })

    //Test adding new files to the store
    it('addFile: Rejects undefined/bad arguments and does not error', () => {
        //Get the current value of the localstorage
        let beforeLs = window.localStorage.getItem("files");

        //Good value placeholders
        let name = 'New Test Contract'
        let code = 'Testing Code'
        let methods = ['testing-1', 'testing-2']
        let network = newNetwork
        //Try bad values
        try {
            badValues.map(value => storeSpys.addFile(value, code, methods, network))
            badValues.map(value => {
                //Empty strings are okay for code
                if (value !== '') storeSpys.addFile(name, value, methods, network)
            })
            badValues.map(value => {
                //Empty arrays are okay for methods
                if (JOSN.stringify(value) !== '[]') storeSpys.addFile(name, code, value, network)
            })
            badValues.map(value => storeSpys.addFile(name, code, methods, value))
        } catch (e) {}

        //Makes sure the bad values didn't cause an error
        cy.expect(storeSpys.addFile).to.not.have.thrown(Error)

        //Get the new value of the localstorage
        let afterLs = window.localStorage.getItem("files");

        //Expect the local storage to not have been overwritten and still contain the file
        cy.expect(beforeLs).to.eq(afterLs)
    })

    //Test setting files as "active" for the IDE interface
    it('activeTab: Sets a file to "selected"', () => {
        let maxIndex = get(FilesStore).length - 1
        FilesStore.activeTab(maxIndex)
        let storeValue = get(FilesStore)[maxIndex]
        cy.expect(storeValue.selected).to.eq(true)
    })

    it('activeTab: Sets the rest of the files to unselected', () => {
        let maxIndex = get(FilesStore).length - 1
        get(FilesStore).map((file, index) => {
            if (index !== maxIndex) cy.expect(file.selected).to.eq(false)
        }) 
    })

    it('activeTab: Rejects bad arguements values and does not cause errors', () => {
        let maxIndex = get(FilesStore).length - 1
        FilesStore.activeTab(maxIndex)
        try {
            badIndexValues.map(value => storeSpys.activeTab(value))
        } catch (e) {}
        cy.expect(storeSpys.activeTab).to.not.have.thrown(Error)
        let storeValue = get(FilesStore)[maxIndex]
        cy.expect(storeValue.selected).to.eq(true)
    })

    it('activeTab-Derived Store: Has the value of the currently selected file', () => {
        //Change the name of the currently active tab so we can target it
        get(FilesStore).map((file, index) => {
            if (file.selected) {
                storeSpys.changeName('I am selected', index)
            }
        })
        //Validate that the active Tab value is now the same
        cy.expect(get(activeTab).name).to.eq('I am selected')
        cy.expect(get(activeTab).selected).to.eq(true)
    })

    //Test Changing the names of files
    it('changeName: Sets a new name for file', () => {
        let maxIndex = get(FilesStore).length - 1
        storeSpys.changeName('New Name', maxIndex)

        let storeValue = get(FilesStore)[maxIndex]
        cy.expect(storeValue.name).to.eq('New Name')
    })

    it('changeName: Rejects bad arguements values and does not cause errors', () => {
        let maxIndex = get(FilesStore).length - 1
        try {
            badNameValues.map(value => storeSpys.changeName(value, maxIndex))
            badIndexValues.map(value => storeSpys.changeName('Should not be this', value))
        } catch (e) {}
        //Makes sure the bad values didn't cause an error
        cy.expect(storeSpys.changeName).to.not.have.thrown(Error)
        //Make sure the names if the files weren't changed
        get(FilesStore).map(file => {
            cy.expect(file.name).to.not.eq(undefined)
            cy.expect(file.name).to.not.eq({})
            cy.expect(file.name).to.not.eq('Should not be this')
        })
    })

    //Test updaing code content of the file
    it('updateCode: Saves new code to a file', () => {
        let maxIndex = get(FilesStore).length - 1
        FilesStore.updateCode('Here is some new code', maxIndex)

        let storeValue = get(FilesStore)[maxIndex]
        cy.expect(storeValue.code).to.eq('Here is some new code')
    })

    it('updateCode: Rejects bad argument values and does not error', () => {
        let maxIndex = get(FilesStore).length - 1
        try {
            badCodeValues.map(value => storeSpys.updateCode(value, maxIndex))
            badIndexValues.map(value => storeSpys.updateCode('Should not be this', value))
        } catch (e) {}
        //Makes sure the bad values didn't cause an error
        cy.expect(storeSpys.updateCode).to.not.have.thrown(Error)
        //Make sure the names if the files weren't changed
        get(FilesStore).map(file => {
            cy.expect(file.code).to.not.eq(undefined)
            cy.expect(file.code).to.not.eq({})
            cy.expect(file.code).to.not.eq('Should not be this')
        })
    })

    //Test deleting files
    it('deleteTab: deletes a file from the file Store', () => {
        //Add an item that will be deleted
        FilesStore.addFile('Delete This', '', [], newNetwork)
        let storeValue = get(FilesStore)
        let maxIndex = get(FilesStore).length - 1
        //Validate the item exists
        cy.expect(storeValue[maxIndex].name).to.eq('Delete This')
        //Store the size of the store before we delete
        let beforeStoreSize = get(FilesStore).length
        //Delete the item we just added
        FilesStore.deleteTab(maxIndex)
        //Make sure files isn't in store anymore
        get(FilesStore).map(file => {
            cy.expect(file.name).to.not.eq('Delete This')
        })
        //Store size should be 1 less
        cy.expect(storeValue.length).to.eq(beforeStoreSize - 1)
    })

    it('deleteTab: Rejects bad argument values and does not error', () => {
        let beforeStoreSize = get(FilesStore).length
        //Try a bunch of bad values
        try {
            badIndexValues.map(value => storeSpys.deleteTab(value))
        } catch (e) {}
        //Makes sure the bad values didn't cause an error
        cy.expect(storeSpys.deleteTab).to.not.have.thrown(Error)
        //Make sure the size of the file store didn't change (nothing was deleted)
        cy.expect(get(FilesStore).length).to.eq(beforeStoreSize )
    })

    it('deleteTab: Creates a new default file when last file is deleted', () => {
        //Set store to just 1 file
        FilesStore.set([JSON.parse(JSON.stringify(FilesStore.defaultFile))])
        //Validate Store now has a size of 1
        cy.expect(get(FilesStore).length).to.eq(1)
        //Validate the only contract's name
        let maxIndex = get(FilesStore).length - 1
        cy.expect(get(FilesStore)[maxIndex].name).to.eq('New Contract')
        //rename the files so we can validate after that we deleted it
        storeSpys.changeName('Delete This', maxIndex)
        //Validate the files name was changed
        cy.expect(get(FilesStore)[maxIndex].name).to.eq('Delete This')
        //Delete File
        storeSpys.deleteTab(maxIndex)
        //Validate the store has a size of 1
        cy.expect(get(FilesStore).length).to.eq(1)
        //Validate the file was replaced with a new default file
        cy.expect(get(FilesStore)[maxIndex].name).to.eq('New Contract')
        //New file is selected
        cy.expect(get(FilesStore)[maxIndex].selected).to.eq(true)
    })

    //Test Store Corruptability
    it('set: Cannot set a non Array Value', () => {
        //Get the current value of the localstorage
        let beforeLs = window.localStorage.getItem("files");

        //Attempt to set the Store Value to corrupt values
        try {
            badSetValues.map(value => storeSpys.set(value))
        } catch (e) {}

        //Makes sure the bad values didn't cause an error
        cy.expect(storeSpys.set).to.not.have.thrown(Error)
        
        //Get the new value of the localstorage
        let afterLs = window.localStorage.getItem("files");
        
        //Expect the local storage to not have been overwritten and still contain the file
        cy.expect(beforeLs).to.eq(afterLs)
        cy.expect(afterLs).to.eq(JSON.stringify(get(FilesStore)))
    })

    it('set: Can set a proper Value', () => {
        //Get the current value of the localstorage
        let beforeLs = window.localStorage.getItem("files");
        //Attempt to set the Store Value to corrupt values
        try {
            FilesStore.set([setThisFile])
        } catch (e) {}

        //Makes sure the bad values didn't cause an error
        cy.expect(storeSpys.set).to.not.have.thrown(Error)

        //Get the new value of the localstorage
        let afterLs = window.localStorage.getItem("files");

        //Expect the local storage to not have been overwritten and still contain the file
        cy.expect(beforeLs).to.not.eq(afterLs)
        cy.expect(afterLs).to.eq(JSON.stringify(get(FilesStore)))
    })
})