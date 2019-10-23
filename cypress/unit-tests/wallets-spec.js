import {  pubFromPriv, 
          keysFromNew 
       } from '../../src/js/crypto/wallets.js';

describe('Unit Test Crypto Wallet functions', function () {
    context('pubFromPriv: Create public keys from private keys', function () {
        it('creates ETH public keys', function () {
            cy.fixture('unit-tests/wallets.json').then(( f_wallets) => {
                const fdata = f_wallets.pubFromPriv_eth.data
                const fresult = f_wallets.pubFromPriv_eth.result
                expect( pubFromPriv(fdata.network, fdata.symbol, fdata.sk) ).to.eq( fresult.vk )
            })
        })

        it('creates ETH-TESTNET public keys', function () {
            cy.fixture('unit-tests/wallets.json').then(( f_wallets) => {
                const fdata = f_wallets.pubFromPriv_ethTestnet.data
                const fresult = f_wallets.pubFromPriv_ethTestnet.result
                expect( pubFromPriv(fdata.network, fdata.symbol, fdata.sk) ).to.eq( fresult.vk )
            })
        })

        it('creates public keys for ETH BASED networks', function () {
            cy.fixture('unit-tests/wallets.json').then(( f_wallets) => {
                const fdata = f_wallets.pubFromPriv_egem.data
                const fresult = f_wallets.pubFromPriv_egem.result
                expect( pubFromPriv(fdata.network, fdata.symbol, fdata.sk) ).to.eq( fresult.vk )
            })
        })

        it('creates BTC public keys', function () {
            cy.fixture('unit-tests/wallets.json').then(( f_wallets) => {
                const fdata = f_wallets.pubFromPriv_btc.data
                const fresult = f_wallets.pubFromPriv_btc.result
                expect( pubFromPriv(fdata.network, fdata.symbol, fdata.sk) ).to.eq( fresult.vk )
            })
        })

        it('creates BTC-TESTNET public keys', function () {
            cy.fixture('unit-tests/wallets.json').then(( f_wallets) => {
                const fdata = f_wallets.pubFromPriv_btcTestnet.data
                const fresult = f_wallets.pubFromPriv_btcTestnet.result
                expect( pubFromPriv(fdata.network, fdata.symbol, fdata.sk) ).to.eq( fresult.vk )
            })
        })

        it('creates public keys for BTC BASED networks', function () {
            cy.fixture('unit-tests/wallets.json').then(( f_wallets) => {
                const fdata = f_wallets.pubFromPriv_dash.data
                const fresult = f_wallets.pubFromPriv_dash.result
                expect( pubFromPriv(fdata.network, fdata.symbol, fdata.sk) ).to.eq( fresult.vk )
            })
        })
    })

    context('pubFromPriv: Creates appropriate errors - ', function () {
        it('reject unrecognized network ', function () {
            expect(() => pubFromPriv('testing', '', '') ).to.throw(Error, 'testing is not a supported network');
        })

        it('reject bad ETH private key ', function () {
            expect(() => pubFromPriv('ethereum', 'ETH', 'thisisBAD') ).to.throw(Error, 'Not a valid ethereum private key');
        })

        it('reject bad BTC private key ', function () {
            expect(() => pubFromPriv('bitcoin', 'BTC', 'thisisBAD') ).to.throw(Error, 'Not a valid bitcoin private key');
        })

        it('reject bad BTC network symbol ', function () {
            expect(() => pubFromPriv('bitcoin', 'BAD-TESTING', '') ).to.throw(Error, 'Not a valid bitcoin network');
        })
    })

    context('keysFromNew: Generate keypairs - ', function () {
        it('returns BTC keypair ', function () {
            cy.fixture('unit-tests/wallets.json').then(( f_wallets) => {
                const fResult = f_wallets.keysFromNew_keypairProps.result
                cy.wrap( keysFromNew('bitcoin', 'BTC') )
                    .then(( result ) => {
                        Object.keys( result ).map(function( key ) {
                            cy.wrap(fResult).should('contain', key)
                        });
                        expect( result.symbol ).to.eq( 'BTC' )
                        expect( result.network ).to.eq( 'bitcoin' )
                    })
            })
        })

        it('returns BTC-TESTNET keypair ', function () {
            cy.fixture('unit-tests/wallets.json').then(( f_wallets) => {
                const fResult = f_wallets.keysFromNew_keypairProps.result
                cy.wrap( keysFromNew('bitcoin', 'BTC-TESTNET') )
                    .then(( result ) => {
                        Object.keys( result ).map(function( key ) {
                            cy.wrap(fResult).should('contain', key)
                        });
                        expect( result.symbol ).to.eq( 'BTC-TESTNET' )
                        expect( result.network ).to.eq( 'bitcoin' )
                    })
            })
        })

        it('returns BTC BASED NETWORK keypair ', function () {
            cy.fixture('unit-tests/wallets.json').then(( f_wallets) => {
                const fResult = f_wallets.keysFromNew_keypairProps.result
                cy.wrap( keysFromNew('bitcoin', 'DASH') )
                    .then(( result ) => {
                        Object.keys( result ).map(function( key ) {
                            cy.wrap(fResult).should('contain', key)
                        });
                        expect( result.symbol ).to.eq( 'DASH' )
                        expect( result.network ).to.eq( 'bitcoin' )
                    })
            })
        })

        it('returns ETH keypair ', function () {
            cy.fixture('unit-tests/wallets.json').then(( f_wallets) => {
                const fResult = f_wallets.keysFromNew_keypairProps.result
                cy.wrap( keysFromNew('ethereum', 'ETH') )
                    .then(( result ) => {
                        Object.keys( result ).map(function( key ) {
                            cy.wrap(fResult).should('contain', key)
                        });
                        expect( result.symbol ).to.eq( 'ETH' )
                        expect( result.network ).to.eq( 'ethereum' )
                    })
            })
        })

        it('returns ETH-TESTNET keypair ', function () {
            cy.fixture('unit-tests/wallets.json').then(( f_wallets) => {
                const fResult = f_wallets.keysFromNew_keypairProps.result
                cy.wrap( keysFromNew('ethereum', 'ETH-TESTNET') )
                    .then(( result ) => {
                        Object.keys( result ).map(function( key ) {
                            cy.wrap(fResult).should('contain', key)
                        });
                        expect( result.symbol ).to.eq( 'ETH-TESTNET' )
                        expect( result.network ).to.eq( 'ethereum' )
                    })
            })
        })

        it('returns ETH BASED NETWORK keypair ', function () {
            cy.fixture('unit-tests/wallets.json').then(( f_wallets) => {
                const fResult = f_wallets.keysFromNew_keypairProps.result
                cy.wrap( keysFromNew('ethereum', 'EGEM') )
                    .then(( result ) => {
                        Object.keys( result ).map(function( key ) {
                            cy.wrap(fResult).should('contain', key)
                        });
                        expect( result.symbol ).to.eq( 'EGEM' )
                        expect( result.network ).to.eq( 'ethereum' )
                    })
            })
        })
    })

    context('keysFromNew: Creates appropriate errors - ', function () {
        it('reject unrecognized network ', function () {
            expect(() => keysFromNew('testing', '') ).to.throw(Error, 'testing is not a supported network');
        })
    })
})
