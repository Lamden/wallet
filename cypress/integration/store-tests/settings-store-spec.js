import { get } from 'svelte/store';
import { SettingsStore, firstRun, themeStyle, currentPage, storageInfo } from '../../../src/js/stores/settingsStore.js';
import "cypress-localstorage-commands";

function isBoolean(value){
    if(Object.prototype.toString.call(value) === "[object Boolean]") return true;
    return false;
}

const storeSpys = {
    'firstRunComplete': () => {
        return SettingsStore.firstRunComplete();
    },
    'changePage': (pageInfo) => {
        return SettingsStore.changePage(pageInfo);
    },
    'changeTheme': (theme) => {
        return SettingsStore.changeTheme(theme);
    },
    'calcStorage': () => {
        return SettingsStore.calcStorage();
    },
    'set': (value) => {
        return SettingsStore.set(value);
    }
}
const badValues = [undefined, null, [], {}, true, '', 0.01]

const defualtStore = {
    'currentPage' : {'name': 'FirstRunMain', 'data' : {}},
    'firstRun': true,
    'themeStyle':'dark',
    'version':'v0_9_8',
    'storage' : {'used': 0, 'remaining': 5000000, 'max': 5000000}
}

describe('Test the Settings Store', () => {
    before(function() {
        window.localStorage.setItem("settings", JSON.stringify(get(SettingsStore)))
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
        let store = get(SettingsStore)
        let storeJSON = JSON.stringify(store)
        let defaultsJSON = JSON.stringify(defualtStore)
        cy.expect(storeJSON).to.eq(defaultsJSON)
        cy.log(storeJSON)
    })

    it('Store: Saves updates to local storage', () => {
        //Store values should match
        let ls = window.localStorage.getItem("settings") 
        let storeString = JSON.stringify(get(SettingsStore))
        cy.expect(ls).to.eq(storeString)
        cy.log(ls)
        cy.log(storeString)
    })

    //Testing Default Derived Stores
    it('Derived Stores: Default Derived Store Values are correct', () => {
        cy.expect(get(currentPage).name).to.eq('FirstRunMain')
        cy.expect(get(firstRun)).to.eq(true)
        cy.expect(get(themeStyle)).to.eq('dark')
        cy.expect(JSON.stringify(get(storageInfo))).to.eq(JSON.stringify(defualtStore.storage))

    })

    //Testing Completing First Run
    it('firstRunComplete: Can set first run complete', () => {
        let store = get(SettingsStore);
        storeSpys.firstRunComplete();
        cy.expect(store.firstRun).to.eq(false);
        cy.expect(store.currentPage.name).to.eq('CoinsMain');
        
    })

    it('firstRunComplete: Derived firstRun store updated', () => {
        cy.expect(get(firstRun)).to.eq(false)
    })

    it('firstRunComplete: Derived currentPage store updated', () => {
        cy.expect(get(currentPage).name).to.eq('CoinsMain')
    })


    //Testing Change Page
    it('changePage: Can store new page value', () => {
        //Change Page
        storeSpys.changePage({name: 'BackupMain'});
        //Check Store Value
        cy.expect(get(SettingsStore).currentPage.name).to.eq('BackupMain');
    })

    it('changePage: Derived currentPage store updated', () => {
        cy.expect(get(currentPage).name).to.eq('BackupMain')
    })

    it('changePage: Rejects bad and undefined values and doesn\'t error', () => {
        let beforeValue = JSON.stringify(get(SettingsStore).currentPage);

        //Try a bunch of bad values
        try{
            badValues.map(value => storeSpys.changePage(value))
            badValues.map(value => storeSpys.changePage({name: value}))
        } catch (e){}
        //Makes sure the bad values didn't cause an error
        cy.expect(storeSpys.changePage).to.not.have.thrown(Error)

        //The values of the current page should not have changed
        let afterValue = JSON.stringify(get(SettingsStore).currentPage);
        cy.expect(afterValue).to.eq(beforeValue)
    })


    //Testing Change Theme
    it('changeTheme: Can change Theme', () => {
        //Change Theme
        storeSpys.changeTheme('light');
        //Check store value
        cy.expect(get(SettingsStore).themeStyle).to.eq('light');
    })

    it('changeTheme: Derived themeStyle store updated', () => {
        cy.expect(get(themeStyle)).to.eq('light')
    })

    it('changeTheme: Rejects bad and undefined values and doesn\'t error', () => {
        let beforeValue = get(SettingsStore).themeStyle;

        //Try a bunch of bad values
        try{
            badValues.map(value => storeSpys.changeTheme(value))
        } catch (e){}
        //Makes sure the bad values didn't cause an error
        cy.expect(storeSpys.changeTheme).to.not.have.thrown(Error)

        //The values of the current page should not have changed
        let afterValue = get(SettingsStore).themeStyle;
        cy.expect(afterValue).to.eq(beforeValue)
    })

    //Test Store Corruptability
    it('set: Cannot set a non SettingsStore Object Value into Local Storage', () => {
        //Get the current value of the localstorage
        let beforeLs = window.localStorage.getItem("settings");
        //Attempt to set the Store Value to corrupt values
        let firstRun = true
        let version = 'v1'
        let themeStyle = 'dark'
        let currentPage = {name: 'TestPage'}
        let storage = {used:0, remaining:0,max:0}
        try {
            badValues.map(value => storeSpys.set(value))
            badValues.map(value => storeSpys.set({'currentPage': value, firstRun, themeStyle, version, storage}))
            badValues.map(value => {
                //firstRun can be boolean
                if (!isBoolean(value)){
                    storeSpys.set({currentPage, 'firstRun': value, themeStyle, version, storage})
                }
            })
            badValues.map(value => storeSpys.set({currentPage, firstRun, 'themeStyle': value, version, storage}))
            badValues.map(value => storeSpys.set({currentPage, firstRun, themeStyle, 'version': value, storage}))
            badValues.map(value => storeSpys.set({currentPage, firstRun, themeStyle, version, 'storage': value}))
            
        } catch (e) {}

        //Makes sure the bad values didn't cause an error
        cy.expect(storeSpys.set).to.not.have.thrown(Error)

        //Get the new value of the localstorage
        let afterLs = window.localStorage.getItem("settings");

        //Expect the local storage to not have been overwritten and still contain the file
        cy.expect(beforeLs).to.eq(afterLs)
        cy.expect(afterLs).to.eq(JSON.stringify(get(SettingsStore)))
    })

    it('set: Can set a proper Value', () => {
        //Get the current value of the localstorage
        let beforeLs = window.localStorage.getItem("settings");
        //Attempt to set the Store Value to corrupt values
        try {
            storeSpys.set(defualtStore)
        } catch (e) {}

        //Makes sure the bad values didn't cause an error
        cy.expect(storeSpys.set).to.not.have.thrown(Error)

        //Get the new value of the localstorage
        let afterLs = window.localStorage.getItem("settings");

        //Expect the local storage to not have been overwritten and still contain the file
        cy.expect(beforeLs).to.not.eq(afterLs)
        cy.expect(afterLs).to.eq(JSON.stringify(get(SettingsStore)))
    })
})