import { get } from 'svelte/store';
import * as Stores from '../../../src/js/stores/stores.js'
import "cypress-localstorage-commands";

const Spys = {
    'isObject': (value) => {return Stores.isObject(value)},
    'isString': (value) => {return Stores.isString(value)},
    'isBoolean': (value) => {return Stores.isBoolean(value)},
    'isArray': (value) => {return Stores.isArray(value)},
    'isNumber': (value) => {return Stores.isObject(value)},
    'isInteger': (value) => {return Stores.isInteger(value)},
    'isStringWithValue': (value) => {return Stores.isStringWithValue(value)},
    'isObjectWithKeys': (value) => {return Stores.isObjectWithKeys(value)},
    'isArrayWithValues': (value) => {return Stores.isArrayWithValues(value)}
}

const testValues = [
    undefined, null, 
    [], ['test'], 
    {}, {test:''}, 
    true, false,
    '', 'test', 
    0.01, 50 
]

function jsonStr(value){
    return JSON.stringify(value)
}

describe('Test Misc Stores', () => {
    it('CURRENT_KS_VERSION: test inital value', () => {
        let store = get(Stores.CURRENT_KS_VERSION)
        cy.expect(store).to.eq('1.0')
    })

    it('breadcrumbs: test inital value', () => {
        let store = get(Stores.breadcrumbs)
        cy.expect(jsonStr(store)).to.eq('[]')
    })

    it('steps: test inital value', () => {
        let store = get(Stores.steps)
        let initalValue = jsonStr({current:0, stepList:[]})
        cy.expect(jsonStr(store)).to.eq(initalValue)
    })
})

describe('Test Store Utility Functions', () => {
    it('networkKey: can create a network key from a network object', () => {
        let newNetwork = {
            name: 'New Testing Network', 
            ip: '1.1.1.1', 
            port: '5555'
        }
        let netKey = Stores.networkKey(newNetwork)
        cy.expect(netKey).to.eq('1.1.1.1:5555')
    })

    it('copyItem: Can copy an object by value not ref', () => {
        let test1 = {value: 'Testing'}
        let refOjb = test1;
        refOjb.value = 'changed'
        cy.expect(refOjb.value).to.eq('changed')
        cy.expect(test1.value).to.eq('changed')

        let test2 = {value: 'Testing'}
        let valOjb = Stores.copyItem(test2);
        valOjb.value = 'changed'
        cy.expect(valOjb.value).to.eq('changed')
        cy.expect(test2.value).to.eq('Testing')
    })
})

describe('Test Type and Object Validation Helpers', () => {
    beforeEach(function() {
        Object.keys(Spys).map(func => {
            cy.spy(Spys, func)
        })
    })

    it('hasKeys: can validate a list of keys exist in an object', () => {
        let test1 = {foo:'', bar:'', stu:''}
        cy.expect(Stores.hasKeys(test1, ['foo', 'bar', 'stu'])).to.eq(true)
        cy.expect(Stores.hasKeys(test1, ['foo', 'bar', 'stu', 'lamden'])).to.eq(false)
    })

    it('isObject: can determine an Object is an Object', () => {
        testValues.map(value => { 
            Spys.isObject(value)
            if ([jsonStr({}), jsonStr({test:''})].includes(jsonStr(value))) {
                cy.expect(Spys.isObject).to.have.returned(true)
            }
            else cy.expect(Spys.isObject).to.have.returned(false)
        })
    })
 
    it('isString: can determine a String is a String', () => {
        testValues.map(value => { 
            Spys.isString(value)
            if (['', 'test'].includes(value)) cy.expect(Spys.isString).to.have.returned(true)
            else cy.expect(Spys.isString).to.have.returned(false)
        })
    })

    it('isBoolean: can determine a Boolean is a Boolean', () => {
        testValues.map(value => { 
            Spys.isBoolean(value)
            if ([true, false].includes(value)) cy.expect(Spys.isBoolean).to.have.returned(true)
            else cy.expect(Spys.isBoolean).to.have.returned(false)
        })
    })

    it('isArray: can determine a Array is a Array', () => {
        testValues.map(value => { 
            Spys.isArray(value)
            if (['[]', jsonStr(['test'])].includes(jsonStr(value))) {
                cy.expect(Spys.isArray).to.have.returned(true)
            }
            else cy.expect(Spys.isArray).to.have.returned(false)
        })
    })

    it('isNumber: can determine a Number is a Number', () => {
        testValues.map(value => { 
            Spys.isObject(value)
            if ([50, 0.01].includes(value)) cy.expect(Spys.isObject).to.have.returned(true)
            else cy.expect(Spys.isObject).to.have.returned(false)
        })
    })

    it('isInteger: can determine a Number is an Integer', () => {
        testValues.map(value => { 
            Spys.isObject(value)
            if ([50].includes(value)) cy.expect(Spys.isObject).to.have.returned(true)
            else cy.expect(Spys.isObject).to.have.returned(false)
        })
    })

    it('isStringWithValue: can determine a String is not empty', () => {
        testValues.map(value => { 
            Spys.isStringWithValue(value)
            if (value === 'test') cy.expect(Spys.isStringWithValue).to.have.returned(true)
            else cy.expect(Spys.isStringWithValue).to.have.returned(false)
        })
    })

    it('isObjectWithKeys: can determine an Object is not empty', () => {
        testValues.map(value => { 
            Spys.isObjectWithKeys(value)
            if (jsonStr(value) === jsonStr({test:''})) {
                cy.expect(Spys.isObjectWithKeys).to.have.returned(true)
            }
            else cy.expect(Spys.isObjectWithKeys).to.have.returned(false)
        })
    })

    it('isArrayWithValues: can determine an Array is not empty', () => {
        testValues.map(value => { 
            Spys.isArrayWithValues(value)
            if (jsonStr(value) === jsonStr(['test'])) {
                cy.expect(Spys.isArrayWithValues).to.have.returned(true)
            }
            else cy.expect(Spys.isArrayWithValues).to.have.returned(false)
        })
    })
})