import App from '../../../src/svelte/App.svelte'
import mount from 'cypress-svelte-unit-test'

describe('Test that the Lockscreen Loads and has functionality', () => {
    before(function (){
        cy.viewport(1920, 1080)
        mount(App)
        const defualtSettingsStore = {
            'currentPage' : {'name': 'FirstRunMain', 'data' : {}},
            'firstRun': true,
            'themeStyle':'dark',
            'version':'v0_0_2',
            'storage' : {'used': 0, 'remaining': 5000000, 'max': 5000000},
        }
        
        cy.get('.firstrun-intro').should('exist').then(() => {
            //Sets up inital localstorage
            expect(localStorage.getItem('settings')).to.eq(JSON.stringify(defualtSettingsStore))
        })
        cy.get('#create-wallet').focus().should('exist').click();

        cy.get('.firstrun-create-pwd').should('exist')
        cy.get('input#pwd1').focus().invoke('attr', 'value', 'Testing0!0101')
        cy.get('input#pwd2').focus().invoke('attr', 'value', 'Testing0!0101')
        cy.get('[type="submit"]').focus().click()
    
        cy.get('.firstrun-tos').should('exist')
        cy.get('#i-understand').focus().click()

        cy.wait(5500)
        cy.get('.coinsmain').should('exist')
        cy.get('#coin-row-0').should('exist').click()
        cy.get('.coin-details').should('exist')
        cy.get('#modify-coin-btn').should('exist').click()
    })

    it('Can Edit a Nickname', function () {
        cy.get('#modify-edit-btn').should('exist').click()
        cy.get('#modify-edit-nickname').should('exist').then(($input) => {
            expect($input[0].value).to.eq("My TAU Address")
            $input[0].value = "Testing Nickname"
        }) 
        cy.wait(2000)    
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
        cy.wait(2000) 
        cy.get('#coin-0').should('exist').then(($option) => {
            expect($option[0].textContent).to.contain("Testing Nickname")
        })
    })


})