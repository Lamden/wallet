//import TestUtils from '../../src/svelte/test_components/TestUtils.svelte'
import {checkPassword,
        encryptStrHash, decryptStrHash,
        encryptObject, decryptObject,
        decryptFile,
        toCurrencyFormat,
        stripCoinRef,
        vailidateString} from '../../src/js/utils'
    
describe('Utils Testing Svelte Store Functions', function () {
    context('vailidateString: Create public keys from private keys', function () {
        it('Trims strings', function () {
            const testTrim = `  This Is Trimmed  `
            expect( vailidateString(testTrim, 'Testing Trim') ).to.eq( 'This Is Trimmed' )
        })
        
        it('Rejects empty strings', function () {
            const testTrim = ''
            expect(() => vailidateString(testTrim, 'Testing Trim') ).to.throw(Error, 'Testing Trim field cannot be empty');
        })
    })
*/
})