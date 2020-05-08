const assert = require('assert');
const {Builder, By, until} = require('selenium-webdriver');
let chrome = require("selenium-webdriver/chrome");
let config = require("../../config/config")
const helpers = require('../../helpers/helpers')
let walletInfo = require("../../fixtures/walletInfo")
let dappsInfo = require("../../fixtures/dappsInfo.json")
var http = require('http');
var fs = require('fs');
var path = require('path');
var validators = require('types-validate-assert');
const { validateTypes } = validators

let chromeOptions = new chrome.Options();
chromeOptions.addArguments(`load-extension=${config.walletPath}`);

describe('Content Script - Testing Dapp API', function () {
    let driver;
    let httpServer;
    let connectionInfo;
    const sendConnectRequest = (connectionInfo, awaitResponse = true) => {
        return driver.executeScript(`
            window.walletResponse = new Promise((resolve, reject) => {window.resolver = resolve})
            document.addEventListener('lamdenWalletInfo', (response) => {
                window.resolver(response.detail)
            });
            document.dispatchEvent( new CustomEvent('lamdenWalletConnect', {detail: '${JSON.stringify(connectionInfo)}'} ));
            ${awaitResponse ? "return await window.walletResponse" : ""}
        `);
    }
    const getWalletResponse = () => {
        return driver.executeScript(`
            return await window.walletResponse
        `);
    }

    before(async function() {
        driver = await new Builder()
                .forBrowser('chrome')
                .setChromeOptions(chromeOptions)
                .build();
        //open tab to wallet
        await driver.get(`chrome-extension://${config.walletExtentionID}/app.html`);
        const htmlPath = path.resolve(config.workingDir, 'selenium', 'fixtures', 'index.html')
        fs.readFile(htmlPath, function (err, html) {
            if (err) {
                console.log(err)
            }       
            httpServer = http.createServer(function(request, response) {  
                response.writeHeader(200, {"Content-Type": "text/html"});  
                response.write(html);  
                response.end();
            }).listen(5959)
        });
        await helpers.completeFirstRunSetup(driver, walletInfo.walletPassword)
    });

    after(() => {
        driver && driver.quit();
        httpServer.close()
     });

     context('Test Setup', function() {
        it('Load Test Website', async function() {
            await driver.executeScript("window.open('http://localhost:5959','_blank');");
            await helpers.switchWindow(driver, 1)
            assert.equal(true, true)
    
        });
    });
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
            let response = await sendConnectRequest(connection)
            assert.equal(response.errors.includes("Wallet is Locked"), true);

            //Unlock the wallet for rest of test cases
            await helpers.unlockWallet(driver, walletInfo.walletPassword, 1)
        });
        it('Rejects an empty connection request', async function() {
            let connection = {}
            let response = await sendConnectRequest(connection)
            assert.equal(response.errors.includes("'appName' <string> required to process connect request"), true);
            assert.equal(response.errors.includes("'contractName' <string> required to process connect request"), true);
            assert.equal(response.errors.includes("'logo' <string> required to process connect request"), true);
            assert.equal(response.errors.includes("'networkType' <string> required to process connect request"), true);
            assert.equal(response.errors.includes("'description' <string> required to process connect request"), true);

        });
        it('Rejects missing appName', async function() {
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            delete connection.appName
            let response = await sendConnectRequest(connection)
            assert.equal(response.errors.length, 1);
            assert.equal(response.errors.includes("'appName' <string> required to process connect request"), true);
        });
        it('Rejects empty appName', async function() {
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            connection.appName = ""
            let response = await sendConnectRequest(connection)
            assert.equal(response.errors.length, 1);
            assert.equal(response.errors.includes("'appName' <string> required to process connect request"), true);
        });
        it('Rejects non string appName', async function() {
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            connection.appName = 5
            let response = await sendConnectRequest(connection)
            assert.equal(response.errors.length, 1);
            assert.equal(response.errors.includes("'appName' <string> required to process connect request"), true);
        });
        it('Rejects missing description', async function() {
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            delete connection.description
            let response = await sendConnectRequest(connection)
            assert.equal(response.errors.length, 1);
            assert.equal(response.errors.includes("'description' <string> required to process connect request"), true);
        });
        it('Rejects non string description', async function() {
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            connection.description = 5
            let response = await sendConnectRequest(connection)
            assert.equal(response.errors.length, 1);
            assert.equal(response.errors.includes("'description' <string> required to process connect request"), true);
        });
        it('Rejects too short of a description', async function() {
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            connection.description = "This isnt 60 characters"
            let response = await sendConnectRequest(connection)
            assert.equal(response.errors.length, 1);
            assert.equal(response.errors.includes("'description' <string> character length required to be greather than 60"), true);
        });
        it('Rejects missing contractName', async function() {
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            delete connection.contractName
            let response = await sendConnectRequest(connection)
            assert.equal(response.errors.length, 1);
            assert.equal(response.errors.includes("'contractName' <string> required to process connect request"), true);
        });
        it('Rejects empty contractName', async function() {
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            connection.contractName = ""
            let response = await sendConnectRequest(connection)
            assert.equal(response.errors.length, 1);
            assert.equal(response.errors.includes("'contractName' <string> required to process connect request"), true);
        });
        it('Rejects non string contractName', async function() {
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            connection.contractName = 5
            let response = await sendConnectRequest(connection)
            assert.equal(response.errors.length, 1);
            assert.equal(response.errors.includes("'contractName' <string> required to process connect request"), true);
        });
        it('Rejects a non-existant  contractName', async function() {
            let badContractName = "1912900gf9dfg90oij02309230g0r08df08h"
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            connection.contractName = badContractName
            let response = await sendConnectRequest(connection)
            assert.equal(response.errors.length, 1);
            assert.equal(response.errors.includes(`contractName: '${badContractName}' does not exists on 'testnet' network.`), true);
        });
        
        it('Rejects missing networkType', async function() {
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            delete connection.networkType
            let response = await sendConnectRequest(connection)
            assert.equal(response.errors.length, 1);
            assert.equal(response.errors.includes("'networkType' <string> required to process connect request"), true);
        });
        it('Rejects empty networkType', async function() {
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            connection.networkType = ""
            let response = await sendConnectRequest(connection)
            assert.equal(response.errors.length, 1);
            assert.equal(response.errors.includes("'networkType' <string> required to process connect request"), true);
        });
        it('Rejects non string networkType', async function() {
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            connection.networkType = 5
            let response = await sendConnectRequest(connection)
            assert.equal(response.errors.length, 1);
            assert.equal(response.errors.includes("'networkType' <string> required to process connect request"), true);
        });
        it('Rejects wrong networkType', async function() {
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            connection.networkType = 'wrongNet'
            let response = await sendConnectRequest(connection)
            assert.equal(response.errors.length, 1);
            assert.equal(response.errors.includes("'networkType' <string> 'wrongNet' is not a valid network type. Valid Types are mainnet,testnet,mockchain."), true);
        });
        it('Rejects missing logo', async function() {
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            delete connection.logo
            let response = await sendConnectRequest(connection)
            assert.equal(response.errors.length, 1);
            assert.equal(response.errors.includes("'logo' <string> required to process connect request"), true);
        });
        it('Rejects empty logo', async function() {
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            connection.logo = ""
            let response = await sendConnectRequest(connection)
            assert.equal(response.errors.length, 1);
            assert.equal(response.errors.includes("'logo' <string> required to process connect request"), true);
        });
        it('Rejects non string logo', async function() {
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            connection.logo = 5
            let response = await sendConnectRequest(connection)
            assert.equal(response.errors.length, 1);
            assert.equal(response.errors.includes("'logo' <string> required to process connect request"), true);
        });
        it('preApproval - Rejects missing stampsToPreApprove', async function() {
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            connection.preApproval = helpers.getInstance(dappsInfo.preApprovalInfo)
            delete connection.preApproval.stampsToPreApprove
            let response = await sendConnectRequest(connection)
            assert.equal(response.errors.length, 1);
            assert.equal(response.errors.includes("Invalid preApproval request. Must have 'stampsToPreApprove' <int> and 'message' <string> properties"), true);
        });
        it('preApproval - Rejects stampsToPreApprove value less than one ', async function() {
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            connection.preApproval = helpers.getInstance(dappsInfo.preApprovalInfo)
            connection.preApproval.stampsToPreApprove = -1
            let response = await sendConnectRequest(connection)
            assert.equal(response.errors.length, 1);
            assert.equal(response.errors.includes("'preApproval.stampsToPreApprove' must be an integer greater than 0."), true);
        });
        it('preApproval - Rejects non integer stampsToPreApprove value', async function() {
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            connection.preApproval = helpers.getInstance(dappsInfo.preApprovalInfo)
            connection.preApproval.stampsToPreApprove = ""
            let response = await sendConnectRequest(connection)
            assert.equal(response.errors.length, 1);
            assert.equal(response.errors.includes("'preApproval.stampsToPreApprove' must be an <integer>."), true);
        });
        it('preApproval - Rejects missing message', async function() {
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            connection.preApproval = helpers.getInstance(dappsInfo.preApprovalInfo)
            delete connection.preApproval.message
            let response = await sendConnectRequest(connection)
            assert.equal(response.errors.length, 1);
            assert.equal(response.errors.includes("Invalid preApproval request. Must have 'stampsToPreApprove' <int> and 'message' <string> properties"), true);
        });
        it('preApproval - Rejects empty message', async function() {
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            connection.preApproval = helpers.getInstance(dappsInfo.preApprovalInfo)
            connection.preApproval.message = ""
            let response = await sendConnectRequest(connection)
            assert.equal(response.errors.length, 1);
            assert.equal(response.errors.includes("'preApproval.message' must be a <string> and not empty."), true);
        });
        it('Rejects empty background value', async function() {
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            connection.background = helpers.getInstance(dappsInfo.background)
            connection.background = ""
            let response = await sendConnectRequest(connection)
            assert.equal(response.errors.length, 1);
            assert.equal(response.errors.includes("'background' <string> was provided but invalid."), true);
        });
        it('Rejects non-string background value', async function() {
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            connection.background = helpers.getInstance(dappsInfo.background)
            connection.background = 5
            let response = await sendConnectRequest(connection)
            assert.equal(response.errors.length, 1);
            assert.equal(response.errors.includes("'background' <string> was provided but invalid."), true);
        });
        it('Charms - Rejects non-array charms object', async function() {
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            connection.charms = {}
            let response = await sendConnectRequest(connection)
            assert.equal(response.errors.length, 1);
            assert.equal(response.errors.includes("If provided, the 'charms' property must be an <array>."), true);
        });
        it('Charms - Rejects invalid charms object', async function() {
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            connection.charms = helpers.getInstance(dappsInfo.charmsInfo)
            connection.charms[0] = "Not A Charm Object"
            let response = await sendConnectRequest(connection)
            assert.equal(response.errors.length, 1);
            assert.equal(response.errors.includes("'charm[0]' is not an object"), true);
        });
        it('Charms - Rejects missing name property', async function() {
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            connection.charms = helpers.getInstance(dappsInfo.charmsInfo)
            delete connection.charms[0].name
            let response = await sendConnectRequest(connection)
            assert.equal(response.errors.length, 1);
            assert.equal(response.errors.includes("'charm[0]' no 'name' property defiend"), true);
        });
        it('Charms - Rejects empyty name property', async function() {
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            connection.charms = helpers.getInstance(dappsInfo.charmsInfo)
            connection.charms[0].name = ""
            let response = await sendConnectRequest(connection)
            assert.equal(response.errors.length, 1);
            assert.equal(response.errors.includes("'charm[0]' no 'name' property defiend"), true);
        });
        it('Charms - Rejects non-string name property', async function() {
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            connection.charms = helpers.getInstance(dappsInfo.charmsInfo)
            connection.charms[0].name = 5
            let response = await sendConnectRequest(connection)
            assert.equal(response.errors.length, 1);
            assert.equal(response.errors.includes("'charm[0]' no 'name' property defiend"), true);
        });
        it('Charms - Rejects missing variableName property', async function() {
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            connection.charms = helpers.getInstance(dappsInfo.charmsInfo)
            delete connection.charms[0].variableName
            let response = await sendConnectRequest(connection)
            assert.equal(response.errors.length, 1);
            assert.equal(response.errors.includes("'charm[0]' no 'variableName' property defiend"), true);
        });
        it('Charms - Rejects empty variableName property', async function() {
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            connection.charms = helpers.getInstance(dappsInfo.charmsInfo)
            connection.charms[0].variableName = ""
            let response = await sendConnectRequest(connection)
            assert.equal(response.errors.length, 1);
            assert.equal(response.errors.includes("'charm[0]' no 'variableName' property defiend"), true);
        });
        it('Charms - Rejects non-string variableName property', async function() {
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            connection.charms = helpers.getInstance(dappsInfo.charmsInfo)
            connection.charms[0].variableName = 5
            let response = await sendConnectRequest(connection)
            assert.equal(response.errors.length, 1);
            assert.equal(response.errors.includes("'charm[0]' no 'variableName' property defiend"), true);
        });
        it('Charms - Rejects invalid value format', async function() {
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            connection.charms = helpers.getInstance(dappsInfo.charmsInfo)
            connection.charms[0].formatAs = "nope"
            let response = await sendConnectRequest(connection)
            assert.equal(response.errors.length, 1);
            assert.equal(response.errors.includes("'charm[0]' formatAs value 'nope' is invalid. Only acceptable values are number,string."), true);
        });
        it('Charms - Rejects non-string value format', async function() {
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            connection.charms = helpers.getInstance(dappsInfo.charmsInfo)
            connection.charms[0].formatAs = {}
            let response = await sendConnectRequest(connection)
            assert.equal(response.errors.length, 1);
            assert.equal(response.errors.includes("'charm[0]' formatAs value '[object Object]' is invalid. Only acceptable values are number,string."), true);
        });
        it('Rejects non-boolean reapprove value', async function() {
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            connection.reapprove = "true"
            let response = await sendConnectRequest(connection)
            assert.equal(response.errors.length, 1);
            assert.equal(response.errors.includes("'reapprove' <boolean> can not be string"), true);
        });
        it('Rejects non-boolean newKeypair value', async function() {
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            connection.reapprove = true
            connection.newKeypair = "true"
            let response = await sendConnectRequest(connection)
            assert.equal(response.errors.length, 1);
            assert.equal(response.errors.includes("'newKeypair' <boolean> can not be string"), true);
        });
        it('POPUP: Returns message when connection denied', async function() {
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            await sendConnectRequest(connection, false)
            await helpers.sleep(2000, true)
            await helpers.switchWindow(driver, 2)
            let popupDeny_Buttom = await driver.wait(until.elementLocated(By.id("deny-btn")), 5000);
            await popupDeny_Buttom.click()
            await helpers.sleep(2000, true)
            await helpers.switchWindow(driver, 1)
            await helpers.sleep(2000, true)
            response = await getWalletResponse()
            assert.equal(response.errors.length, 1);
            assert.equal(response.errors.includes("User rejected connection request"), true);
        });
        it('POPUP: Returns message when wallet is locked before request can be confirmed', async function() {
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            await sendConnectRequest(connection, false)
            await helpers.sleep(2000, true)
            await helpers.lockWallet(driver, 2)
            let popupDeny_Buttom = await driver.wait(until.elementLocated(By.id("approve-btn")), 5000);
            await popupDeny_Buttom.click()
            await helpers.sleep(2000, true)
            await helpers.switchWindow(driver, 1)
            await helpers.sleep(2000, true)
            let response = await getWalletResponse()
            assert.equal(response.errors.length, 1);
            assert.equal(response.errors.includes("Tried to approve app but wallet was locked"), true);
            await helpers.unlockWallet(driver, walletInfo.walletPassword, 1)
        });
        it('POPUP: Can Approve a connection request and return wallet info', async function() {
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            let approvalHash = helpers.hashStringValue(JSON.stringify(connection))
            await sendConnectRequest(connection, false)
            await helpers.sleep(2000, true)
            await helpers.switchWindow(driver, 2)
            let popupDeny_Buttom = await driver.wait(until.elementLocated(By.id("approve-btn")), 5000);
            await popupDeny_Buttom.click()
            await helpers.sleep(2000, true)
            await helpers.switchWindow(driver, 1)
            await helpers.sleep(2000, true)
            response = await getWalletResponse()
            connectionInfo = response;
            assert.equal(response.errors, null);
            assert.equal(response.wallets.length, 1);
            assert.equal(response.approvals['testnet'].contractName, 'currency');
            assert.equal(response.approvals['testnet'].approvalHash, approvalHash);
        });
        it('Send error if already authorized for a network/contract combo', async function() {
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            let response = await sendConnectRequest(connection, true)
            assert.equal(response.errors.length, 1);
            assert.equal(response.errors.includes(`App is already authorized to use ${connection.contractName} on ${connection.networkType}`), true);
        });
        it('POPUP: Can Re-approve connection', async function() {
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            connection.contractName = "submission" 
            let approvalHash = helpers.hashStringValue(JSON.stringify(connection))
            connection.reapprove = true;
            await sendConnectRequest(connection, false)
            await helpers.sleep(2000, true)
            await helpers.switchWindow(driver, 2)
            let popupDeny_Buttom = await driver.wait(until.elementLocated(By.id("approve-btn")), 5000);
            await popupDeny_Buttom.click()
            await helpers.sleep(2000, true)
            await helpers.switchWindow(driver, 1)
            await helpers.sleep(2000, true)
            let response = await getWalletResponse()
            
            assert.equal(response.errors, null);
            assert.equal(response.wallets[0], connectionInfo.wallets[0]);
            assert.equal(response.approvals['testnet'].contractName, 'submission');
            assert.equal(response.approvals['testnet'].approvalHash, approvalHash);
            connectionInfo = response;
        });
        it('POPUP: Can Re-approve connection and create a new keypair', async function() {
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            connection.contractName = "currency" 
            let approvalHash = helpers.hashStringValue(JSON.stringify(connection))
            connection.reapprove = true;
            connection.newKeypair = true;
            await sendConnectRequest(connection, false)
            await helpers.sleep(2000, true)
            await helpers.switchWindow(driver, 2)
            let popupDeny_Buttom = await driver.wait(until.elementLocated(By.id("approve-btn")), 5000);
            await popupDeny_Buttom.click()
            await helpers.sleep(2000, true)
            await helpers.switchWindow(driver, 1)
            await helpers.sleep(2000, true)
            let response = await getWalletResponse()
            assert.equal(response.errors, null);
            assert.equal(response.wallets[0] === connectionInfo.wallets[0], false);
            assert.equal(response.approvals['testnet'].contractName, 'currency');
            assert.equal(response.approvals['testnet'].approvalHash, approvalHash);
            connectionInfo = response;
        });
        it('Sends error if the dapp was previously approved but the wallet has no keypair for it anymore', async function() {
            await helpers.switchWindow(driver, 0)
            await driver.executeScript(`
                backpage = chrome.extension.getBackgroundPage();
                backpage.deleteCoin({vk: "${connectionInfo.wallets[0]}"})
            `);
            await helpers.switchWindow(driver, 1)
            await helpers.sleep(2000, true)
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            let response = await sendConnectRequest(connection, true)
            assert.equal(response.errors.length, 1);
            assert.equal(response.errors[0].includes(`Prompt the user to restore their keypair for vk '${connectionInfo.wallets[0]}'`), true);
        });
    })
})