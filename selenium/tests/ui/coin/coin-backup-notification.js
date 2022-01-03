const whitelabel = require('../../../../whitelabel.json')

const assert = require('assert');
const {Builder, By, until} = require('selenium-webdriver');
let chrome = require("selenium-webdriver/chrome");
let config = require("../../../config/config")
const helpers = require('../../../helpers/helpers')
const tokenHelpers = require('../../../helpers/helpers-token')
let walletInfo = require("../../../fixtures/walletInfo")
var validators = require('types-validate-assert');
let tokenInfo = require("../../../fixtures/tokenInfo.json")

let chromeOptions = new chrome.Options();
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
    });

    after(() => driver && driver.quit());

    context('Backup notification', function() {
        it('Renders Backup notification right after wallet was restored', async function() {
            await helpers.completeFirstRunSetupRestore(driver, config.workingDir, walletInfo, false, true)
        })
        it('Renders Backup notification right after an account was added', async function() {
            await helpers.addAccount(driver)
        })
        // it('Doesn\'t renders Backup notification right after a tracked account was added', async function() {
        //     let address = "01524fe0e495a059e825fb0970c62ee67236cd3a3658f1a2650313cd960b87cc"
        //     await helpers.addTrackedAccount(driver, address)
        // })
        it('Renders Backup notification modal when user logs in', async function() {
            await helpers.lockWallet(driver, 0)
            await helpers.unlockWallet(driver, walletInfo.walletPassword, 0)
            await helpers.validBackupModal(driver)
        });
        it('Renders Backup notification modal after refreshing page', async function() {
            driver.navigate().refresh()
            await helpers.validBackupModal(driver)
        });
    })
})