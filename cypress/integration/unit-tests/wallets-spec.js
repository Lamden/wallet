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

        it('Creates ETH public keys', function () {
            cy.fixture('unit-tests/wallets.json').then(( f_wallets) => {
                const fdata = f_wallets.pubFromPriv_eth.data
                const fresult = f_wallets.pubFromPriv_eth.result
                expect( pubFromPriv(fdata.network, fdata.symbol, fdata.sk) ).to.eq( fresult.vk )
            })
        })

        it('Creates ETH-TESTNET public keys', function () {
            cy.fixture('unit-tests/wallets.json').then(( f_wallets) => {
                const fdata = f_wallets.pubFromPriv_ethTestnet.data
                const fresult = f_wallets.pubFromPriv_ethTestnet.result
                expect( pubFromPriv(fdata.network, fdata.symbol, fdata.sk) ).to.eq( fresult.vk )
            })
        })

        it('Creates public keys for ETH BASED networks', function () {
            cy.fixture('unit-tests/wallets.json').then(( f_wallets) => {
                const fdata = f_wallets.pubFromPriv_egem.data
                const fresult = f_wallets.pubFromPriv_egem.result
                expect( pubFromPriv(fdata.network, fdata.symbol, fdata.sk) ).to.eq( fresult.vk )
            })
        })

        it('Creates BTC public keys', function () {
            cy.fixture('unit-tests/wallets.json').then(( f_wallets) => {
                const fdata = f_wallets.pubFromPriv_btc.data
                const fresult = f_wallets.pubFromPriv_btc.result
                expect( pubFromPriv(fdata.network, fdata.symbol, fdata.sk) ).to.eq( fresult.vk )
            })
        })

        it('Creates BTC-TESTNET public keys', function () {
            cy.fixture('unit-tests/wallets.json').then(( f_wallets) => {
                const fdata = f_wallets.pubFromPriv_btcTestnet.data
                const fresult = f_wallets.pubFromPriv_btcTestnet.result
                expect( pubFromPriv(fdata.network, fdata.symbol, fdata.sk) ).to.eq( fresult.vk )
            })
        })

        it('Creates public keys for BTC BASED networks', function () {
            cy.fixture('unit-tests/wallets.json').then(( f_wallets) => {
                const fdata = f_wallets.pubFromPriv_dash.data
                const fresult = f_wallets.pubFromPriv_dash.result
                expect( pubFromPriv(fdata.network, fdata.symbol, fdata.sk) ).to.eq( fresult.vk )
            })
        })
    })

    context('pubFromPriv: Creates appropriate errors - ', function () {
        it('Rejects unrecognized network ', function () {
            cy.fixture('unit-tests/wallets.json').then(( f_wallets) => {
                const fdata = f_wallets.pubFromPriv_eth.data
                expect(() => pubFromPriv('testing', 'ETH', fdata.sk) ).to.throw(Error, 'testing is not a supported network');
            })
        })

        it('Rejects bad Lamden private key ', function () {
            expect(() => pubFromPriv('lamden', 'TAU', 'thisisBAD') ).to.throw(Error, 'bad seed size');
        })

        it('Rejects bad ETH private key ', function () {
            expect(() => pubFromPriv('ethereum', 'ETH', 'thisisBAD') ).to.throw(Error, 'Not a valid ethereum private key');
        })

        it('Rejects bad BTC private key ', function () {
            expect(() => pubFromPriv('bitcoin', 'BTC', 'thisisBAD') ).to.throw(Error, 'Not a valid bitcoin private key');
        })

        it('Rejects bad BTC network symbol ', function () {
            cy.fixture('unit-tests/wallets.json').then(( f_wallets) => {
                const fdata = f_wallets.pubFromPriv_btc.data
                expect(() => pubFromPriv('bitcoin', 'BAD-TESTING', fdata.sk) ).to.throw(Error, 'Not a valid bitcoin network');
            })
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

        it('Returns BTC keypair ', function () {
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

        it('Returns BTC-TESTNET keypair ', function () {
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

        it('Returns BTC BASED NETWORK keypair ', function () {
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

        it('Returns ETH keypair ', function () {
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

        it('Returns ETH-TESTNET keypair ', function () {
            cy.fixture('unit-tests/wallets.json').then(( f_wallets ) => {
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

        it('Returns ETH BASED NETWORK keypair ', function () {
            cy.fixture('unit-tests/wallets.json').then(( f_wallets ) => {
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
        it('Rejects unrecognized network ', function () {
            expect(() => keysFromNew('testing', 'TESTING') ).to.throw(Error, 'testing is not a supported network');
        })

        it('Rejects due to invaild bitcoin symbol ', function () {
            expect(() => keysFromNew('bitcoin', 'TESTING') ).to.throw(Error, 'TESTING is not a supported symbol on the bitcoin network');
        })
    })

    context('validateAddress: Validate Crypto Addresses - ', function () {
        it('Validates an Ethereum address', function () {
            cy.fixture('unit-tests/wallets.json').then(( f_wallets ) => {
                const fdata = f_wallets.validateAddress.data
                expect( validateAddress('ethereum', fdata.vaild_Eth ) ).to.be.a('string')
            })
        })

        it('Validates an Ethereum TESTNET address', function () {
            cy.fixture('unit-tests/wallets.json').then(( f_wallets ) => {
                const fdata = f_wallets.validateAddress.data
                expect( validateAddress('ethereum', fdata.vaild_EthTestnet ) ).to.be.a('string')
            })
        })

        it('Validates an Ethereum BASED address', function () {
            cy.fixture('unit-tests/wallets.json').then(( f_wallets ) => {
                const fdata = f_wallets.validateAddress.data
                expect( validateAddress('ethereum', fdata.valid_EthBased ) ).to.be.a('string')
            })
        })

        it('Validates an Bitcoin address', function () {
            cy.fixture('unit-tests/wallets.json').then(( f_wallets ) => {
                const fdata = f_wallets.validateAddress.data
                expect( validateAddress('bitcoin', fdata.valid_Btc ) ).to.be.a('string')
            })
        })

        it('Validates an Bitcoin TESTNET address', function () {
            cy.fixture('unit-tests/wallets.json').then(( f_wallets ) => {
                const fdata = f_wallets.validateAddress.data
                expect( validateAddress('bitcoin', fdata.vaild_BtcTestnet ) ).to.be.a('string')
            })
        })

        it('Validates an Bitcoin BASED address', function () {
            cy.fixture('unit-tests/wallets.json').then(( f_wallets ) => {
                const fdata = f_wallets.validateAddress.data
                expect( validateAddress('bitcoin', fdata.valid_BtcBased ) ).to.be.a('string')
            }) 
        })
    })

    context('validateAddress: Creates appropriate errors - ', function () {
        it('Rejects unrecognized network ', function () {
            cy.fixture('unit-tests/wallets.json').then(( f_wallets ) => {
                const fdata = f_wallets.validateAddress.data
                expect(() => validateAddress('testing', fdata.vaild_Eth) ).to.throw(Error, 'testing is not a supported network');
            })
        })

        it('Rejects invaild Ethereum network address', function () {
            cy.fixture('unit-tests/wallets.json').then(( f_wallets ) => {
                const fdata = f_wallets.validateAddress.data
                expect(() => validateAddress('ethereum', 'TESTING') ).to.throw(Error, 'Not a valid ethereum public key')
            })
        })

        it('Rejects invaild Bitcoin network address', function () {
            cy.fixture('unit-tests/wallets.json').then(( f_wallets ) => {
                const fdata = f_wallets.validateAddress.data
                expect(() => validateAddress('bitcoin', 'TESTING') ).to.throw(Error, 'Not a valid bitcoin public key')
            })
        })
    })

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

        it('Can sign an Ethereum Atomic Swap Tx', function () {
            cy.fixture('unit-tests/wallets.json').then(( f_wallets ) => {
                const fdata = f_wallets.signTx.data.eth_as
                const fResult = f_wallets.signTx.result.eth_as
                expect( signTx(fdata.raw_tx, fdata.sk, 'ethereum', 'ETH') ).to.eq(fResult)
            })
        })

        it('Can sign an Ethereum P2P Tx', function () {
            cy.fixture('unit-tests/wallets.json').then(( f_wallets ) => {
                const fdata = f_wallets.signTx.data.eth_p2p
                const fResult = f_wallets.signTx.result.eth_p2p
                expect( signTx(fdata.raw_tx, fdata.sk, 'ethereum', 'ETH') ).to.eq(fResult)
            })
        })

        it('Can sign an Ethereum Testnet Atomic Swap Tx', function () {
            cy.fixture('unit-tests/wallets.json').then(( f_wallets ) => {
                const fdata = f_wallets.signTx.data.ethTestnet_as
                const fResult = f_wallets.signTx.result.ethTestnet_as
                expect( signTx(fdata.raw_tx, fdata.sk, 'ethereum', 'ETH-TESTNET') ).to.eq(fResult)
            })
        })

        it('Can sign an Ethereum Testnet P2P Tx', function () {
            cy.fixture('unit-tests/wallets.json').then(( f_wallets ) => {
                const fdata = f_wallets.signTx.data.ethTestnet_p2p
                const fResult = f_wallets.signTx.result.ethTestnet_p2p
                expect( signTx(fdata.raw_tx, fdata.sk, 'ethereum', 'ETH-TESTNET') ).to.eq(fResult)
            })
        })

        it('Can sign a Bitcoin Atomic Swap Tx', function () {
            cy.fixture('unit-tests/wallets.json').then(( f_wallets ) => {
                const fdata = f_wallets.signTx.data.btc_as
                const fResult = f_wallets.signTx.result.btc_as
                expect( signTx(fdata.raw_tx, fdata.sk, 'bitcoin', 'BTC') ).to.eq(fResult)
            })
        })

        it('Can sign a Bitcoin P2P Tx', function () {
            cy.fixture('unit-tests/wallets.json').then(( f_wallets ) => {
                const fdata = f_wallets.signTx.data.btc_p2p
                const fResult = f_wallets.signTx.result.btc_p2p
                expect( signTx(fdata.raw_tx, fdata.sk, 'bitcoin', 'BTC') ).to.eq(fResult)
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

        it('Rejects invaild Ethereum wallet address - Invalid raw transaction (Invalid hex string)', function () {
            cy.fixture('unit-tests/wallets.json').then(( f_wallets ) => {
                const fdata = f_wallets.signTx.data.eth_p2p
                expect(() => signTx('bad_transaction', fdata.sk, 'ethereum', 'ETH') ).to.throw(Error, 'Invalid hex string')
            })
        })

        it('Rejects invaild Ethereum wallet address - Invalid raw transaction (bad tx string)', function () {
            cy.fixture('unit-tests/wallets.json').then(( f_wallets ) => {
                const fdata = f_wallets.signTx.data.eth_invalid
                expect(() => signTx(fdata.raw_tx, fdata.sk, 'ethereum', 'ETH') ).to.throw(Error, 'Invalid Raw Transaction')
            })
        })

        it('Rejects invaild Ethereum wallet address - Invalid private key length', function () {
            cy.fixture('unit-tests/wallets.json').then(( f_wallets ) => {
                const fdata = f_wallets.signTx.data.eth_p2p
                expect(() => signTx(fdata.raw_tx, 'badaddress', 'ethereum', 'ETH') ).to.throw(Error, 'Invalid Private Key length')
            })
        })

        it('Rejects invaild Ethereum raw transaction', function () {
            cy.fixture('unit-tests/wallets.json').then(( f_wallets ) => {
                const fdata = f_wallets.signTx.data.btc_p2p
                expect(() => signTx('badTransaction', fdata.sk, 'ethereum', 'ETH') ).to.throw(Error, 'Invalid hex string')
            })
        })

        it('Rejects invaild Bitcoin wallet address - Invalid private key', function () {
            cy.fixture('unit-tests/wallets.json').then(( f_wallets ) => {
                const fdata = f_wallets.signTx.data.btc_p2p
                expect(() => signTx(fdata.raw_tx, 'badAddress', 'bitcoin', 'BTC') ).to.throw(Error, 'Invalid Private Key')
            })
        })

        it('Rejects invaild Bitcoin wallet address - Invalid private key - Invalid Checksum', function () {
            cy.fixture('unit-tests/wallets.json').then(( f_wallets ) => {
                const badAddress = '5JG2Ss5gRKxDfuL5XDeS6Pj1XCVHKonm4qohCYkMz8wBAnqJJwP'
                const fdata = f_wallets.signTx.data.btc_p2p
                expect(() => signTx(fdata.raw_tx, badAddress, 'bitcoin', 'BTC') ).to.throw(Error, 'Invalid Private Key')
            })
        })

        it('Rejects invaild Bitcoin raw transaction - Invalid raw transaction', function () {
            cy.fixture('unit-tests/wallets.json').then(( f_wallets ) => {
                const fdata = f_wallets.signTx.data.btc_p2p
                expect(() => signTx('badTransaction', fdata.sk, 'bitcoin', 'BTC') ).to.throw(Error, 'Invalid Raw Transaction')
            })
        })

        it('Rejects invaild Bitcoin raw transaction - Invalid hex string', function () {
            cy.fixture('unit-tests/wallets.json').then(( f_wallets ) => {
                const fdata = f_wallets.signTx.data.btc_invalid
                expect(() => signTx(fdata.raw_tx, fdata.sk, 'bitcoin', 'BTC') ).to.throw(Error, 'Invalid Raw Transaction')
            })
        })

    })
})
