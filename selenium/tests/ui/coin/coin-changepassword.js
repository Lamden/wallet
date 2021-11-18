const whitelabel = require('../../../../whitelabel.json')

const assert = require('assert');
const {Builder, By, until} = require('selenium-webdriver');
let chrome = require("selenium-webdriver/chrome");
let config = require("../../../config/config")
const helpers = require('../../../helpers/helpers')
const tokenHelpers = require('../../../helpers/helpers-token')
let walletInfo = require("../../../fixtures/walletInfo");
const { element, element_is } = require('svelte/internal');

let chromeOptions = new chrome.Options();
chromeOptions.addArguments("lang=en-us");
chromeOptions.addArguments(`load-extension=${config.walletPath}`);

describe('Testing Backup', function () {
    var driver;

    before(async function() {
        driver = await new Builder()
                .forBrowser('chrome')
                .setChromeOptions(chromeOptions)
                .build();
        //open tab to wallet
        await driver.get(`chrome-extension://${config.walletExtentionID}/app.html`);
        await helpers.completeFirstRunSetupRestore(driver, config.workingDir, walletInfo, false, true)
    });

    after(() => driver && driver.quit());

    context('Test change password', function() {
        it('Change password', async function() {
            let oldpw = walletInfo.walletPassword
            let newpd = walletInfo.walletPassword + "123"
            let confirmpd = walletInfo.walletPassword + "123"
            await helpers.changePassword(driver, oldpw, newpd, confirmpd)
            await helpers.sleep(2000)
            await driver.findElement(By.id('change-done-btn')).click()
            let elements = await driver.findElements(By.id('login-btn'))
            assert.equal(1, elements.length)
        });
        it('Will display error if the old password is error', async function() {
            let oldpw = walletInfo.walletPassword + "error"
            let newpd = walletInfo.walletPassword + "123"
            let confirmpd = walletInfo.walletPassword + "123"
            await helpers.unlockWallet(driver, walletInfo.walletPassword + "123", 0)
            await helpers.ignoreBackupModal(driver)
            await helpers.changePassword(driver, oldpw, newpd, confirmpd)
            await helpers.sleep(2000)
            let validationMessage = await driver.findElement(By.id("pwd1-input")).getAttribute("validationMessage")
            assert.equal("Incorrect Password", validationMessage)
        });
    })
})