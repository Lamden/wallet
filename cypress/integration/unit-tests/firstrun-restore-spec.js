import App from '../../../src/svelte/App.svelte'
import mount from 'cypress-svelte-unit-test'
import 'cypress-file-upload';

const fileName = 'files/Testing.keystore'

describe('First Run Restore Wallet Process', () => {
    it('Loads FirstRunInto to start', () => {
        cy.fixture(fileName, 'utf-8').then(fileContent => {

            //
            cy.log('Renders FirstRunIntro.svelte and two buttons')
            cy.viewport(1920, 1080)
            mount(App)

            cy.get('#create-wallet').should('exist')      
            cy.get('#restore-wallet').should('exist')

            //
            cy.log('Renders FirstTimeCreatePW when Restore Wallets button is selected')
            cy.get('#restore-wallet').focus().click();
            cy.get('.firstrun-create-pwd').should('exist')

            //
            cy.log('Renders RestoreUpload.svelte after strong passwords are entered and button clicked')
            cy.get('input#pwd1').focus().invoke('attr', 'value', 'Testing0!0101')
            cy.get('input#pwd2').focus().invoke('attr', 'value', 'Testing0!0101')
            cy.get('[type="submit"]').focus().click()
            cy.get('.restore-upload').should('exist')

            //
            cy.log('Button is enabled when file is uploaded to the picker')
            cy.get('#filePicker').should('exist').upload({ fileContent, fileName, mimeType: 'text/plain', encoding: 'utf-8' }, { subjectType: 'input', force: true });
            cy.get('#confirm-keystore-btn').should('exist').should('not.be.disabled').click();

            //
            cy.log('Renders RestorePassword when Password Hint is decoded and displayed')
            cy.get('.restore-password').should('exist')
            cy.get('#pwd-hint').then(($div) => {
                expect($div[0].textContent).to.eq("This is for testing")
            })

            //---
            cy.log('Renders RestoreAddWallets after successful password')
            cy.get('#pwd-input').focus().invoke('attr', 'value', 'Testing0!0101')
            cy.get('[type="submit"]').focus().click()
            cy.get('.restore-addwallets').should('exist')

            //---
            cy.log('All checkboxes are selected when all wallets is checked')
            cy.get('#chk-all').focus().check()
            cy.get('#chkbox-0').then(($chkbox) => {
                expect($chkbox[0].checked).to.be.true
            })

            //---
            cy.log('Wallet VK is displayed')
            cy.get('#div-address-0').then(($div) => {
                expect($div[0].textContent).to.eq("60d5ebffec35794e016643c31686d7354678a46493ab3432369fa820a8c36e49")
            })

            //
            cy.log('Renders RestoreSaveWallets.svelte to save wallets to localstorage after Restore button pressed')
            cy.get('#restore-btn').should('exist').focus().click()
            cy.get('.restore-savewallets').should('exist')

            //
            cy.log('Renders RestoreComplete.svelte show recovery status')
            cy.get('.restore-complete').should('exist')

            //
            cy.log('Renders FirstRunFinishing to do some final steps once Complete Restore button is clicked')
            cy.get('#home-btn').should('exist').focus().click()
            cy.get('.firstrun-finishing').should('exist')

            //
            cy.wait(5000)
            cy.get('.coinsmain').should('exist')

        })
    })
})