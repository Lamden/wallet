import {  pubFromPriv, 
          keysFromNew,
          validateAddress,
          signTx } from '../../../src/js/crypto/wallets.js';

/* 
TO DO:
       signTx: Add BTC-TESTNET when API is fixed
*/

describe('Unit Test Crypto Wallet functions', function () {
    context('pubFromPriv: Create public keys from private keys', function () {
        it('Creates Lamden public keys', function () {
            cy.fixture('unit-tests/wallets.json').then(( f_wallets) => {
                const fdata = f_wallets.pubFromPriv_lamden.data
                const fresult = f_wallets.pubFromPriv_lamden.result
                expect( pubFromPriv(fdata.network, fdata.symbol, fdata.sk) ).to.eq( fresult.vk )
            })
        })
    })

    context('pubFromPriv: Creates appropriate errors - ', function () {
        it('Rejects unrecognized network ', function () {
            cy.fixture('unit-tests/wallets.json').then(( f_wallets) => {
                const fdata = f_wallets.pubFromPriv_lamden.data
                expect(() => pubFromPriv('testing', 'STU', fdata.sk) ).to.throw(Error, 'testing is not a supported network');
            })
        })

        it('Rejects bad Lamden private key ', function () {
            expect(() => pubFromPriv('lamden', 'TAU', 'thisisBAD') ).to.throw(Error, 'Invalid lamden privateKey');
        })
    })

    context('keysFromNew: Generates keypairs - ', function () {
        it('Returns Lamden keypair ', function () {
            cy.fixture('unit-tests/wallets.json').then(( f_wallets) => {
                const fResult = f_wallets.keysFromNew_keypairProps.result
                cy.wrap( keysFromNew('lamden', 'TAU') )
                    .then(( result ) => {
                        Object.keys( result ).map(function( key ) {
                            cy.wrap(fResult).should('contain', key)
                        });
                        expect( result.symbol ).to.eq( 'TAU' )
                        expect( result.network ).to.eq( 'lamden' )
                    })
            })
        })
    })

    context('keysFromNew: Creates appropriate errors - ', function () {
        it('Rejects unrecognized network ', function () {
            expect(() => keysFromNew('testing', 'TESTING') ).to.throw(Error, 'testing is not a supported network');
        })
    })

    context('validateAddress: Validate Crypto Addresses - ', function () {
        // Need Lamden test
    })

    context('validateAddress: Creates appropriate errors - ', function () {
        it('Rejects unrecognized network ', function () {
            cy.fixture('unit-tests/wallets.json').then(( f_wallets ) => {
                const fdata = f_wallets.validateAddress.data
                expect(() => validateAddress('testing', fdata.vaild_Lamden) ).to.throw(Error, 'testing is not a supported network');
            })
        })
    })
/*
    context('signTx: Signes a raw transaction - ', function () {
        it('Can remove whitespace from a private key string', function () {
            cy.fixture('unit-tests/wallets.json').then(( f_wallets ) => {
                const fdata = f_wallets.signTx.data.eth_as
                const fResult = f_wallets.signTx.result.eth_as
                expect( signTx(fdata.raw_tx, `   ${fdata.sk}   `, 'ethereum', 'ETH') ).to.eq(fResult)
            })
        })

        it('Can remove whitespace from a raw Tx string', function () {
            cy.fixture('unit-tests/wallets.json').then(( f_wallets ) => {
                const fdata = f_wallets.signTx.data.eth_as
                const fResult = f_wallets.signTx.result.eth_as
                expect( signTx(`   ${fdata.raw_tx}   `, fdata.sk, 'ethereum', 'ETH') ).to.eq(fResult)
            })
        })
    })

    context('signTx: Creates appropriate errors - ', function () {
        it('Rejects unsupprted network', function () {
            cy.fixture('unit-tests/wallets.json').then(( f_wallets ) => {
                const fdata = f_wallets.signTx.data.eth_p2p
                expect(() => signTx(fdata.raw_tx, fdata.sk, 'testing', 'ETH') ).to.throw(Error, 'testing network is not supported')
            })
        })
    })
    */
})
