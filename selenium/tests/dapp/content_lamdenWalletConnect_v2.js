const assert = require('assert');
const {Builder, By} = require('selenium-webdriver');
let chrome = require("selenium-webdriver/chrome");
let config = require("../../config/config")
const helpers = require('../../helpers/helpers')
let walletInfo = require("../../fixtures/walletInfo")
let dappsInfo = require("../../fixtures/dappsInfo_v2.json")

let chromeOptions = new chrome.Options();
chromeOptions.addArguments(`load-extension=${config.walletPath}`);

describe('Content Script - Testing Dapp Connection API', function () {
    let driver;
    let httpServer;

    before(async function() {
        httpServer = await helpers.startServer(config.port)
        driver = await new Builder()
                .forBrowser('chrome')
                .setChromeOptions(chromeOptions)
                .build();
        //open tab to wallet
        await driver.get(`chrome-extension://${config.walletExtentionID}/app.html`);
        await helpers.completeFirstRunSetup(driver, walletInfo.walletPassword)
    });

    after(() => {
        return helpers.closeTest(driver, httpServer)
     });

     context('Test Setup', function() {
        it('Loads Test Website', async function() {
            await driver.executeScript(`window.open('http://localhost:${config.port}','_blank');`);
            await helpers.switchWindow(driver, 1)
            await driver.findElement(By.id('wallet-tests')).then(element => {
                assert.ok(element)
            })
        });
     })

    context('lamdenWalletConnect', function() {
        it('Event Listener rejects non JSON detail', async function() {
            let response = await driver.executeScript(`
                window.walletResponse = new Promise((resolve, reject) => {window.resolver = resolve})
                document.addEventListener('lamdenWalletInfo', (response) => {
                    window.resolver(response.detail)
                });
                document.dispatchEvent( new CustomEvent('lamdenWalletConnect', {detail: {}}));
                return await window.walletResponse
            `);
            assert.equal(response.errors.includes("Expected event detail to be JSON string"), true);
        });

        it('Rejects connection request if wallet is locked', async function() {
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            let response = await helpers.sendConnectRequest(driver, connection)
            console.log({response})
            assert.equal(response.errors.includes("Lamden Vault is Locked"), true);
            //Unlock the wallet for rest of test cases
            await helpers.unlockWallet(driver, walletInfo.walletPassword, 1)
        })
        it('Rejects an empty connection request', async function() {
            let connection = {}
            let response = await helpers.sendConnectRequest(driver, connection)
            assert.equal(response.errors.includes("'appName' <string> required to process connect request"), true);
            assert.equal(response.errors.includes("'contractName' <string> required to process connect request"), true);
            assert.equal(response.errors.includes("'logo' <string> required to process connect request"), true);
            assert.equal(response.errors.includes("'networkType' <string> required to process connect request"), true);

        });
        it('Rejects missing appName', async function() {
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            delete connection.appName
            let response = await helpers.sendConnectRequest(driver, connection)
            assert.equal(response.errors.length, 1);
            assert.equal(response.errors.includes("'appName' <string> required to process connect request"), true);
        });
        it('Rejects empty appName', async function() {
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            connection.appName = ""
            let response = await helpers.sendConnectRequest(driver, connection)
            assert.equal(response.errors.length, 1);
            assert.equal(response.errors.includes("'appName' <string> required to process connect request"), true);
        });
        it('Rejects missing version', async function() {
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            delete connection.version
            let response = await helpers.sendConnectRequest(driver, connection)
            assert.equal(response.errors.length, 1);
            assert.equal(response.errors.includes("'version' <string> required to process connect request"), true);
        });
        it('Rejects empty version', async function() {
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            connection.version = ""
            let response = await helpers.sendConnectRequest(driver, connection)
            assert.equal(response.errors.length, 1);
            assert.equal(response.errors.includes("'version' <string> required to process connect request"), true);
        });
        it('Rejects non string appName', async function() {
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            connection.appName = 5
            let response = await helpers.sendConnectRequest(driver, connection)
            assert.equal(response.errors.length, 1);
            assert.equal(response.errors.includes("'appName' <string> required to process connect request"), true);
        });
        it('Rejects missing contractName', async function() {
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            delete connection.contractName
            let response = await helpers.sendConnectRequest(driver, connection)
            assert.equal(response.errors.length, 1);
            assert.equal(response.errors.includes("'contractName' <string> required to process connect request"), true);
        });
        it('Rejects empty contractName', async function() {
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            connection.contractName = ""
            let response = await helpers.sendConnectRequest(driver, connection)
            assert.equal(response.errors.length, 1);
            assert.equal(response.errors.includes("'contractName' <string> required to process connect request"), true);
        });
        it('Rejects non string contractName', async function() {
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            connection.contractName = 5
            let response = await helpers.sendConnectRequest(driver, connection)
            assert.equal(response.errors.length, 1);
            assert.equal(response.errors.includes("'contractName' <string> required to process connect request"), true);
        });
        it('Rejects a non-existant  contractName', async function() {
            let badContractName = "1912900gf9dfg90oij02309230g0r08df08h"
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            connection.contractName = badContractName
            let response = await helpers.sendConnectRequest(driver, connection)
            assert.equal(response.errors.length, 1);
            assert.equal(response.errors.includes(`contractName: '${badContractName}' does not exists on 'testnet' network.`), true);
        });
        
        it('Rejects missing networkType', async function() {
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            delete connection.networkType
            let response = await helpers.sendConnectRequest(driver, connection)
            assert.equal(response.errors.length, 1);
            assert.equal(response.errors.includes("'networkType' <string> required to process connect request"), true);
        });
        it('Rejects empty networkType', async function() {
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            connection.networkType = ""
            let response = await helpers.sendConnectRequest(driver, connection)
            assert.equal(response.errors.length, 1);
            assert.equal(response.errors.includes("'networkType' <string> required to process connect request"), true);
        });
        it('Rejects non string networkType', async function() {
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            connection.networkType = 5
            let response = await helpers.sendConnectRequest(driver, connection)
            assert.equal(response.errors.length, 1);
            assert.equal(response.errors.includes("'networkType' <string> required to process connect request"), true);
        });
        it('Rejects wrong networkType', async function() {
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            connection.networkType = 'wrongNet'
            let response = await helpers.sendConnectRequest(driver, connection)
            assert.equal(response.errors.length, 1);
            assert.equal(response.errors.includes("'networkType' <string> 'wrongNet' is not a valid network type."), true);
        });
        it('Rejects missing logo', async function() {
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            delete connection.logo
            let response = await helpers.sendConnectRequest(driver, connection)
            assert.equal(response.errors.length, 1);
            assert.equal(response.errors.includes("'logo' <string> required to process connect request"), true);
        });
        it('Rejects empty logo', async function() {
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            connection.logo = ""
            let response = await helpers.sendConnectRequest(driver, connection)
            assert.equal(response.errors.length, 1);
            assert.equal(response.errors.includes("'logo' <string> required to process connect request"), true);
        });
        it('Rejects non string logo', async function() {
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            connection.logo = 5
            let response = await helpers.sendConnectRequest(driver, connection)
            assert.equal(response.errors.length, 1);
            assert.equal(response.errors.includes("'logo' <string> required to process connect request"), true);
        });
        it('Rejects empty background value', async function() {
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            connection.background = helpers.getInstance(dappsInfo.background)
            connection.background = ""
            let response = await helpers.sendConnectRequest(driver, connection)
            assert.equal(response.errors.length, 1);
            assert.equal(response.errors.includes("'background' <string> was provided but invalid."), true);
        });
        it('Rejects non-string background value', async function() {
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            connection.background = helpers.getInstance(dappsInfo.background)
            connection.background = 5
            let response = await helpers.sendConnectRequest(driver, connection)
            assert.equal(response.errors.length, 1);
            assert.equal(response.errors.includes("'background' <string> was provided but invalid."), true);
        });
        it('Charms - Rejects non-array charms object', async function() {
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            connection.charms = {}
            let response = await helpers.sendConnectRequest(driver, connection)
            assert.equal(response.errors.length, 1);
            assert.equal(response.errors.includes("If provided, the 'charms' property must be an <array>."), true);
        });
        it('Charms - Rejects invalid charms object', async function() {
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            connection.charms = helpers.getInstance(dappsInfo.charmsInfo)
            connection.charms[0] = "Not A Charm Object"
            let response = await helpers.sendConnectRequest(driver, connection)
            assert.equal(response.errors.length, 1);
            assert.equal(response.errors.includes("'charm[0]' is not an object"), true);
        });
        it('Charms - Rejects missing name property', async function() {
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            connection.charms = helpers.getInstance(dappsInfo.charmsInfo)
            delete connection.charms[0].name
            let response = await helpers.sendConnectRequest(driver, connection)
            assert.equal(response.errors.length, 1);
            assert.equal(response.errors.includes("'charm[0]' no 'name' property defiend"), true);
        });
        it('Charms - Rejects empyty name property', async function() {
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            connection.charms = helpers.getInstance(dappsInfo.charmsInfo)
            connection.charms[0].name = ""
            let response = await helpers.sendConnectRequest(driver, connection)
            assert.equal(response.errors.length, 1);
            assert.equal(response.errors.includes("'charm[0]' no 'name' property defiend"), true);
        });
        it('Charms - Rejects non-string name property', async function() {
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            connection.charms = helpers.getInstance(dappsInfo.charmsInfo)
            connection.charms[0].name = 5
            let response = await helpers.sendConnectRequest(driver, connection)
            assert.equal(response.errors.length, 1);
            assert.equal(response.errors.includes("'charm[0]' no 'name' property defiend"), true);
        });
        it('Charms - Rejects missing variableName property', async function() {
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            connection.charms = helpers.getInstance(dappsInfo.charmsInfo)
            delete connection.charms[0].variableName
            let response = await helpers.sendConnectRequest(driver, connection)
            assert.equal(response.errors.length, 1);
            assert.equal(response.errors.includes("'charm[0]' no 'variableName' property defiend"), true);
        });
        it('Charms - Rejects empty variableName property', async function() {
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            connection.charms = helpers.getInstance(dappsInfo.charmsInfo)
            connection.charms[0].variableName = ""
            let response = await helpers.sendConnectRequest(driver, connection)
            assert.equal(response.errors.length, 1);
            assert.equal(response.errors.includes("'charm[0]' no 'variableName' property defiend"), true);
        });
        it('Charms - Rejects non-string variableName property', async function() {
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            connection.charms = helpers.getInstance(dappsInfo.charmsInfo)
            connection.charms[0].variableName = 5
            let response = await helpers.sendConnectRequest(driver, connection)
            assert.equal(response.errors.length, 1);
            assert.equal(response.errors.includes("'charm[0]' no 'variableName' property defiend"), true);
        });
        it('Charms - Rejects invalid value format', async function() {
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            connection.charms = helpers.getInstance(dappsInfo.charmsInfo)
            connection.charms[0].formatAs = "nope"
            let response = await helpers.sendConnectRequest(driver, connection)
            assert.equal(response.errors.length, 1);
            assert.equal(response.errors.includes("'charm[0]' formatAs value 'nope' is invalid. Only acceptable values are number,string."), true);
        });
        it('Charms - Rejects non-string value format', async function() {
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            connection.charms = helpers.getInstance(dappsInfo.charmsInfo)
            connection.charms[0].formatAs = {}
            let response = await helpers.sendConnectRequest(driver, connection)
            assert.equal(response.errors.length, 1);
            assert.equal(response.errors.includes("'charm[0]' formatAs value '[object Object]' is invalid. Only acceptable values are number,string."), true);
        });

        it('POPUP: Returns message when connection denied', async function() {
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            await helpers.sendConnectRequest(driver, connection, false)
            await helpers.denyPopup(driver, 2, 1)
            let response = await helpers.getWalletResponse(driver)
            assert.equal(response.errors.length, 1);
            assert.equal(response.errors.includes("User rejected connection request"), true);
        });
        it('POPUP: Returns message when wallet is locked before request can be confirmed', async function() {
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            await helpers.sendConnectRequest(driver, connection, false)
            await helpers.switchWindow(driver, 0) 
            //await helpers.ignoreBackupModal(driver)
            await helpers.lockWallet(driver, 1)
            await helpers.sleep(2000, true)
            await helpers.approvePopup(driver, 2, 1, true, {show: false})
            let response = await helpers.getWalletResponse(driver)
            assert.equal(response.errors.length, 1);
            assert.equal(response.errors.includes("Tried to approve app but Lamden Vault was locked"), true);
        });
        it('POPUP: Can Approve a connection request and return wallet info', async function() {
            await helpers.unlockWallet(driver, walletInfo.walletPassword, 1)
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            connection.charms = dappsInfo.charmsInfo
            connection.background = dappsInfo.background
            await helpers.sendConnectRequest(driver, connection, false)
            await helpers.approvePopup(driver, 2, 1, true, {show: false})
            let response = await helpers.getWalletResponse(driver)
            
            assert.equal(response.errors, null);
            assert.equal(response.wallets.length, 1);
            assert.equal(response.approvals['arko']['testnet'].contractName, connection.contractName);
            assert.equal(response.approvals['arko']['testnet'].version, connection.version);
            assert.equal(response.approvals['arko']['testnet'].trustedApp, true);
            assert.equal(response.approvals['arko']['testnet'].charms.length, 1);
        });
        it('POPUP: Can Update connection info if version is greater', async function() {
            let connection = helpers.getInstance(dappsInfo.updatedConnectionInfo_basic)
            connection.charms = [...dappsInfo.charmsInfo, ...dappsInfo.charmsInfo]

            await helpers.sendConnectRequest(driver, connection, false)
            let response = await helpers.getWalletResponse(driver)
            connectionInfo = response;
            
            assert.equal(response.errors, null);
            assert.equal(response.wallets.length, 1);
            assert.equal(response.approvals['arko']['testnet'].contractName, connection.contractName);
            assert.equal(response.approvals['arko']['testnet'].version, dappsInfo.updatedConnectionInfo_basic.version);
            assert.equal(response.approvals['arko']['testnet'].trustedApp, true);
            assert.equal(response.approvals['arko']['testnet'].charms.length, 2);
        });
        it('POPUP: Can Update smart contract after reapproval if version is greater', async function() {
            let connection = helpers.getInstance(dappsInfo.updatedConnectionInfo_smartcontract)

            await helpers.sendConnectRequest(driver, connection, false)
            await helpers.sleep(3000, true)
            await helpers.approveReApprovePopup(driver, 2, 1)
            let response = await helpers.getWalletResponse(driver)
            
            assert.equal(response.errors, null);
            assert.equal(response.wallets.length, 1);
            assert.equal(response.approvals['arko']['testnet'].contractName, connection.contractName);
            assert.equal(response.approvals['arko']['testnet'].version, dappsInfo.updatedConnectionInfo_smartcontract.version);
            assert.equal(response.approvals['arko']['testnet'].trustedApp, true);
            assert.equal(typeof response.approvals['arko']['testnet'].charms === 'undefined', true);
        });
        it('Does nothing if a smart contract update is sent with an equal or lower version', async function() {
            let connection = helpers.getInstance(dappsInfo.updatedConnectionInfo_basic)
            connection.charms = dappsInfo.charmsInfo

            await helpers.sendConnectRequest(driver, connection, false)
            await helpers.sleep(2000, true)

            // Does not create popup
            let winHandles = await driver.getAllWindowHandles()
            assert.equal(winHandles.length, 2);

            //Does not change dapp connection info
            let response = await helpers.sendGetInfoRequest(driver)

            assert.equal(response.errors, null);
            assert.equal(response.wallets.length, 1);
            assert.equal(response.approvals['arko']['testnet'].contractName, dappsInfo.updatedConnectionInfo_smartcontract.contractName);
            assert.equal(response.approvals['arko']['testnet'].version, dappsInfo.updatedConnectionInfo_smartcontract.version);
            assert.equal(response.approvals['arko']['testnet'].trustedApp, true);
            assert.equal(typeof response.approvals['arko']['testnet'].charms === 'undefined', true);
        });
    })
})