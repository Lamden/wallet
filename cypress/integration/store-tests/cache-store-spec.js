import App from '../../components/CacheStore.svelte'
import mount from 'cypress-svelte-unit-test'

import "cypress-localstorage-commands"

describe('Test the Cache Store', () => {
    before(function() {
        mount(App)
        cy.viewport(1920, 1080);
    })

    it('Initializes empty store after app mount', () => {
        cy.get('#storeExists').should('exist').then(($div) => {
            //Store is intialized on app mount
            expect($div[0].textContent).to.eq("true")
        })
        cy.get('#storeEmpty').should('exist').then(($div) => {
            //Store is intialized on app mount
            expect(parseInt($div[0].textContent)).to.eq(0)
        })
    })

    //Testing Adding a contract to cache
    it('addContract: Can cache a contract on a network', () => {
        cy.get('#add-contract').click()
        cy.get('#contracts-testNetwork-testContract').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq('true')
        })
    })

    it('addContract: Rejects undefined Contract Name', () => {
        cy.get('#add-undefined-contractName').click()
        cy.get('#numOfTestNetworkKeys').should('exist').then(($div) => {
            expect(parseInt($div[0].textContent)).to.eq(1)
        })
    })

    it('addContract: Rejects undefined Network Name', () => {
        cy.get('#add-undefined-networkName').click()
        cy.get('#numOfTestNetworkKeys').should('exist').then(($div) => {
            expect(parseInt($div[0].textContent)).to.eq(1)
        })
    })

    //Testing checking if a contract exists in cache
    it('contractExists: Returns if a contract exists in cache', () => {
        cy.get('#check-value-exists').click()
        cy.get('#contract-exists').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq('true')
        })
    })

    it('contractExists: Rejects undefined Contract Name', () => {
        cy.get('#check-value-undefined-contractName').click()
        cy.get('#contract-exists').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq('false')
        })
    })

    it('contractExists: Rejects undefined Network Name', () => {
        cy.get('#check-value-undefined-networkName').click()
        cy.get('#contract-exists').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq('false')
        })
    })

    //Test if the store will refresh the cache of a network
    it('refreshNetwork: Rejects undefined Network Name', () => {
        cy.get('#refresh-cache-undefined-networkName').click()
        cy.get('#numOfTestNetworkKeys').should('exist').then(($div) => {
            expect(parseInt($div[0].textContent)).to.eq(1)
        })
    })

    //Test if the store will refresh the cache of a network
    it('refreshNetwork: Will remove all contracts from a network\'s cache', () => {
        cy.get('#refresh-cache').click()
        cy.get('#numOfTestNetworkKeys').should('exist').then(($div) => {
            expect(parseInt($div[0].textContent)).to.eq(0)
        })
    })

    //Cannot commit non-object value to localStorage
    it('Will throw an error instead of commiting bad store value', () => {
        cy.get('#kill-cache-store').click()
        cy.get('#storeExists').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq("true")
        })
    })
})