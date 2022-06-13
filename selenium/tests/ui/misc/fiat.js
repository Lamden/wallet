const assert = require('assert');
const {Builder, By, until} = require('selenium-webdriver');
let chrome = require("selenium-webdriver/chrome");
let config = require("../../../config/config")
const helpers = require('../../../helpers/helpers')
let walletInfo = require("../../../fixtures/walletInfo")

let chromeOptions = new chrome.Options();
chromeOptions.addArguments("lang=en-us");
chromeOptions.addArguments(`load-extension=${config.walletPath}`);


describe('Testing Manage Network', function () {
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

    context('Testing fiat stuff: Can change currency', function() {
        it('Renders ManageNetworkMain.svelte', async function() {
            await driver.findElement(By.id('nav-fiat-currently-selected')).click()
            await helpers.sleep(500)
            await driver.findElement(By.id("select-option-3")).click()
            await helpers.sleep(500)
            let val = await driver.findElement(By.css(".fiatvalue")).getText()
            assert.ok(val.startsWith("€"))
        })
    })  
})