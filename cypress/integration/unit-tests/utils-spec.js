//import TestUtils from '../../src/svelte/test_components/TestUtils.svelte'
import {encryptStrHash, decryptStrHash,
        encryptObject, decryptObject,
        decryptFile,
        stripCoinRef,
        vailidateString} from '../../../src/js/utils'
    
describe('Utils Testing Svelte Store Functions', function () {
    context('vailidateString: Create public keys from private keys', function () {
        it('Trims strings', function () {
            const testTrim = `  This Is Trimmed  `
            expect( vailidateString(testTrim, 'Testing Trim', true) ).to.eq( 'This Is Trimmed' )
        })

        it('Does NOT Trims strings', function () {
            const testTrim = `  This Is NOT Trimmed  `
            expect( vailidateString(testTrim, 'Testing Trim', false) ).to.eq( `  This Is NOT Trimmed  ` )
        })
        
        it('Rejects empty strings', function () {
            const testTrim = ''
            expect(() => vailidateString(testTrim, 'Testing Trim', true) ).to.throw(Error, 'Testing Trim field cannot be empty');
        })
    })

    context('encryptStrHash: Encrypt a string with SHA256', function () {
        it('returns an encrypted string', function () {
            cy.fixture('unit-tests/utils.json').then(( f_wallets) => {
                const fdata = f_wallets.encryptStrHash.data
                cy.wrap( encryptStrHash(fdata.password, fdata.string ) )
                    .then(encryptedString => {
                        expect( encryptedString ).to.be.a('string')
                        expect( encryptedString ).to.not.eq( '' )
                        expect( decryptStrHash(fdata.password, encryptedString ) ).to.eq( fdata.string )
                    })
            })
        })
    })

    context('decryptStrHash: Decrypt a SHA256 encoded string', function () {
        it('returns a decrypted string', function () {
            cy.fixture('unit-tests/utils.json').then(( f_wallets) => {
                const fdata = f_wallets.decryptStrHash.data
                const fresult = f_wallets.decryptStrHash.result
                expect( decryptStrHash(fdata.password, fdata.encodedString ) ).to.eq( fresult.string )
            })
        })

        it('returns false when it cannot decrypt: password incorrect', function () {
            cy.fixture('unit-tests/utils.json').then(( f_wallets) => {
                const fdata = f_wallets.decryptStrHash.data
                expect( decryptStrHash( fdata.badPassword, fdata.encodedString ) ).to.eq( false )
            })
        })

        it('returns false when it cannot decrypt: bad hash', function () {
            cy.fixture('unit-tests/utils.json').then(( f_wallets) => {
                const fdata = f_wallets.decryptStrHash.data
                expect( decryptStrHash( fdata.password, fdata.badHash ) ).to.eq( false )
            })
        })
    })

    context('encryptObject: Encrypt an Object with SHA256', function () {
        it('returns an encrypted object', function () {
            cy.fixture('unit-tests/utils.json').then(( f_wallets) => {
                const fdata = f_wallets.encryptObject.data
                cy.wrap( encryptObject(fdata.password, fdata.object ) )
                    .then(encryptedObject => {
                        expect( encryptedObject ).to.be.a('string')
                        expect( encryptedObject ).to.not.eq( '' )
                        expect( decryptObject(fdata.password, encryptedObject ) ).to.deep.equal( fdata.object )
                    })
            })
        })
    })    

    context('decryptObject: Decrypt a SHA256 encoded Object', function () {
        it('returns a decrypted object', function () {
            cy.fixture('unit-tests/utils.json').then(( f_wallets) => {
                const fdata = f_wallets.decryptObject.data
                const fresult = f_wallets.decryptObject.result
                expect( decryptObject( fdata.password, fdata.encodedObject ) ).to.deep.equal( fresult.objectString )
            })
        })

        it('returns returns false when it cannot decrypt: password incorrect', function () {
            cy.fixture('unit-tests/utils.json').then(( f_wallets) => {
                const fdata = f_wallets.decryptObject.data
                expect( decryptObject( fdata.badPassword, fdata.encodedObject ) ).to.eq( false )
            })
        })

        it('returns returns false when it cannot decrypt: bad hash', function () {
            cy.fixture('unit-tests/utils.json').then(( f_wallets) => {
                const fdata = f_wallets.decryptObject.data
                expect( decryptObject( fdata.badPassword, fdata.badHash ) ).to.eq( false )
            })
        })
    })

    context('stripCoinRef: Returns an unreferenced copy of a Coin Object', function () {
        it('can be modified without altering the parent', function () {
            cy.fixture('unit-tests/utils.json').then(( f_wallets) => {
                const fdata = f_wallets.stripCoinRef.data
                const fresult = f_wallets.stripCoinRef.result
                let coin = fdata.coinList[1];
                cy.wrap(stripCoinRef( coin ))
                    .then( newCoin => {
                        expect( newCoin ).to.deep.equal( fresult.newCoin )
                        expect( coin ).to.deep.equal( fresult.coinBeforeCopy )
                    })
            })
        })
    })
})