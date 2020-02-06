import { TransactionBuilder } from '../../../src/js/lamden/transactionBuilder.js'
import { new_wallet } from '../../../src/js/lamden/wallet.js'
import { mintTestNetCoins } from '../../../src/js/lamden/masternode-api.js';

let goodNetwork = {
    name: 'Lamden Public Network', 
    ip: 'https://testnet.lamden.io', 
    port: '443'
}

let badNetwork = {
    name: 'Lamden Public Bad Network', 
    ip: 'http://badnetwork.lamden.io', 
    port: '8000'
}

let invalidNetwork = {
    name: 'Lamden Public Invalid Network', 
    ip: '', 
}
let nonce = 0;
let processor = "0000000000000000000000000000000000000000000000000000000000000000";

let newWallet = new_wallet()
let kwargs = {}
kwargs.to = {
    type: "address", 
    value: newWallet.vk
}
kwargs.amount = {
    type: "fixedPoint", 
    value: 1000
}

describe('Test TransactionBuilder class', () => {
    before(function() {
        Cypress.config({
            defaultCommandTimeout: 60000
        })
        cy.wrap(mintTestNetCoins(goodNetwork, newWallet.vk, 100000))
        .then((res) => {
            cy.expect(res).to.eq(true);
        })
    })

    context('new TransactionBuilder', () => {
        it('can create an instance without nonce or processor', () => {
            let newTx = new TransactionBuilder(goodNetwork, newWallet.vk, 'currency', 'transfer', kwargs, 50000)
            cy.expect(newTx).to.exist;
            cy.expect(JSON.stringify(newTx.networkNode)).to.eq(JSON.stringify(goodNetwork))
            cy.expect(newTx.sender).to.eq(newWallet.vk)
            cy.expect(newTx.contract).to.eq('currency')
            cy.expect(newTx.func).to.eq('transfer')
            cy.expect(JSON.stringify(newTx.kwargs)).to.eq(JSON.stringify(kwargs))
            cy.expect(newTx.transactionSigned).to.eq(false)
            cy.expect(newTx.API.sendTransaction).to.exist;
            cy.expect(newTx.API.getNonce).to.exist;
            cy.expect(newTx.wallet.sign).to.exist;
            cy.expect(newTx.wallet.verify).to.exist;
        })
        it('can create an instance by providing nonce and processor', () => {
            let newTx = new TransactionBuilder(goodNetwork, newWallet.vk, 'currency', 'transfer', kwargs, 50000, nonce, processor)
            cy.expect(newTx).to.exist;
            cy.expect(newTx.nonce).to.exist;
            cy.expect(newTx.processor).to.exist;
        })
        it('it throws error when missing arguments', () => {
            function testValues(argName, networkNode, sender, contract, func, kwargs, stamps){
                try{
                    return new TransactionBuilder(networkNode, sender, contract, func, kwargs, stamps)
                }catch (e){
                    cy.expect(e.message).to.eq(`${argName} is undefined`);
                }
            }
            let newTx = undefined;
            newTx = testValues('networkNode', undefined, newWallet.vk, 'currency', 'transfer', kwargs, 50000)
            newTx = testValues('sender', goodNetwork, undefined, 'currency', 'transfer', kwargs, 50000)
            newTx = testValues('contract', goodNetwork, newWallet.vk, undefined, 'transfer', kwargs, 50000)
            newTx = testValues('func', goodNetwork, newWallet.vk, 'currency', undefined, kwargs, 50000)
            newTx = testValues('kwargs', goodNetwork, newWallet.vk, 'currency', 'transfer', undefined, 50000)
            newTx = testValues('stamps', goodNetwork, newWallet.vk, 'currency', 'transfer', kwargs, undefined)
            cy.expect(typeof newTx).to.eq('undefined');
        })
    })

    context('TransactionBuilder.sign()', () => {
        it('can sign and verify a transaction', () => {
            let newTx = new TransactionBuilder(goodNetwork, newWallet.vk, 'currency', 'transfer', kwargs, 50000, nonce, processor)
            newTx.sign(newWallet.sk)
            cy.expect(newTx.transactionSigned).to.eq(true)
            cy.expect(newTx.verifySignature()).to.eq(true)
        })
        it('throws and error if nonce not set ', () => {
            let newTx = new TransactionBuilder(goodNetwork, newWallet.vk, 'currency', 'transfer', kwargs, 50000)
            cy.expect(newTx.nonce).to.not.exist
            cy.expect(newTx.processor).to.not.exist
            try {
                newTx.sign(newWallet.sk)
            } catch (e){
                cy.expect(e.toString()).to.eq('Error: No Nonce Set')
            }
        })
    })

    context('TransactionBuilder.getNonce()', () => {
        it('can retieve nonce and processor from the masternode', () => {
            let newTx = new TransactionBuilder(goodNetwork, newWallet.vk, 'currency', 'transfer', kwargs, 50000)
            cy.wrap(newTx.getNonce())
            .then((res) => {
                //Validate Nonce was retrieved
                cy.expect(res.nonce).to.exist
                cy.expect(res.processor).to.exist
                cy.expect(res.sender).to.exist
                cy.expect(newTx.nonce).to.eq(res.nonce)
                cy.expect(newTx.processor).to.eq(res.processor)
                cy.expect(newTx.sender).to.eq(res.sender)
            })
        })
        it('throws error if vk is not correct info is missing or invalid', () => {
            return new Cypress.Promise((resolve, reject) => {
                let newTx = new TransactionBuilder(invalidNetwork, newWallet.vk, 'currency', 'transfer', kwargs, 50000)
                try{
                    resolve(newTx.getNonce())
                } catch (e){
                    reject(e.message)
                }
            })
            .then(res => cy.expect(res).to.not.exist)
            .catch(err => cy.expect(err.message).to.eq(`Cannot get ip:port from network object.`))
        })
        it('throws error if provided network is unresponsive', () => {
            return new Cypress.Promise((resolve, reject) => {
                let newTx = new TransactionBuilder(badNetwork, newWallet.vk, 'currency', 'transfer', kwargs, 50000)
                try{
                    resolve(newTx.getNonce())
                } catch (e){
                    reject(e.message)
                }
            })
            .then(res => cy.expect(res).to.not.exist)
            .catch(err => cy.expect(err.message).to.eq(`Unable to get nonce for ${newWallet.vk} on network http://badnetwork.lamden.io:8000`))
        })
        it('throws error if network info is missing or invalid', () => {
            return new Cypress.Promise((resolve, reject) => {
                let newTx = new TransactionBuilder(invalidNetwork, newWallet.vk, 'currency', 'transfer', kwargs, 50000)
                try{
                    resolve(newTx.getNonce())
                } catch (e){
                    reject(e.message)
                }
            })
            .then(res => cy.expect(res).to.not.exist)
            .catch(err => cy.expect(err.message).to.eq(`Cannot get ip:port from network object.`))
        })
    })

    context('TransactionBuilder.send()', () => {
        it('sends a transaction', () => {
            let newTx = new TransactionBuilder(goodNetwork, newWallet.vk, 'currency', 'transfer', kwargs, 50000, nonce, processor)
            //Sign transaction
            newTx.sign(newWallet.sk)
            //Validate transaction is signed
            cy.expect(newTx.transactionSigned).to.eq(true)
            cy.expect(newTx.verifySignature()).to.eq(true)

            //Send signed transaction
            cy.wrap(newTx.send())
            .then((res) => {
                cy.expect(res.state_changes).to.exist
                cy.expect(res.status_code).to.exist
                cy.expect(res.result).to.eq(null)
                cy.expect(res.stamps_used).to.exist
            })
        })
        it('gets nonce and signs transacation automatically if sk is provided', () => {
            let newTx = new TransactionBuilder(goodNetwork, newWallet.vk, 'currency', 'transfer', kwargs, 50000)
            //Send signed transaction
            cy.wrap(newTx.send(newWallet.sk))
            .then((res) => {
                cy.expect(res.state_changes).to.exist
                cy.expect(res.status_code).to.exist
                cy.expect(res.result).to.eq(null)
                cy.expect(res.stamps_used).to.exist
            })
        })
        it('throws error if provided network is unresponsive', () => {
            return new Cypress.Promise(async (resolve, reject) => {
                let newTx = new TransactionBuilder(badNetwork, newWallet.vk, 'currency', 'transfer', kwargs, 50000, nonce, processor)
                //Sign transaction
                newTx.sign(newWallet.sk)
                //Validate transaction is signed
                cy.expect(newTx.transactionSigned).to.eq(true)
                cy.expect(newTx.verifySignature()).to.eq(true)
                try{
                    resolve(await newTx.send())
                } catch (e) {
                    reject(e)
                }
            })
            .then(res => cy.expect(res).to.include(`TypeError: Failed to fetch`))
            .catch(err => cy.expect(err).to.not.exist)
        })
        it('throws error if provided network info is missing or invalid', () => {
            return new Cypress.Promise(async (resolve, reject) => {
                let newTx = new TransactionBuilder(invalidNetwork, newWallet.vk, 'currency', 'transfer', kwargs, 50000, nonce, processor)
                //Sign transaction
                newTx.sign(newWallet.sk)
                //Validate transaction is signed
                cy.expect(newTx.transactionSigned).to.eq(true)
                cy.expect(newTx.verifySignature()).to.eq(true)
                try{
                    resolve(await newTx.send())
                    cy.expect
                } catch (e) {
                    reject(e.message)
                }
            })
            .then(res => cy.expect(res).to.not.exist)
            .catch(err => cy.expect(err.message).to.include(`Cannot get ip:port from network object.`))
        })
    })
})    