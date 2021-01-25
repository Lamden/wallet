const whitelabel = require('../../../whitelabel.json')

    const assert = require('assert');
    const {Builder, By, until} = require('selenium-webdriver');
    let chrome = require("selenium-webdriver/chrome");
    let config = require("../../../config/config")
    const helpers = require('../../../helpers/helpers')
    let tokenInfo = require("../../fixtures/tokenInfo.json")
    let tokenImages = require("../../../fixtures/tokenImages")
    const tokenHelpers = require('../../../helpers/helpers-token')
    let walletInfo = require("../../../fixtures/walletInfo")
    var validators = require('types-validate-assert');
    const { validateTypes } = validators
    
    let chromeOptions = new chrome.Options();
    chromeOptions.addArguments(`load-extension=${config.walletPath}`);
    
    describe('Testing Token Integration - Transfer into autofill', function () {
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
    
        context('test-setup', function() {
            it('Add a token to wallet, for testing', async function() {
                let token = tokenInfo.evil_frosty
                await tokenHelpers.addToken(driver, token)
            })
        })

        context('token transfer', function() {
            it('Fills in the appropriate Transaction details', async function() {
                let token = tokenInfo.evil_frosty
                await tokenHelpers.gotoTokenDetails(driver, token)
                await driver.wait(until.elementLocated(By.id('transfer-token-btn')), 5000).click();
                await tokenHelpers.validateTransacationFormDetails(driver, token, 'transfer')
                await tokenHelpers.cancelTransferModal(driver)
                await helpers.gotoAccountsPage(driver)
            });
        })
    
        context('token approve', function() {
            it('Can send an approve transaction', async function() {
                let token = tokenInfo.evil_frosty
                await tokenHelpers.gotoTokenDetails(driver, token)
                await driver.wait(until.elementLocated(By.id('approve-token-btn')), 5000).click();
                await tokenHelpers.validateTransacationFormDetails(driver, token, 'approve')
                await tokenHelpers.cancelTransferModal(driver)
                await helpers.gotoAccountsPage(driver)
            });
        })
    })