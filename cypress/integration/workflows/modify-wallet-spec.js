import App from '../../../src/svelte/App.svelte';
import mount from 'cypress-svelte-unit-test';
import "cypress-localstorage-commands";
import { writable } from 'svelte/store';

const loaded = writable(true);


describe('Test that all Modify Wallet Options and screens', () => {
    before(function (){
        cy.viewport(1920, 1080)
        mount(App, {props: {loaded}})
        cy.get('#create-wallet').focus().should('exist').click();

        cy.get('.firstrun-create-pwd').should('exist')
        cy.get('input#pwd1').focus().invoke('attr', 'value', 'Testing0!0101')
        cy.get('input#pwd2').focus().invoke('attr', 'value', 'Testing0!0101')
        cy.get('[type="submit"]').focus().click()
    
        cy.get('.firstrun-tos').should('exist')
        cy.get('#i-understand').focus().click()

        cy.wait(5000)
        cy.get('.coinsmain').should('exist')
        cy.get('#coin-row-0').should('exist').click()
        cy.get('.coin-details').should('exist')
        cy.get('#modify-coin-btn').should('exist').click()
        cy.get('#coin-options').should('exist')
    })

    it('Can Edit a Nickname', function () {
        cy.get('#modify-edit-btn').should('exist').click()
        cy.get('#modify-edit-nickname').should('exist').then(($input) => {
            expect($input[0].value).to.eq("My TAU Address")
            $input[0].value = "Testing Nickname"
        })   
        cy.get('#modify-edit-info').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq("Lamden TAU - 0 TAU")
        })
        cy.get('#save-btn').should('exist').focus().click()

        //
        cy.log('Shows Successful Message Box')
        cy.get('.message-box').should('exist')
        cy.get('#message-text').should('exist').then(($text) => {
            expect($text[0].textContent).to.eq("Wallet Nickname changed!")
        })
        cy.get('#success').should('exist')
        cy.log('Message Box buttons render')
        cy.get('#home-btn').should('exist')
        cy.get('#back-btn').should('exist').focus().click()

        //
        cy.log('DropDown Box shows new nickname')
        cy.get('#coin-0').should('exist').then(($option) => {
            expect($option[0].textContent).to.contain("Testing Nickname")
        })
        cy.saveLocalStorage();
    })

    it('Throws Incorrect Password Validation message when trying to Delete a Coin', function() {
        cy.restoreLocalStorage();
        cy.viewport(1920, 1080)
        cy.get('#modify-delete-btn').should('exist').click()
        cy.get('[type="submit"]').should('exist').then(($submit) => {
            expect($submit[0].value).to.eq("Validate Wallet Password")
        })
        //
        cy.log('Throws Validation on Incorrect Password')
        cy.get('#pwd-input').focus().invoke('attr', 'value', 'testing0!0101')
        cy.get('[type="submit"]').focus().click()
        cy.get('#pwd-input').then(($input) => {
            expect($input[0].validationMessage).to.eq("Incorrect Wallet Password")
        })
        //
        cy.log('Renders CoinOptions when back button clicked')
        cy.get('#back-btn').focus().click()
        cy.get('#coin-options').should('exist')

    })

    it('Can Delete A Coin', function () {
        cy.restoreLocalStorage();
        cy.viewport(1920, 1080)
        cy.get('#modify-delete-btn').should('exist').click()
        cy.get('[type="submit"]').should('exist').then(($submit) => {
            expect($submit[0].value).to.eq("Validate Wallet Password")
        })

        //
        cy.log('Throws Validation on Empty Password Box')
        cy.get('[type="submit"]').focus().click()
        cy.get('#pwd-input').then(($input) => {
            expect($input[0].validationMessage).to.eq("Please fill in this field.")
        })

        //
        cy.log('Accepts Correct Password')
        cy.get('#pwd-input').should('exist').focus().invoke('attr', 'value', 'Testing0!0101')
        cy.get('[type="submit"]').should('exist').focus().click()

        //
        cy.log('Form changes to Warning Mode')
        cy.get('#warning-msg').should('exist')
        cy.get('[type="submit"]').should('exist').then(($submit) => {
            expect($submit[0].value).to.eq("Confirm Wallet Deletion")
        })
        cy.get('[type="submit"]').focus().click()

        //
        cy.log('Shows Successful Message Box')
        cy.get('.results-box').should('exist')
        cy.get('#results-title').should('exist').then(($text) => {
            expect($text[0].textContent).to.eq("Wallet Deleted")
        })
        cy.get('#results-subtitle').should('exist').then(($text) => {
            expect($text[0].textContent).to.eq("Testing Nickname - Lamden TAU Wallet deleted successfully")
        })
        cy.get('#results-message').should('exist').then(($text) => {
            expect($text[0].textContent).to.eq("Successful Deletion")
        })
        cy.log('Message Box buttons render')
        cy.get('#home-btn').should('exist').focus().click()

        cy.get('.coinsmain').should('exist')      

        cy.saveLocalStorage();
    })

    it('Renders CoinEmpty when there are no coins in the wallet', function () {
        cy.restoreLocalStorage();
        cy.viewport(1920, 1080)
        cy.get('.coin-empty').should('exist')

        //
        cy.log('Create New Wallet button exists and load CoinAddDetail Modal')
        cy.get('#empty-add-btn').should('exist').focus().click()
        cy.get('.coin-add-details').should('exist')
        cy.get('#modal-cancel-btn').should('exist').focus().click()

        //
        cy.log('Restore Wallet button exists and load Restore Page')
        cy.get('#empty-restore-btn').should('exist').focus().click()
        cy.get('.restore').should('exist')    
    })
})