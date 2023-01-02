const assert = require('assert');
const {Builder, By, until} = require('selenium-webdriver');
let chrome = require("selenium-webdriver/chrome");
let config = require("../../../config/config")
const helpers = require('../../../helpers/helpers')
let walletInfo = require("../../../fixtures/walletInfo")

let chromeOptions = new chrome.Options();
chromeOptions.addArguments("lang=en-us");
chromeOptions.addArguments(`load-extension=${config.walletPath}`);


describe('Testing Dashboard', function () {
    var driver;

    before(async function() {
        driver = await new Builder()
                .forBrowser('chrome')
                .setChromeOptions(chromeOptions)
                .build();
        //open tab to wallet
        await driver.get(`chrome-extension://${config.walletExtentionID}/app.html`);
        await helpers.completeFirstRunSetupRestore(driver, config.workingDir, walletInfo, false, false)
    });

    after(() => driver && driver.quit());

    context('Dashboard Main Page', function() {
        it('Should not render "Network Dashboard" menu item exists for v1 network', async function() {
            try {
                await driver.findElement(By.css('#dashboard .name')).getAttribute("innerText")
            } catch (e) {
                assert.equal(`NoSuchElementError`, e.name)
            }

         })
        it('Renders "Network Dashboard" menu item exists for V2 network', async function() {
           await helpers.changeToTestnetV2(driver)
           let menuText = await driver.findElement(By.css('#dashboard .name')).getAttribute("innerText")
           assert.equal("Network Dashboard", menuText)
        })
        it('Renders "Network Dashboard" menu item exists for V2 network', async function() {
            await helpers.changeToTestnetV2(driver)
            let menuText = await driver.findElement(By.css('#dashboard .name')).getAttribute("innerText")
            assert.equal("Network Dashboard", menuText)
         })
    })  

    context('Node list Page', function() {
        it('Should not render "Network Dashboard" menu item exists for v1 network', async function() {
            try {
                await driver.findElement(By.css('#node-lists .name')).getAttribute("innerText")
            } catch (e) {
                assert.equal(`NoSuchElementError`, e.name)
            }

         })
        it('Renders "Network Dashboard" menu item exists for V2 network', async function() {
            await helpers.changeToTestnetV2(driver)
            let menuText = await driver.findElement(By.css('#node-lists .name')).getAttribute("innerText")
            assert.equal("My Nodes", menuText)
         })
    }) 
})