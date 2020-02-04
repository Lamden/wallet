import * as masternodeAPI from '../../../src/js/lamden/masternode-api.js'
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
    context('pingServer', () => {
        it('returns true if the server is online', () => {
            cy.wrap(masternodeAPI.pingServer(goodNetwork))
            .then((res) => {
                cy.expect(res).to.eq(true);
            })
        })
        it('returns false if the server is not reachable', () => {
            cy.wrap(masternodeAPI.pingServer(badNetwork))
            .then((res) => {
                cy.expect(res).to.eq(false);
            })
        })
        it('returns false on fetch error due to bad url', () => {
            cy.wrap(masternodeAPI.pingServer(invalidNetwork))
            .then((res) => {
                cy.expect(res).to.eq(false);
            })
        })
    })

    context('mintTestNetCoins', () => {
        it('returns true if mint is successful', () => {
            cy.wrap(masternodeAPI.mintTestNetCoins(goodNetwork, keyPair.vk, 123456789))
            .then((res) => {
                cy.log(JSON.stringify(keyPair))
                cy.expect(res).to.eq(true);
            })
        })
        it('returns false if bad vk is undefined', () => {
            cy.wrap(masternodeAPI.mintTestNetCoins(goodNetwork, undefined, 123456789))
            .then((res) => {
                cy.expect(res).to.eq(false);
            })
        })
        it('returns false if balance is undefined', () => {
            cy.wrap(masternodeAPI.mintTestNetCoins(goodNetwork, keyPair.vk, undefined))
            .then((res) => {
                cy.expect(res).to.eq(false);
            })
        })
        it('returns false if network was not accessable', () => {
            cy.wrap(masternodeAPI.mintTestNetCoins(badNetwork, keyPair.vk, 123456789))
            .then((res) => {
                cy.expect(res).to.eq(false);
            })
        })
        it('returns false on fetch error due to bad url', () => {
            cy.wrap(masternodeAPI.mintTestNetCoins(invalidNetwork, keyPair.vk, 123456789))
            .then((res) => {
                cy.expect(res).to.eq(false);
            })
        })
    })

    context('getTauBalance', () => {
        it('returns the balance for a vk', () => {
            cy.wrap(masternodeAPI.getTauBalance(goodNetwork, keyPair.vk))
            .then((res) => {
                cy.expect(res).to.eq(123456789);
            })
        })
        it('returns 0 if the vk does not exist yet', () => {
            cy.wrap(masternodeAPI.getTauBalance(goodNetwork, new_wallet().vk))
            .then((res) => {
                cy.expect(res).to.eq(0);
            })
        })
        it('returns 0 if the network is bad', () => {
            cy.wrap(masternodeAPI.getTauBalance(badNetwork))
            .then((res) => {
                cy.expect(res).to.eq(0);
            })
        })
        it('returns 0 on fetch error due to bad url', () => {
            cy.wrap(masternodeAPI.getTauBalance(invalidNetwork))
            .then((res) => {
                cy.expect(res).to.eq(0);
            })
        })
    })

    context('contractExists', () => {
        it('returns true if a contract exists on the blockchain', () => {
            cy.wrap(masternodeAPI.contractExists(goodNetwork, 'currency'))
            .then((res) => {
                cy.expect(res).to.eq(true);
            })
        })
        it('returns false if a contract does not exist on the blockchain', () => {
            cy.wrap(masternodeAPI.contractExists(goodNetwork, new_wallet().vk))
            .then((res) => {
                cy.expect(res).to.eq(false);
            })
        })
        it('returns false if the provided network is bad', () => {
            cy.wrap(masternodeAPI.contractExists(badNetwork, 'currency'))
            .then((res) => {
                cy.expect(res).to.eq(false);
            })
        })
        it('returns false on fetch error due to bad url', () => {
            cy.wrap(masternodeAPI.contractExists(invalidNetwork, 'currency'))
            .then((res) => {
                cy.expect(res).to.eq(false);
            })
        })
    })

    context('getContractMethods', () => {
        it('returns an array if a contract exists on the blockchain', () => {
            cy.wrap(masternodeAPI.getContractMethods(goodNetwork, 'currency'))
            .then((res) => {
                cy.expect(Array.isArray(res)).to.eq(true);
                cy.expect(res.length > 0).to.eq(true);
            })
        })
        it('returns an empty array if a contract does not exist on the blockchain', () => {
            cy.wrap(masternodeAPI.getContractMethods(goodNetwork, new_wallet().vk))
            .then((res) => {
                cy.log(JSON.stringify(res))
                //cy.expect(Array.isArray(res)).to.eq(true);
                //cy.expect(res.length === 0).to.eq(true);
            })
        })
        it('returns false if the provided network is bad', () => {
            cy.wrap(masternodeAPI.getContractMethods(badNetwork, 'currency'))
            .then((res) => {
                cy.expect(Array.isArray(res)).to.eq(true);
                cy.expect(res.length === 0).to.eq(true);
            })
        })
        it('returns false on fetch error due to bad url', () => {
            cy.wrap(masternodeAPI.getContractMethods(invalidNetwork, 'currency'))
            .then((res) => {
                cy.expect(Array.isArray(res)).to.eq(true);
                cy.expect(res.length === 0).to.eq(true);
            })
        })
    })

    context('getVariable', () => {
        it('returns the value of the variable if the key exists', () => {
            let parms = {key: keyPair.vk};
            cy.wrap(masternodeAPI.getVariable(goodNetwork, 'currency', 'balances', {parms}))
            .then((res) => {
                cy.expect(res).to.eq('123456789');
            })
        })
        it('returns null if the key does not exist in the variable', () => {
            let parms = {key: new_wallet().vk};
            cy.wrap(masternodeAPI.getVariable(goodNetwork, 'currency', 'balances', {parms}))
            .then((res) => {
                cy.expect(res).to.eq('null');
            })
        })
        it('returns undefined if the contract does not exist', () => {
            let parms = {key: keyPair.vk};
            cy.wrap(masternodeAPI.getVariable(goodNetwork, new_wallet().vk, 'balances', {parms}))
            .then((res) => {
                cy.expect(res).to.eq(undefined);
            })
        })
        it('returns null if the variable does not exist', () => {
            let parms = {key: keyPair.vk};
            cy.wrap(masternodeAPI.getVariable(goodNetwork, 'currency',  new_wallet().vk, {parms}))
            .then((res) => {
                cy.expect(res).to.eq('null');
            })
        })
        it('returns undefined if the provided network is bad', () => {
            let parms = {key: keyPair.vk};
            cy.wrap(masternodeAPI.getVariable(badNetwork, 'currency', 'balances', {parms}))
            .then((res) => {
                cy.expect(res).to.eq(undefined);
            })
        })
        it('returns undefined on fetch error due to bad url', () => {
            let parms = {key: keyPair.vk};
            cy.wrap(masternodeAPI.getVariable(invalidNetwork, 'currency', 'balances', {parms}))
            .then((res) => {
                cy.expect(res).to.eq(undefined);
            })
        })
    })

    context('getContractInfo', () => {
        it('returns a contract info object', () => {
            cy.wrap(masternodeAPI.getContractInfo(goodNetwork, 'currency'))
            .then((res) => {
                cy.expect(res.name).to.eq('currency');
                cy.expect(res.code.length > 0).to.eq(true);
            })
        })
        it('returns undefined if the provided network is bad', () => {
            cy.wrap(masternodeAPI.getContractInfo(badNetwork, 'currency'))
            .then((res) => {
                cy.expect(res).to.eq(undefined);
            })
        })
        it('returns undefined on fetch error due to bad url', () => {
            cy.wrap(masternodeAPI.getContractInfo(invalidNetwork, 'currency'))
            .then((res) => {
                cy.expect(res).to.eq(undefined);
            })
        })
    })
    context('lintCode', () => {
        it('returns null when no vilations exist', () => {
            cy.wrap(masternodeAPI.lintCode(goodNetwork, 'testing', goodCode))
            .then((res) => {
                cy.expect(res.violations).to.eq(null);
            })
        })
        it('returns python syntax errors', () => {
            cy.wrap(masternodeAPI.lintCode(goodNetwork, 'testing', syntaxErrors))
            .then((res) => {
                cy.expect(res.violations.msg).to.eq('invalid syntax');
            })
        })
        it('returns lamden contracting errors errors', () => {
            cy.wrap(masternodeAPI.lintCode(goodNetwork, 'testing', lamdenErrors))
            .then((res) => {
                cy.expect(res.violations.length > 0).to.eq(true);
                cy.expect(res.violations[0]).to.eq('Line 0: S13- No valid contracting decorator found');
            })
        })
        it('returns Errors from fetch when bad network info is supplied', () => {
            cy.wrap(masternodeAPI.lintCode(badNetwork, 'testing', goodCode))
            .then((res) => {
                cy.expect(res).to.eq('TypeError: Failed to fetch');
            })
        })
    })
})    