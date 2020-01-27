import App from '../../components/CoinStore.svelte'
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
    })

    // ADD COIN
    it('addCoin: Can add a coin to the store', () => {
        cy.get('#add-coin-watch').click()
        cy.get('#0-nickname').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq('Testing Good Coin')
        })
        cy.get('#0-network').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq('lamden')
        })
        cy.get('#0-name').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq('Lamden')
        })
        cy.get('#0-symbol').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq('TAU')
        })
        cy.get('#0-vk').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq('2de1ebf459e62ecc5bd551486fed0b18a5eb487af2b206700acb9f4f5d08bc77')
        })
        cy.get('#0-sk').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq('watchOnly')
        })
        cy.get('#response-added').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq('true')
        })
        cy.get('#response-reason').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq('new')
        })
    })

    it('addCoin: Can update the sk of a watched coin', () => {
        cy.get('#add-coin-update').click()
        cy.get('#0-nickname').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq('Testing Good Coin')
        })
        cy.get('#0-network').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq('lamden')
        })
        cy.get('#0-name').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq('Lamden')
        })
        cy.get('#0-symbol').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq('TAU')
        })
        cy.get('#0-vk').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq('2de1ebf459e62ecc5bd551486fed0b18a5eb487af2b206700acb9f4f5d08bc77')
        })
        cy.get('#0-sk').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq('testing-private-key-value')
        })
        cy.get('#response-added').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq('true')
        })
        cy.get('#response-reason').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq('Testing Good Coin\'s Private Key Updated')
        })
    })

    it('addCoin: Will Not add a coin with duplicate info', () => {
        cy.get('#add-coin-duplicate').click()
        cy.get('#response-added').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq('false')
        })
        cy.get('#response-reason').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq('duplicate')
        })
    })

    it('addCoin: Will Not add undefined coin', () => {
        cy.get('#add-coin-undefined').click()
        cy.get('#response-added').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq('false')
        })
        cy.get('#response-reason').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq('undefinedObject')
        })
    })
    it('addCoin: Will Not add coin with missing info', () => {
        cy.get('#add-coin-missingInfo').click()
        cy.get('#response-added').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq('false')
        })
        cy.get('#response-reason').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq('missingArg')
        })
    })
    // GET COIN
    it('getCoin: Will return a specific coin from the store', () => {
        cy.get('#get-coin').click()
        cy.get('#getCoin-nickname').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq('Testing Good Coin')
        })
        cy.get('#getCoin-network').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq('lamden')
        })
        cy.get('#getCoin-name').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq('Lamden')
        })
        cy.get('#getCoin-symbol').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq('TAU')
        })
        cy.get('#getCoin-vk').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq('2de1ebf459e62ecc5bd551486fed0b18a5eb487af2b206700acb9f4f5d08bc77')
        })
        cy.get('#getCoin-sk').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq('testing-private-key-value')
        })
    })

    it('getCoin: Will return an undefined coin if not found', () => {
        cy.get('#get-coin-undefined').click()
        cy.get('#getCoin-nickname').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq('')
        })
    })

    // UPDATE BALANCE
    it('updateBalance: Updates the balance of a coin with a new value', () => {
        cy.get('#update-balance').click()
        cy.get('#0-balance').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq('100')
        })
        cy.get('#balanceTotal').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq('100')
        })
    })

    it('updateBalance: Rejects undefiend coin, does not error', () => {
        cy.get('#update-balance-undefined-coin').click()
        cy.get('#0-balance').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq('100')
        })
    })
    it('updateBalance: Rejects if missing coin info, does not error', () => {
        cy.get('#update-balance-missing-info').click()
        cy.get('#0-balance').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq('100')
        })
    })
    it('updateBalance: Rejects if missing coin info, does not error', () => {
        cy.get('#update-balance-undefined-balance').click()
        cy.get('#0-balance').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq('100')
        })
    })
    it('updateBalance: Rejects if balance NaN, does not error', () => {
        cy.get('#update-balance-NaN-balance').click()
        cy.get('#0-balance').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq('100')
        })
    })

    it('updateBalances: Rejects undefined network and does not error', () => {
        cy.get('#update-balances-undefined-network').click();
        
    })

    it('updateBalances: Rejects missing network info and does not error', () => {
        cy.get('#update-balances-missing-networkInfo').click()
    })
    /*
    it('updateBalances: Updates all balances from network', () => {
        cy.get('#update-balances').click()
        cy.get('#update-balances').click()
        cy.wait(10000)
        cy.get('#0-balance').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq('1000000')
        })
    })
    */

    it('setPwd: Saves password to the coin store', () => {
        cy.get('#set-password').click()
        cy.get('#password').should('exist').then(($div) => {
            expect($div[0].textContent).to.eq('testing')
        })
    })
})