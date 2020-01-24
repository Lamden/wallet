import App from '../../components/SettingsStore.svelte'
import { tick } from 'svelte';
import mount from 'cypress-svelte-unit-test'
import "cypress-localstorage-commands"

describe('Test the Settings Store', () => {
    before(function() {
        mount(App)
        cy.viewport(1920, 1080);
    })
    it('Loads default values', () => {
        cy.get('#currentPage-name').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq("FirstRunMain")
        })
        cy.get('#currentPage-data').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq("[object Object]")
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
            expect(parseInt($div[0].textContent)).to.eq(0)
        })
        cy.get('#storage-remaining').should('exist').then(($div) => {
            expect(parseInt($div[0].textContent)).to.eq(5000000)
        })
        cy.get('#storage-max').should('exist').then(($div) => {
            expect(parseInt($div[0].textContent)).to.eq(5000000)
        })
        cy.get('#numOfNetworks').should('exist').then(($div) => {
            expect(parseInt($div[0].textContent)).to.eq(1)
        })       
    })

    //Testing Default Derived Stores
    it('Default Derived Store Values are correct', () => {
        cy.get('#derived-currentPage-name').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq("FirstRunMain")
        })
        cy.get('#derived-currentPage-data').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq("[object Object]")
        })
        cy.get('#derived-firstRun').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq("true")
        })
        cy.get('#numOfDerivedNetworks').should('exist').then(($div) => {
            expect(parseInt($div[0].textContent)).to.eq(1)
        })
        cy.get('#derived-currentNetwork-name').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq("Lamden Public Testnet")
        })
        cy.get('#derived-currentNetwork-ip').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq("https://testnet.lamden.io")
        })
        cy.get('#derived-currentNetwork-port').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq("443")
        })
        cy.get('#derived-currentNetwork-lamden').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq("true")
        })
        cy.get('#derived-currentNetwork-online').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq("false")
        })
        cy.get('#derived-currentNetwork-selected').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq("true")
        })
    })

    //Testing First Run
    it('Can set first run complete', () => {
        cy.get('#firstrun-complete').click()
        cy.get('#firstRun').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq("false")
        })
    })

    it('Derived firstRun store updated', () => {
        cy.get('#derived-firstRun').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq("false")
        })
    })


    //Testing Change Page
    it('Can store New Page', () => {
        cy.get('#change-page').click()
        cy.get('#currentPage-name').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq("Testing")
        })
        cy.get('#currentPage-data').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq("page data")
        })
    })

    it('Rejects blank page', () => {
        cy.get('#change-blank-page').click()
        cy.get('#currentPage-name').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq("Testing")
        })
    })

    it('Rejects undefined page', () => {
        cy.get('#change-undefined-page').click()
        cy.get('#currentPage-name').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq("Testing")
        })
    })

    it('Accepts undefined data', () => {
        cy.get('#change-undefined-data').click()
        cy.get('#currentPage-name').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq("New Page")
        })
        cy.get('#currentPage-data').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq("[object Object]")
        })
    })

    it('Derived store updated with currentPage Values', () => {
        cy.get('#derived-currentPage-name').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq("New Page")
        })
        cy.get('#derived-currentPage-data').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq("[object Object]")
        })
    })

    //Testing Change Theme
    it('Can change Theme', () => {
        cy.get('#change-theme').click()
        cy.get('#themeStyle').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq("light")
        })
    })

    it('Rejects undefined Theme', () => {
        cy.get('#change-theme-undefined').click()
        cy.get('#themeStyle').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq("light")
        })
    })

    //Testing Networks
    it('Can Add a network and sets proper defaults', () => {
        cy.get('#add-network').click()
        tick();
        cy.get('#1-network-name').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq("New Testing Network")
        })
        cy.get('#1-network-ip').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq("http://127.0.0.1")
        })
        cy.get('#1-network-port').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq("8080")
        })
        cy.get('#1-network-lamden').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq("false")
        })
        cy.get('#1-network-online').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq("false")
        })
        cy.get('#1-network-selected').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq("false")
        })
        cy.get('#numOfNetworks').should('exist').then(($div) => {
            expect(parseInt($div[0].textContent)).to.eq(2)
        })
    })

    it('Rejects undefined network object', () => {
        cy.get('#add-undefined-network').click()
        tick();
        cy.get('#numOfNetworks').should('exist').then(($div) => {
            expect(parseInt($div[0].textContent)).to.eq(2)
        })
    })

    it('Rejects bad/missing network info', () => {
        cy.get('#add-bad-network').click()
        tick();
        cy.get('#numOfNetworks').should('exist').then(($div) => {
            expect(parseInt($div[0].textContent)).to.eq(2)
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

    it('Can delete a network', () => {
        cy.get('#delete-network').click()
        tick();
        cy.get('#numOfNetworks').should('exist').then(($div) => {
            expect(parseInt($div[0].textContent)).to.eq(1)
        })
    })

    it('Rejects Deleteing undefined network', () => {
        cy.get('#add-network-lamden').click()
        cy.get('#numOfNetworks').should('exist').then(($div) => {
            expect(parseInt($div[0].textContent)).to.eq(2)
        })
        cy.get('#delete-undefined-network').click()
        tick();
        cy.get('#numOfNetworks').should('exist').then(($div) => {
            expect(parseInt($div[0].textContent)).to.eq(2)
        })
    })

    it('Rejects deleting lamden network', () => {
        cy.get('#delete-lamden-network').click()
        tick();
        cy.get('#numOfNetworks').should('exist').then(($div) => {
            expect(parseInt($div[0].textContent)).to.eq(2)
        })
    })

    it('Rejects setting undefiend network', () => {
        cy.get('#set-current-network-undefined').click()
        tick();
        cy.get('#1-network-selected').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq('false')
        })
    })

    it('Sets a network as current', () => {
        cy.get('#set-current-network').click()
        tick();
        cy.get('#1-network-selected').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq('true')
        })
    })

    it('Reject setting network with missing info', () => {
        cy.get('#set-current-network-badnetwork').click()
        tick();
        cy.get('#1-network-selected').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq('true')
        })
    })

    it('Reject setting network that doesn\'t exists', () => {
        cy.get('#set-current-network-doesntexist').click()
        tick();
        cy.get('#1-network-selected').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq('true')
        })
    })

    it('Cannot save an undefined value to the localstorage', () => {
        cy.get('#set-undefiened-store-value').click()
        tick();
        cy.get('#store-exists').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq('true')
        })
    })

    it('Cannot save an empty object to the localstorage', () => {
        cy.get('#set-empty-store-value').click()
        tick()
        cy.get('#store-exists').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq('true')
        })
    })
})