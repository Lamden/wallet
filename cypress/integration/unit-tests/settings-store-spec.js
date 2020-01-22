import App from '../../components/SettingsStore.svelte'
import { tick } from 'svelte';
import mount from 'cypress-svelte-unit-test'

describe('Test the Settings Store', () => {
    it('Loads default values', () => {
        cy.viewport(1920, 1080)
        mount(App)
        cy.get('#currentPage-name').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq("FirstRunMain")
        })
        cy.get('#firstRun').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq('true')
        })
        cy.get('#themeStyle').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq('dark')
        })
        cy.get('#version').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq('v0_9_8')
        })
        cy.get('#storage-used').should('exist').then(($div) => {
            let value = parseInt($div[0].textContent)
            expect(value).to.eq(0)
        })
        cy.get('#storage-remaining').should('exist').then(($div) => {
            let value = parseInt($div[0].textContent)
            expect(value).to.eq(5000000)
        })
        cy.get('#storage-max').should('exist').then(($div) => {
            let value = parseInt($div[0].textContent)
            expect(value).to.eq(5000000)
        })
        cy.get('#numOfNetworks').should('exist').then(($div) => {
            let value = parseInt($div[0].textContent)
            expect(value).to.eq(1)
        })
    })

    it('Can store New Page', () => {
        cy.get('#change-page').click()
        cy.get('#currentPage-name').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq("Testing")
        })
    })

    it('Can change Theme', () => {
        cy.get('#change-theme').click()
        cy.get('#themeStyle').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq("light")
        })
    })

    it('Can Add a network', () => {
        cy.get('#add-network').click()
        tick();
        cy.get('#1-network-name').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq("New Testing Network")
        })
        cy.get('#numOfNetworks').should('exist').then(($div) => {
            let value = parseInt($div[0].textContent)
            expect(value).to.eq(2)
        })
    })

    it('Rejects undefined network object', () => {
        cy.get('#add-undefined-network').click()
        tick();
        cy.get('#numOfNetworks').should('exist').then(($div) => {
            let value = parseInt($div[0].textContent)
            expect(value).to.eq(2)
        })
    })

    it('Rejects bad/missing network info', () => {
        cy.get('#add-bad-network').click()
        tick();
        cy.get('#numOfNetworks').should('exist').then(($div) => {
            let value = parseInt($div[0].textContent)
            expect(value).to.eq(2)
        })
    })

    it('Can Change network status', () => {
        cy.get('#change-network-status').click()
        tick();
        cy.get('#1-network-online').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq('true')
        })
    })

    it('Rejects non-boolen network status', () => {
        cy.get('#change-network-status-bad').click()
        tick();
        cy.get('#1-network-online').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq('true')
        })
    })
})