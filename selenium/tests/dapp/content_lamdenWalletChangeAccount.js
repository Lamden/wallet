const assert = require('assert');
const {Builder, By, until} = require('selenium-webdriver');
let chrome = require("selenium-webdriver/chrome");
let config = require("../../config/config")
const helpers = require('../../helpers/helpers')
let walletInfo = require("../../fixtures/walletInfo")
let dappsInfo = require("../../fixtures/dappsInfo.json")

let chromeOptions = new chrome.Options();
chromeOptions.addArguments(`load-extension=${config.walletPath}`);

/*
NEEDS THE FOLLOWING SMART CONTRACTS ON TESTNET

con_wallet_testing
con_wallet_testing_2

*/

describe('Content Script - Testing Dapp ChangeAccount API', function () {
    let driver;
    let connectionInfo;
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

    context('changeLinkAccount', function() {
        it('Reject: Should be an authorized Dapp', async function() {
            await helpers.unlockWallet(driver, walletInfo.walletPassword, 1)
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            let response = await driver.executeScript(`
                window.walletResponse = new Promise((resolve, reject) => {window.resolver = resolve})
                document.addEventListener('lamdenWalletInfo', (response) => {
                    window.resolver(response.detail)
                });
                document.dispatchEvent( new CustomEvent('changeLinkAccount', {detail: '${JSON.stringify(connection)}'}));
                return await window.walletResponse
            `);
            assert.equal(response.errors.includes("You must be an authorized dApp to send this message type. Send 'lamdenWalletConnect' event first to authorize."), true);
        });
        it('POPUP: Can Approve a connection request and return wallet info', async function() {
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            connection.charms = dappsInfo.charmsInfo
            connection.background = dappsInfo.background
            await helpers.sendConnectRequest(driver, connection, false)
            await helpers.approvePopup(driver, 2, 1, true, {show: false})
            let response = await helpers.getWalletResponse(driver)
            connectionInfo = response;
            
            assert.equal(response.errors, null);
            assert.equal(response.wallets.length, 1);
            assert.equal(response.approvals['testnet'].contractName, connection.contractName);
            assert.equal(response.approvals['testnet'].version, connection.version);
            assert.equal(response.approvals['testnet'].trustedApp, true);
            assert.equal(response.approvals['testnet'].charms.length, 1);
        });
        it('POPUP: Can change linked account', async function() {
            let responseBefore = await helpers.getWalletResponse(driver)
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            connection.charms = dappsInfo.charmsInfo
            connection.background = dappsInfo.background
            await driver.executeScript(`
                document.dispatchEvent( new CustomEvent('changeLinkAccount', {detail: '${JSON.stringify(connection)}'}));
            `);
            await helpers.changeAccountPopup(driver, 2, 1)
            await helpers.sendConnectRequest(driver, connection, false)
            let responseAfter = await helpers.getWalletResponse(driver)

            assert.equal(responseBefore.errors, null);
            assert.equal(responseBefore.wallets.length, 1);
            assert.equal(responseAfter.errors, null);
            assert.equal(responseAfter.wallets.length, 1);
            assert.notEqual(responseBefore.wallets[0], responseAfter.wallets[0]);
        });
    })
})