const assert = require('assert');
const {Builder, By, until} = require('selenium-webdriver');
let chrome = require("selenium-webdriver/chrome");
let config = require("../../config/config")
const helpers = require('../../helpers/helpers')
let walletInfo = require("../../fixtures/walletInfo")
let dappsInfo = require("../../fixtures/dappsInfo.json")

let chromeOptions = new chrome.Options();
chromeOptions.addArguments(`load-extension=${config.walletPath}`);

describe('Content Script - Testing Dapp GetInfo API', function () {
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
        await helpers.completeFirstRunSetup(driver, walletInfo.walletPassword, false)
    });

    after(() => {
        return helpers.closeTest(driver, httpServer)
     });


    it('Loads Test Website', async function() {
        await driver.executeScript(`window.open('http://localhost:${config.port}','_blank');`);
        await helpers.switchWindow(driver, 1)
        await driver.findElement(By.id('wallet-tests')).then(element => {
            assert.ok(element)
        })
    });

    it('Returns error if wallet is not authorized', async function() {
        let response = await helpers.sendGetInfoRequest(driver)
        assert.equal(response.errors.length, 1);
        assert.equal(response.errors[0].includes("You must be an authorized"), true)
    });

    it('Create conenction to test dApp website', async function() {
        let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
        await helpers.sendConnectRequest(driver, connection, false)
        await helpers.approvePopup(driver, 2, 1)
        let response = await helpers.getWalletResponse(driver)
        assert.equal(response.errors, null);
    });

    it('Returns wallet info', async function() {
        let response = await helpers.sendGetInfoRequest(driver)
        console.log(response)
        assert.equal(response.installed, true)
        assert.equal(response.setup, true)
        assert.equal(response.locked, false)
        assert.equal(response.walletVersion.length > 0, true)
        assert.equal(response.wallets.length > 0, true)
        assert.equal(response.approvals[dappsInfo.basicConnectionInfo.networkType].contractName, dappsInfo.basicConnectionInfo.contractName)
    });

    it('Hide info when wallet is locked', async function() {
        await helpers.lockWallet(driver, 1)
        let response = await helpers.sendGetInfoRequest(driver)
        console.log(response)
        assert.equal(response.installed, true)
        assert.equal(response.setup, true)
        assert.equal(response.locked, true)
        assert.equal(response.walletVersion.length > 0, true)
        assert.equal(response.wallets.length === 0, true)
    });   
})