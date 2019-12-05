import App from '../../../src/svelte/App.svelte'
import mount from 'cypress-svelte-unit-test'


describe('First Run Create Wallet Process', () => {
    it('Loads FirstRunInto to start', () => {
        const defualtSettingsStore = {
            'currentPage' : {'name': 'FirstRunMain', 'data' : {}},
            'firstRun': true,
            'themeStyle':'dark',
            'version':'v0_0_2',
            'storage' : {'used': 0, 'remaining': 5000000, 'max': 5000000},
        }
        
        cy.viewport(1920, 1080)
        mount(App)

        //Renders FirstRunIntro.svelte and two buttons
        cy.get('.firstrun-intro').should('exist').then(() => {
            //Sets up inital localstorage
            expect(localStorage.getItem('settings')).to.eq(JSON.stringify(defualtSettingsStore))
        })
        cy.get('#create-wallet').should('exist')      
        cy.get('#restore-wallet').should('exist')
    })

    it('Loads FirstRunCreatPW next', () => {
        //Renders FirstRunCreatePW.svelte after button clicked
        cy.get('#create-wallet').focus().should('exist').click();
        cy.get('.firstrun-create-pwd').should('exist')
    })


    it('Password1 validation - Password1 field empty', () => {
        //Should error because Password1 field is empty
        cy.get('[type="submit"]').click()
        cy.get('input#pwd1').then(($input) => {
            expect($input[0].validationMessage).to.eq("Please fill in this field.")
        })
    })

    it('Password1 validation - enforce strong password pattern', () => {
        //add a weak password into the first password box and click the submit button
        cy.get('input#pwd1').invoke('attr', 'value', 'weakpassword')
        cy.get('[type="submit"]').click()
        cy.get('input#pwd1:invalid').then(($input) => {
            expect($input[0].validationMessage).to.eq("Please match the format requested.")
        })
        cy.get('input#pwd1').invoke('attr', 'value', '')
    })

    it('Password2 validation - Password2 field empty', () => {
        //PWD1 strong PDW2 empty
        cy.get('input#pwd1').invoke('attr', 'value', 'Testing0!0101')
        cy.get('[type="submit"]').click()
        cy.get('input#pwd2').then(($input) => {
            expect($input[0].validationMessage).to.eq("Please fill in this field.")
        })
        cy.get('input#pwd1').invoke('attr', 'value', '')
    })
/*
    it('Password2 validation - Passwords do not match', () => {
        //PWD1 strong PDW2 different
        cy.get('input#pwd1').invoke('attr', 'value', 'Testing0!0101')
        cy.get('input#pwd2').invoke('attr', 'value', 'testing0!0101')
        cy.get('[type="submit"]').click()
        cy.get('input#pwd2').then(($input) => {
            cy.log($input)
            expect($input[0].validationMessage).to.eq("Passwords do not match")
        })
        cy.get('input#pwd1').invoke('attr', 'value', '')
        cy.get('input#pwd2').invoke('attr', 'value', '')
    })
*/
    it('Loads FirstRunTOS after accepting matching strong passwords', () => {
        //Renders FirstRunTOS.svelte after strong passwords are entered and button clicked
        cy.get('input#pwd1').focus().invoke('attr', 'value', 'Testing0!0101')
        cy.get('input#pwd2').focus().invoke('attr', 'value', 'Testing0!0101')
        cy.get('[type="submit"]').focus().click()
        cy.get('.firstrun-tos').should('exist')
    })

    it('Loads CoinsMain after generating an intial Lamden wallet', () => {
        //Renders FirstRunGenWallets.svelte and generates an intial Lamden wallet
        //Renders FisrtRunFinishing while it stores everything in local storage
        //Finally Renders CoinsMain 
        cy.get('#i-understand').focus().click()
        cy.wait(5500)
        cy.get('.coinsmain').should('exist')
    })
})