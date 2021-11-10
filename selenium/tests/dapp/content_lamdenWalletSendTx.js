const whitelabel = require('../../../whitelabel.json')

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
            await helpers.setupSendListener(driver);
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
        it('Create wallet connection to our test dApp website ', async function() {
            this.timeout(30000);
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            await helpers.sendConnectRequest(driver, connection, false)
            await helpers.approvePopup(driver, 2, 1, false)
            let response = await helpers.getWalletResponse(driver)

            connectionInfo = response
            assert.equal(response.errors, null);
            await helpers.sleep(2000, false)
            
        });
        it('Reject tx with missing networkType', async function() {
            let transaction = helpers.getInstance(dappsInfo.basicTransactionInfo)
            transaction.networkType = null 
            let response = await helpers.sendTx(driver, transaction, true)
            assert.equal(response.status, "Unable to process transaction");
            assert.equal(response.data.errors.length, 1);
            assert.equal(response.data.errors[0], "networkType <string> required but not provided");
        });
        it('Reject tx with invalid Lamden networkType', async function() {
            let transaction = helpers.getInstance(dappsInfo.basicTransactionInfo)
            transaction.networkType = "badNetworkType"
            let response = await helpers.sendTx(driver, transaction, true)
            assert.equal(response.status, "Unable to process transaction");
            assert.equal(response.data.errors.length, 1);
            assert.equal(response.data.errors[0].includes("'badNetworkType' is not a valid network type"), true);
        });
        it('Reject tx attempt on unapproved Lamden Network', async function() {
            let transaction = helpers.getInstance(dappsInfo.basicTransactionInfo)
            transaction.networkType = "mockchain"
            let response = await helpers.sendTx(driver, transaction, true)
            assert.equal(response.status, "Unable to process transaction");
            assert.equal(response.data.errors.length, 1);
            assert.equal(response.data.errors[0].includes("'networkType' <string> 'mockchain' is not a valid network type."), true);
        });
        it('Forwards error from lamden.js if issues occur building transaction', async function() {
            let transaction = helpers.getInstance(dappsInfo.basicTransactionInfo)
            transaction.methodName = 1000
            let response = await helpers.sendTx(driver, transaction, true)

            assert.equal(response.status, "Unable to process transaction");
            assert.equal(response.data.errors.length, 2);
            assert.equal(response.data.errors[0].includes(`Unable to Build ${whitelabel.companyName} Transaction`), true);
            assert.equal(response.data.errors[1].includes("Method Required (Type: String)"), true);
        });
        it('POPUP: Reports the user denying the transaction', async function() {
            let transaction = helpers.getInstance(dappsInfo.basicTransactionInfo)
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
        });
        it('Rejects tx if wallet is locked', async function() {
            await helpers.lockWallet(driver, 1)
            let transaction = helpers.getInstance(dappsInfo.basicTransactionInfo)
            let response = await helpers.sendTx(driver, transaction, true)
            assert.equal(response.status, "Unable to process transaction");
            assert.equal(response.data.errors.length, 1);
            assert.equal(response.data.errors[0], "Wallet is Locked");
            await helpers.unlockWallet(driver, walletInfo.walletPassword, 1)         
        });/*
        it('sends a transactions successfully after popup approval', async function() {
            this.timeout(10000);
            let transaction = helpers.getInstance(dappsInfo.basicTransactionInfo)
            await helpers.sendTx(driver, transaction, false)
            await helpers.approveTxPopup(driver, 2, 1)
            let response = await helpers.getTxResult(driver)
            assert.equal(response.status, "success");
            let result = response.data
            assert.equal(result.nonceResult.sender, connectionInfo.wallets[0]);
            assert.equal(result.resultInfo.type, 'success')
            assert.equal(result.signature.length > 0, true)
            assert.equal(JSON.stringify(result.txInfo.kwargs), JSON.stringify(transaction.kwargs));
            assert.equal(result.txInfo.senderVk, connectionInfo.wallets[0]);
            assert.equal(result.txInfo.contractName, connectionInfo.approvals[transaction.networkType].contractName);
            assert.equal(result.txInfo.methodName, transaction.methodName);
            assert.equal(result.txInfo.stampLimit, transaction.stampLimit);     
        });
        it('Sends Currency/Approval transaction after Popup', async function() {
            this.timeout(60000);
            let currentApprovalAmount  = await helpers.getApprovalAmount(connectionInfo.wallets[0], dappsInfo.approvalTransaction.kwargs.to);
            console.log({currentApprovalAmount})
            let transaction = helpers.getInstance(dappsInfo.approvalTransaction)
            await helpers.sendTx(driver, transaction, false)
            await helpers.approveApprovalPopup(driver, 2, 1)
            await helpers.getTxResult(driver)
            await helpers.sleep(50000)
            let afterApprovalAmount  = await helpers.getApprovalAmount(connectionInfo.wallets[0], dappsInfo.approvalTransaction.kwargs.to);
            console.log({afterApprovalAmount})
            assert.equal(afterApprovalAmount, currentApprovalAmount + dappsInfo.approvalTransaction.kwargs.amount);
        });*/
        it('sends a transactions successfully after Trusted App', async function() {
            this.timeout(30000);
            await helpers.switchWindow(driver, 0)
            await helpers.setAsTrustedDapp(driver)
            await helpers.switchWindow(driver, 1)

            //Send a transaction with pre-approval
            let transaction = helpers.getInstance(dappsInfo.basicTransactionInfo)

            let txResponse = await helpers.sendTx(driver, transaction, true)

            assert.equal(txResponse.status, "success");
            let result = txResponse.data
            assert.equal(result.nonceResult.sender, connectionInfo.wallets[0]);
            assert.equal(result.resultInfo.type, 'success')
            assert.equal(result.signature.length > 0, true)
            assert.equal(JSON.stringify(result.txInfo.kwargs), JSON.stringify(transaction.kwargs));
            assert.equal(result.txInfo.senderVk, connectionInfo.wallets[0]);
            assert.equal(result.txInfo.contractName, connectionInfo.approvals[transaction.networkType].contractName);
            assert.equal(result.txInfo.methodName, transaction.methodName);
            assert.equal(result.txInfo.stampLimit, transaction.stampLimit);     
        });
        it('ignores Trusted App auto transactions if contract differs from approved', async function() {
            this.timeout(30000);
            await helpers.sleep(10000)
            let transaction = helpers.getInstance(dappsInfo.nonStandardTransactionInfo)
            await helpers.sendTx(driver, transaction, false)

            await helpers.sleep(2000, true)
            await helpers.switchWindow(driver, 2)
            let approve_Button = await driver.wait(until.elementLocated(By.id("approve-btn")), 500);    
            assert.equal(typeof approve_Button !== 'undefined', true);
        });
    })
})