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
        await helpers.completeFirstRunSetupRestore(driver, config.workingDir, walletInfo, false, true)
    });

    after(() => driver && driver.quit());

    context('Backup notification', function() {
        it('Renders Backup notification modal when user logs in', async function() {
            await helpers.lockWallet(driver, 0)
            await helpers.unlockWallet(driver, walletInfo.walletPassword, 0)
            let modal = await driver.findElement(By.className("notification"))
            await modal.findElement(By.css("h2")).getAttribute('innerText').then(text => {
                assert.equal(text, 'Your Backup is out of Date');
            })
            await driver.findElement(By.id('backup-btn')).getAttribute('innerText').then(text => {
                assert.equal(text, 'BACKUP');
            })
            await driver.findElement(By.id('help-btn')).getAttribute('innerText').then(text => {
                assert.equal(text, 'HELP');
            })
            await driver.findElement(By.id('ignore-btn')).getAttribute('innerText').then(text => {
                assert.equal(text, 'IGNORE');
            })
        });
        it('Renders Backup notification modal after refreshing page', async function() {
            driver.navigate().refresh()

            let modal = await driver.findElement(By.className("notification"))
            await modal.findElement(By.css("h2")).getAttribute('innerText').then(text => {
                assert.equal(text, 'Your Backup is out of Date');
            })
            await driver.findElement(By.id('backup-btn')).getAttribute('innerText').then(text => {
                assert.equal(text, 'BACKUP');
            })
            await driver.findElement(By.id('help-btn')).getAttribute('innerText').then(text => {
                assert.equal(text, 'HELP');
            })
            await driver.findElement(By.id('ignore-btn')).getAttribute('innerText').then(text => {
                assert.equal(text, 'IGNORE');
            })
        });
    })
})