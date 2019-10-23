import {  pubFromPriv } from '../../src/js/crypto/wallets.js';

describe('Unit Test Crypto Wallet functions', function () {
    context('wallets.js', function () {
        it('Returns an ETH VK from an SK', function () {
            cy.fixture('unit-tests/wallets.json').then(( f_wallets) => {
                const fdata = f_wallets.pubFromPriv_eth.data
                const fresult = f_wallets.pubFromPriv_eth.result
                expect( pubFromPriv(fdata.network, fdata.symbol, fdata.sk) ).to.eq( fresult.vk )
            })
        })
    })
})