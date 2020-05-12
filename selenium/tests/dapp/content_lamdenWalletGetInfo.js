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

describe('Content Script - Testing Dapp GetInfo API', function () {
    let driver;
    let httpServer;

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
            }).listen(5960)
        });
        await helpers.completeFirstRunSetup(driver, walletInfo.walletPassword, false)
    });

    after(() => {
        driver && driver.quit();
        httpServer.close()
     });

    // context('Test Setup', function() {
        it('Load Test Website', async function() {


            await driver.executeScript("window.open('http://localhost:5959','_blank');");
            await helpers.switchWindow(driver, 1)
            assert.equal(true, true)
        });
     //})

    //context('lamdenWalletGetInfo', function() {
        it('Returns error if wallet is not authorized', async function() {
            let response = await helpers.sendGetInfoRequest(driver)
            assert.equal(response.errors.length, 1);
            assert.equal(response.errors[0], "You must be an authorized dApp to send this message type. Send 'lamdenWalletConnect' event first to authorize.")
    
        });

        it('Create conenction with wallet to our teset dApp website', async function() {
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            await helpers.sendConnectRequest(driver, connection, false)
            await helpers.approvePopup(driver, 2, 1)
            let response = await helpers.getWalletResponse(driver)
            assert.equal(response.errors, null);
        });

        it('Returns wallet info', async function() {
            let response = await helpers.sendGetInfoRequest(driver)
            assert.equal(response.installed, true)
            assert.equal(response.setup, true)
            assert.equal(response.locked, false)
            assert.equal(response.version.length > 0, true)
            assert.equal(response.wallets.length > 0, true)
            assert.equal(response.approvals[dappsInfo.basicConnectionInfo.networkType].contractName, dappsInfo.basicConnectionInfo.contractName)
            assert.equal(response.approvals[dappsInfo.basicConnectionInfo.networkType].approvalHash.length > 0, true)
        });

        it('Hide info when wallet is locked', async function() {
            await helpers.lockWallet(driver, 1)
            let response = await helpers.sendGetInfoRequest(driver)
            assert.equal(response.installed, true)
            assert.equal(response.setup, true)
            assert.equal(response.locked, true)
            assert.equal(response.version.length > 0, true)
            assert.equal(response.wallets.length === 0, true)
        });       
    //})
})