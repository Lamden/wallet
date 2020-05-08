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
        await helpers.completeFirstRunSetupRestore(driver, config.workingDir, walletInfo, false)
        await driver.findElement(By.className('amount flex-column')).getAttribute('innerText').then(text => {
            if (parseInt(text) < 10) {
                try{
                    throw new Error(`Cannot complete test. Please transfer more dTAU to test wallet '${walletInfo.keystoreInfo.keys.vk}'`)
                }finally{
                    helpers.closeTest();
                }
            }
        })
    });

    after(() => {
        helpers.closeTest(driver, httpServer);
     });

     context('Test Setup', function() {
        it('Load Test Website', async function() {
            await driver.executeScript("window.open('http://localhost:5959','_blank');");
            await helpers.switchWindow(driver, 1)
            assert.equal(true, true)
        });

     })

    context('lamdenWalletGetInfo', function() {
        it('Returns error if wallet is not authorized', async function() {

        });

    })
})