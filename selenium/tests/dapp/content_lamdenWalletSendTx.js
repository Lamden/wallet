const assert = require('assert');
const {Builder, By, until} = require('selenium-webdriver');
let chrome = require("selenium-webdriver/chrome");
let config = require("../../config/config")
const helpers = require('../../helpers/helpers')
let walletInfo = require("../../fixtures/walletInfo")
let dappsInfo = require("../../fixtures/dappsInfo.json")
var validators = require('types-validate-assert');
const { validateTypes } = validators

let chromeOptions = new chrome.Options();
chromeOptions.addArguments(`load-extension=${config.walletPath}`);

describe('Content Script - Testing Dapp SendTx API', function () {
    var driver;
    var httpServer
    var keyHash;
    var connectionInfo;

    before(async function() {
        httpServer = await helpers.startServer(config.port)
        driver = await new Builder()
                .forBrowser('chrome')
                .setChromeOptions(chromeOptions)
                .build();
        //open tab to wallet
        await driver.get(`chrome-extension://${config.walletExtentionID}/app.html`);
        await helpers.completeFirstRunSetupRestore(driver, config.workingDir, walletInfo, false)
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

    context('lamdenWalletSendTx', function() {
        it('Returns error if event detail is not a JSON string', async function() {
            let transaction = ""
            let response = await helpers.sendTx(driver, transaction, true)
            assert.equal(response.errors.length, 1);
            assert.equal(response.errors[0].includes('Expected event detail to be JSON string'), true)
        });
        it('Returns error if wallet is not authorized', async function() {
            let transaction = helpers.getInstance(dappsInfo.basicTransactionInfo)
            let response = await helpers.sendTx(driver, transaction, true)
            assert.equal(response.errors.length, 1);
            assert.equal(response.errors[0].includes('You must be an authorized dApp'), true)
        });
        it('Create conenction with wallet to our teset dApp website', async function() {
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            await helpers.sendConnectRequest(driver, connection, false)
            await helpers.approvePopup(driver, 2, 1)
            let response = await helpers.getWalletResponse(driver)
            connectionInfo = response
            assert.equal(response.errors, null);
        });
        it('Reject tx with missing networkType', async function() {
            let transaction = helpers.getInstance(dappsInfo.basicTransactionInfo)
            keyHash = helpers.hashStringValue(new Date().toDateString())
            transaction.networkType = null 
            transaction.kwargs.key_value = keyHash
            let response = await helpers.sendTx(driver, transaction, true)
            assert.equal(response.status, "Unable to process transaction");
            assert.equal(response.data.errors.length, 1);
            assert.equal(response.data.errors[0], "networkType <string> required but not provided");
            assert.equal(JSON.parse(response.data.rejected).kwargs.key_value, keyHash);
        });
        it('Reject tx with invalid Lamden networkType', async function() {
            let transaction = helpers.getInstance(dappsInfo.basicTransactionInfo)
            keyHash = helpers.hashStringValue(new Date().toDateString())
            transaction.networkType = "badNetworkType"
            transaction.kwargs.key_value = keyHash
            let response = await helpers.sendTx(driver, transaction, true)
            assert.equal(response.status, "Unable to process transaction");
            assert.equal(response.data.errors.length, 1);
            assert.equal(response.data.errors[0].includes("'badNetworkType' is not a valid network type"), true);
            assert.equal(JSON.parse(response.data.rejected).kwargs.key_value, keyHash);
        });
        it('Reject tx attempt on unapproved Lamden Network', async function() {
            let transaction = helpers.getInstance(dappsInfo.basicTransactionInfo)
            keyHash = helpers.hashStringValue(new Date().toDateString())
            transaction.networkType = "mockchain"
            transaction.kwargs.key_value = keyHash
            let response = await helpers.sendTx(driver, transaction, true)

            assert.equal(response.status, "Unable to process transaction");
            assert.equal(response.data.errors.length, 1);
            assert.equal(response.data.errors[0].includes("Transactions on 'mockchain' have not been approved"), true);
            assert.equal(JSON.parse(response.data.rejected).kwargs.key_value, keyHash);
        });
        it('Forwards error from lamden.js if issues occur building transaction', async function() {
            let transaction = helpers.getInstance(dappsInfo.basicTransactionInfo)
            keyHash = helpers.hashStringValue(new Date().toDateString())
            transaction.methodName = 1000
            transaction.kwargs.key_value = keyHash
            let response = await helpers.sendTx(driver, transaction, true)

            assert.equal(response.status, "Unable to process transaction");
            assert.equal(response.data.errors.length, 2);
            assert.equal(response.data.errors[0].includes("Unable to Build Lamden Transaction"), true);
            assert.equal(response.data.errors[1].includes("Method Required (Type: String)"), true);
            assert.equal(JSON.parse(response.data.rejected).kwargs.key_value, keyHash);
        });
        it('POPUP: Reports the user denying the transaction', async function() {
            let transaction = helpers.getInstance(dappsInfo.basicTransactionInfo)
            keyHash = helpers.hashStringValue(new Date().toDateString())
            transaction.kwargs.key_value = keyHash
            await helpers.sendTx(driver, transaction, false)
            await helpers.sleep(2000, true)
            await helpers.switchWindow(driver, 2)
            let popupDeny_Buttom = await driver.wait(until.elementLocated(By.id("deny-btn")), 5000);
            await popupDeny_Buttom.click()
            await helpers.switchWindow(driver, 1)
            await helpers.sleep(2000, true)
            let response = await helpers.getTxResult(driver)
            assert.equal(response.status, "Transaction Cancelled");
            assert.equal(response.data.errors.length, 1);
            assert.equal(response.data.errors[0], "User closed Popup window");
            assert.equal(JSON.parse(response.data.rejected).kwargs.key_value, keyHash);
        });
        it('Rejects tx if wallet is locked', async function() {
            await helpers.lockWallet(driver, 1)
            let transaction = helpers.getInstance(dappsInfo.basicTransactionInfo)
            keyHash = helpers.hashStringValue(new Date().toDateString())
            transaction.kwargs.key_value = keyHash
            let response = await helpers.sendTx(driver, transaction, true)
            assert.equal(response.status, "Unable to process transaction");
            assert.equal(response.data.errors.length, 1);
            assert.equal(response.data.errors[0], "Wallet is Locked");
            assert.equal(JSON.parse(response.data.rejected).kwargs.key_value, keyHash);
            await helpers.unlockWallet(driver, walletInfo.walletPassword, 1)         
        });
        it('sends a transactions successfully after popup approval', async function() {
            this.timeout(10000);
            let transaction = helpers.getInstance(dappsInfo.basicTransactionInfo)
            keyHash = helpers.hashStringValue(new Date().toDateString())
            transaction.kwargs.key_value = keyHash
            await helpers.sendTx(driver, transaction, false)
            await helpers.approvePopup(driver, 2, 1)
            let response = await helpers.getTxResult(driver)
            assert.equal(response.status, "error");
            let result = response.data
            assert.equal(result.networkInfo[transaction.networkType], true);
            assert.equal(result.nonceResult.sender, connectionInfo.wallets[0]);
            assert.equal(result.nonceResult.nonce, 0);
            assert.equal(result.resultInfo.stampsUsed, 0)
            assert.equal(result.resultInfo.type, 'error')
            assert.equal(result.signed, true)
            assert.equal(result.signature.length > 0, true)
            assert.equal(JSON.stringify(result.txInfo.kwargs), JSON.stringify(transaction.kwargs));
            assert.equal(result.txInfo.senderVk, connectionInfo.wallets[0]);
            assert.equal(result.txInfo.contractName, connectionInfo.approvals[transaction.networkType].contractName);
            assert.equal(result.txInfo.methodName, transaction.methodName);
            assert.equal(result.txInfo.stampLimit, transaction.stampLimit);     
        });
        it('sends a transactions successfully after pre-approval', async function() {
            this.timeout(30000);
            //Resend approval with a pre-approval amount
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            connection.preApproval = dappsInfo.preApprovalInfo
            connection.reapprove = true
            await helpers.sendConnectRequest(driver, connection, false)
            await helpers.approvePopup(driver, 2, 1, true)
            let connectionResponse = await helpers.getWalletResponse(driver)
            connectionInfo = connectionResponse
            assert.equal(connectionResponse.errors, null);

            //Send a transaction with pre-approval
            let transaction = helpers.getInstance(dappsInfo.basicTransactionInfo)
            keyHash = helpers.hashStringValue(new Date().toDateString())
            transaction.kwargs.key_value = keyHash
            let txResponse = await helpers.sendTx(driver, transaction, true)
            assert.equal(txResponse.status, "error");
            let result = txResponse.data
            assert.equal(result.networkInfo[transaction.networkType], true);
            assert.equal(result.nonceResult.sender, connectionInfo.wallets[0]);
            assert.equal(result.nonceResult.nonce, 0);
            assert.equal(result.resultInfo.stampsUsed, 0)
            assert.equal(result.resultInfo.type, 'error')
            assert.equal(result.signed, true)
            assert.equal(result.signature.length > 0, true)
            assert.equal(JSON.stringify(result.txInfo.kwargs), JSON.stringify(transaction.kwargs));
            assert.equal(result.txInfo.senderVk, connectionInfo.wallets[0]);
            assert.equal(result.txInfo.contractName, connectionInfo.approvals[transaction.networkType].contractName);
            assert.equal(result.txInfo.methodName, transaction.methodName);
            assert.equal(result.txInfo.stampLimit, transaction.stampLimit);     
        });
        it('Rejects tx if keypair no longer exists in the Lamden Wallet', async function() {
            await helpers.switchWindow(driver, 0)
            await driver.findElement(By.id("coin-row-1")).click()
            await driver.findElement(By.id("modify-coin-btn")).click()
            await driver.findElement(By.id("modify-delete-btn")).click()
            await driver.executeScript(`document.getElementById('pwd-input').value='${walletInfo.walletPassword}'`);
            await driver.findElement(By.id("validate-btn")).click()
            await driver.findElement(By.id("validate-btn")).click()
            await helpers.switchWindow(driver, 1)
            let transaction = helpers.getInstance(dappsInfo.basicTransactionInfo)
            keyHash = helpers.hashStringValue(new Date().toDateString())
            transaction.kwargs.key_value = keyHash
            let response = await helpers.sendTx(driver, transaction, true)
            assert.equal(response.status, "error");
            assert.equal(response.errors.length, 1);
            assert.equal(response.errors[0].includes(`Prompt the user to restore their keypair for vk '${connectionInfo.wallets[0]}'`), true);
        });
    })
})