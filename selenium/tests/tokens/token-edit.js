const whitelabel = require('../../../whitelabel.json')

const assert = require('assert');
const {Builder, By, until} = require('selenium-webdriver');
let chrome = require("selenium-webdriver/chrome");
let config = require("../../config/config")
const helpers = require('../../helpers/helpers')
let tokenInfo = require("../../fixtures/tokenInfo.json")
let tokenImages = require("../../fixtures/tokenImages")
const tokenHelpers = require('../../helpers/helpers-token')
let walletInfo = require("../../fixtures/walletInfo")
var validators = require('types-validate-assert');
const { validateTypes } = validators

let chromeOptions = new chrome.Options();
chromeOptions.addArguments(`load-extension=${config.walletPath}`);

describe('Testing Token Integration - Upload Logo Images', function () {
    var driver;

    before(async function() {
        driver = await new Builder()
                .forBrowser('chrome')
                .setChromeOptions(chromeOptions)
                .build();
        //open tab to wallet
        await driver.get(`chrome-extension://${config.walletExtentionID}/app.html`);
        await helpers.completeFirstRunSetupRestore(driver, config.workingDir, walletInfo, false)
    });

    after(() => driver && driver.quit());

    context('tokens options', function() {
        it('Will display all information from internal storage', async function() {
            return true;
        });

        it('Will save token name if changed', async function() {
            return true;
        });

        it('Will save token symbol if changed', async function() {
            return true;
        });

        it('Will save token icon if changed to svg', async function() {
            return true;
        });

        it('Will save token icon if changed to png', async function() {
            return true;
        });

        it('Refresh button will refresh changed information back to token contract information ', async function() {
            return true;
        });

        it('Can delete token', async function() {
            return true;
        });
    })

    context('token transfer', function() {
        it('Can send a transfer transaction', async function() {
            return true;
        });
    })

    context('token approve', function() {
        it('Can send an approve transaction', async function() {
            return true;
        });
    })
})