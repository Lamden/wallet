import App from '../../../src/svelte/App.svelte'
import mount from 'cypress-svelte-unit-test'
import { writable } from 'svelte/store';

const loaded = writable(true);

describe('Test that the Lockscreen Loads and has functionality', () => {
    before(function (){
        cy.viewport(1920, 1080)
        mount(App, {props: {loaded}})
        cy.get('#create-wallet').focus().should('exist').click();
        cy.get('input#pwd1').focus().invoke('attr', 'value', 'Testing0!0101')
        cy.get('input#pwd2').focus().invoke('attr', 'value', 'Testing0!0101')
        cy.get('[type="submit"]').focus().click()
        cy.get('#i-understand').focus().click()
        cy.wait(5500)    
    })

    it('All Lockscreen Functionallity works', function () {
        //---
        cy.log('Screen locks on menu click')
        cy.get('#lock').click()
        cy.get('.lockscreen').should('exist')

        //---
        cy.log('Screen unlocks on correct password')
        cy.wait(5000) 
        cy.get('#pwd-input').focus().invoke('attr', 'value', 'Testing0!0101')
        cy.get('[type="submit"]').focus().click()
        cy.get('.coinsmain').should('exist')

        //---
        cy.log('Incorrect Password Displays Validation Message')
        cy.wait(1000)
        cy.get('#lock').click()
        cy.get('#pwd-input').focus().invoke('attr', 'value', 'testing0!0101')
        cy.get('[type="submit"]').focus().click()
        cy.get('#pwd-input').then(($input) => {
            expect($input[0].validationMessage).to.eq("Incorrect Password")
        })
        cy.get('.lockscreen').should('exist')
    })
})