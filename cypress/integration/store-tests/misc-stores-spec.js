import { get } from 'svelte/store';
import * as Stores from '../../../src/js/stores/stores.js'
import "cypress-localstorage-commands";

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