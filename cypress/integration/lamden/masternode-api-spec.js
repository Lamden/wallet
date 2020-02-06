import * as API from '../../../src/js/lamden/masternode-api.js'
import {  TransactionBuilder } from '../../../src/js/lamden/transactionBuilder.js'
import { new_wallet } from '../../../src/js/lamden/wallet.js'

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
    port: ''
}

let goodCode = "@export\ndef first_method(value):\n\treturn value"
let syntaxErrors = "@export\ndef first_method(value)\n\treturn value"
let lamdenErrors = "def first_method(value):\n\treturn value"

let keyPair = new_wallet()

describe('Test Masternode API returns', () => {
    before(function() {
        Cypress.config({
            defaultCommandTimeout: 60000
        })
    })

    context('masternodeAPI', () => {
        it('throws error on missing ip or port in the network Object', () => {
            try{
                API.masternodeAPI(invalidNetwork)
            } catch (e) {
                cy.expect(e.message).to.eq('Cannot get ip:port from network object.');
            }
        })
    })

    context('pingServer', () => {
        it('returns true if the server is online', () => {
            cy.wrap(API.pingServer(goodNetwork))
            .then((res) => {
                cy.expect(res).to.eq(true);
            })
        })
        it('returns false if provided network is unresponsive', () => {
            cy.wrap(API.pingServer(badNetwork))
            .then((res) => {
                cy.expect(res).to.eq(false);
            })
        })
    })

    context('mintTestNetCoins', () => {
        it('returns true if mint is successful', () => {
            cy.wrap(API.mintTestNetCoins(goodNetwork, keyPair.vk, 123456789))
            .then((res) => {
                cy.log(JSON.stringify(keyPair))
                cy.expect(res).to.eq(true);
            })
        })
        it('returns false if bad vk is undefined', () => {
            cy.wrap(API.mintTestNetCoins(goodNetwork, undefined, 123456789))
            .then((res) => {
                cy.expect(res).to.eq(false);
            })
        })
        it('returns false if balance is undefined', () => {
            cy.wrap(API.mintTestNetCoins(goodNetwork, keyPair.vk, undefined))
            .then((res) => {
                cy.expect(res).to.eq(false);
            })
        })
        it('returns false if provided network is unresponsive', () => {
            cy.wrap(API.mintTestNetCoins(badNetwork, keyPair.vk, 123456789))
            .then((res) => {
                cy.expect(res).to.eq(false);
            })
        })
    })

    context('getTauBalance', () => {
        it('returns the balance for a vk', () => {
            cy.wrap(API.getTauBalance(goodNetwork, keyPair.vk))
            .then((res) => {
                cy.expect(res).to.eq(123456789);
            })
        })
        it('returns 0 if the vk does not exist yet', () => {
            cy.wrap(API.getTauBalance(goodNetwork, new_wallet().vk))
            .then((res) => {
                cy.expect(res).to.eq(0);
            })
        })
        it('returns 0 if provided network is unresponsive', () => {
            cy.wrap(API.getTauBalance(badNetwork))
            .then((res) => {
                cy.expect(res).to.eq(0);
            })
        })
    })

    context('contractExists', () => {
        it('returns true if a contract exists on the blockchain', () => {
            cy.wrap(API.contractExists(goodNetwork, 'currency'))
            .then((res) => {
                cy.expect(res).to.eq(true);
            })
        })
        it('returns false if a contract does not exist on the blockchain', () => {
            cy.wrap(API.contractExists(goodNetwork, new_wallet().vk))
            .then((res) => {
                cy.expect(res).to.eq(false);
            })
        })
        it('returns false if provided network is unresponsive', () => {
            cy.wrap(API.contractExists(badNetwork, 'currency'))
            .then((res) => {
                cy.expect(res).to.eq(false);
            })
        })
    })

    context('getContractMethods', () => {
        it('returns an array if a contract exists on the blockchain', () => {
            cy.wrap(API.getContractMethods(goodNetwork, 'currency'))
            .then((res) => {
                cy.expect(Array.isArray(res)).to.eq(true);
                cy.expect(res.length > 0).to.eq(true);
            })
        })
        it('returns an empty array if a contract does not exist on the blockchain', () => {
            cy.wrap(API.getContractMethods(goodNetwork, new_wallet().vk))
            .then((res) => {
                cy.log(JSON.stringify(res))
                cy.expect(Array.isArray(res)).to.eq(true);
                cy.expect(res.length === 0).to.eq(true);
            })
        })
        it('returns empty array if provided network is unresponsive', () => {
            cy.wrap(API.getContractMethods(badNetwork, 'currency'))
            .then((res) => {
                cy.expect(Array.isArray(res)).to.eq(true);
                cy.expect(res.length === 0).to.eq(true);
            })
        })
    })

    context('getVariable', () => {
        it('returns the value of the variable if the key exists', () => {
            let parms = {key: keyPair.vk};
            cy.wrap(API.getVariable(goodNetwork, 'currency', 'balances', {parms}))
            .then((res) => {
                cy.expect(res).to.eq('123456789');
            })
        })
        it('returns null if the key does not exist in the variable', () => {
            let parms = {key: new_wallet().vk};
            cy.wrap(API.getVariable(goodNetwork, 'currency', 'balances', {parms}))
            .then((res) => {
                cy.expect(res).to.eq('null');
            })
        })
        it('returns undefined if the contract does not exist', () => {
            let parms = {key: keyPair.vk};
            cy.wrap(API.getVariable(goodNetwork, new_wallet().vk, 'balances', {parms}))
            .then((res) => {
                cy.expect(res).to.eq(undefined);
            })
        })
        it('returns null if the variable does not exist', () => {
            let parms = {key: keyPair.vk};
            cy.wrap(API.getVariable(goodNetwork, 'currency',  new_wallet().vk, {parms}))
            .then((res) => {
                cy.expect(res).to.eq('null');
            })
        })
        it('returns undefined if provided network is unresponsive', () => {
            let parms = {key: keyPair.vk};
            cy.wrap(API.getVariable(badNetwork, 'currency', 'balances', {parms}))
            .then((res) => {
                cy.expect(res).to.eq(undefined);
            })
        })
    })

    context('getContractInfo', () => {
        it('returns a contract info object', () => {
            cy.wrap(API.getContractInfo(goodNetwork, 'currency'))
            .then((res) => {
                cy.expect(res.name).to.eq('currency');
                cy.expect(res.code.length > 0).to.eq(true);
            })
        })
        it('returns undefined if provided network is unresponsive', () => {
            cy.wrap(API.getContractInfo(badNetwork, 'currency'))
            .then((res) => {
                cy.expect(res).to.eq(undefined);
            })
        })
    })
    context('lintCode', () => {
        it('returns null when no vilations exist', () => {
            cy.wrap(API.lintCode(goodNetwork, 'testing', goodCode))
            .then((res) => {
                cy.expect(res.violations).to.eq(null);
            })
        })
        it('returns python syntax errors', () => {
            cy.wrap(API.lintCode(goodNetwork, 'testing', syntaxErrors))
            .then((res) => {
                cy.expect(res.violations.msg).to.eq('invalid syntax');
            })
        })
        it('returns lamden contracting errors errors', () => {
            cy.wrap(API.lintCode(goodNetwork, 'testing', lamdenErrors))
            .then((res) => {
                cy.expect(res.violations.length > 0).to.eq(true);
                cy.expect(res.violations[0]).to.eq('Line 0: S13- No valid contracting decorator found');
            })
        })
        it('returns an error message if provided network is unresponsive', () => {
            cy.wrap(API.lintCode(badNetwork, 'testing', goodCode))
            .then((res) => {
                cy.expect(res).to.eq('TypeError: Failed to fetch');
            })
        })
    })
    context('getNonce', () => {
        it('returns a nonce and processor value for a vk', () => {
            cy.wrap(API.getNonce(goodNetwork, keyPair.vk))
            .then((res) => {
                cy.expect(res.nonce).to.exist
                cy.expect(res.processor).to.exist
                cy.expect(res.sender).to.eq(keyPair.vk)
            })
        })
        it('returns an error message if vk is not a hex string', () => {
            cy.wrap(API.getNonce(goodNetwork, 'this-is-not-a-vk'))
            .then((err) => {
                cy.expect(err).to.eq(`this-is-not-a-vk is not a hex string.`)
            })
        })
        it('returns an error message if provided network is unresponsive', () => {
            cy.wrap(API.getNonce(badNetwork, keyPair.vk))
            .then((err) => {
                cy.expect(err).to.eq(`Unable to get nonce for "${keyPair.vk}". TypeError: Failed to fetch`)
            })
        })
    })
    context('sendTransaction', () => {
        it('can send a transaction and has the proper return object', () => {
            let newWallet = new_wallet()
            let kwargs = {}
            kwargs.to = {type: "address", value: newWallet.vk}
            kwargs.amount = {type: "fixedPoint", value: 1000}

            cy.wrap(API.getNonce(goodNetwork, keyPair.vk))
            .then((res) => {
                let newTx = new TransactionBuilder(
                    goodNetwork,
                    keyPair.vk,
                    'currency',
                    'transfer',
                    kwargs,
                    50000,
                    res.nonce,
                    res.processor
                )
                newTx.sign(keyPair.sk)
                const data = newTx.serialize();
                cy.wrap(API.sendTransaction(goodNetwork, data))
                .then((res) => {
                    cy.log(JSON.stringify(res))
                    cy.expect(res.state_changes).to.exist
                    cy.expect(Object.keys(res.state_changes).length).to.eq(2)
                    cy.expect(res.status_code).to.eq(0)
                    cy.expect(res.result).to.eq(null)
                    cy.expect(res.stamps_used).to.be.greaterThan(0)
                })
            })
        })
    })
})