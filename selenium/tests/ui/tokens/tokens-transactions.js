const whitelabel = require('../../../../whitelabel.json')

    const assert = require('assert');
    const {Builder, By, until} = require('selenium-webdriver');
    let chrome = require("selenium-webdriver/chrome");
    let config = require("../../../config/config")
    const helpers = require('../../../helpers/helpers')
    let tokenInfo = require("../../../fixtures/tokenInfo.json")
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
    
        after(() => {
            driver && driver.quit()
        });
    
        context('test-setup', function() {
            it('Add a token to wallet, for testing', async function() {
                let token = tokenInfo.token_1_svg
                await tokenHelpers.addToken(driver, token)
            })
        })

        context('token transfer', function() {
            it('Fills in the appropriate Transaction details for External Account of Simple Transaction UI', async function() {
                let token = tokenInfo.token_1_svg
                await helpers.sleep(500)
                await tokenHelpers.gotoTokenDetails(driver, token)
                await driver.wait(until.elementLocated(By.id('transfer-token-btn')), 10000).click();
                await helpers.sleep(500);
                await driver.wait(until.elementLocated(By.id('external-account-btn')), 10000).click();
                await tokenHelpers.validateSimpleTransacationFormDetails(driver, token, 'transfer')
                await tokenHelpers.cancelTransferModal(driver)
                await helpers.gotoAccountsPage(driver)
            });

            it('Fills in the appropriate Transaction details for My Account of Simple Transaction UI', async function() {
                let token = tokenInfo.token_1_svg
                await helpers.sleep(500)
                let element = driver.findElement(By.className('wrap-second'))
                await driver.executeScript("arguments[0].click();", element)
                await helpers.sleep(500)
                await tokenHelpers.gotoTokenDetails(driver, token)
                await driver.wait(until.elementLocated(By.id('transfer-token-btn')), 5000).click();
                await helpers.sleep(500);
                await driver.wait(until.elementLocated(By.id('my-account-btn')), 5000).click();
                await tokenHelpers.validateSimpleTransacationFormDetails(driver, token)
                await tokenHelpers.cancelTransferModal(driver)
                await helpers.gotoAccountsPage(driver)
            });

            it('Fills in the appropriate Transaction details for Advanced Transaction UI', async function() {
                let token = tokenInfo.token_1_svg
                await helpers.sleep(500)
                await helpers.sleep(500)
                let element = driver.findElement(By.className('wrap-second'))
                await driver.executeScript("arguments[0].click();", element)
                await tokenHelpers.gotoTokenDetails(driver, token)
                await driver.wait(until.elementLocated(By.id('transfer-token-btn')), 5000).click();
                await helpers.sleep(500);
                await driver.wait(until.elementLocated(By.id('advanced')), 5000).click();
                await tokenHelpers.validateTransacationFormDetails(driver, token, 'transfer')
                await tokenHelpers.cancelTransferModal(driver)
                await helpers.sleep(500)
                await helpers.gotoAccountsPage(driver)
            });
            it('Simple Transaction UI: Renders confirm modal if receiving address is not Lamdenkey', async function() {
                const to = 'xxxxxx'
                let token = tokenInfo.token_1_svg
                await helpers.sleep(500)
                let element = driver.findElement(By.className('wrap-second'))
                await driver.executeScript("arguments[0].click();", element)
                await tokenHelpers.gotoTokenDetails(driver, token)
                await driver.wait(until.elementLocated(By.id('transfer-token-btn')), 5000).click();
                await helpers.sleep(4000);
                await driver.wait(until.elementLocated(By.id('amount')), 5000).sendKeys(`1`);
                await driver.wait(until.elementLocated(By.id('receiver-input')), 5000).sendKeys(to);
                await driver.wait(until.elementLocated(By.id('lamden-tx-next-btn')), 5000).click();
                const text = await driver.wait(until.elementLocated(By.css('.notification .msg')), 5000).getText();
                assert.equal(`The receiving address ${to} is not a valid Lamden address. Proceeding could result in a loss of funds. Continue?`, text)
                await tokenHelpers.cancelTransferModal(driver)
                await helpers.gotoAccountsPage(driver)
            });
            it('Advanced Transaction UI: Renders confirm modal if receiving address is not Lamdenkey', async function() {
                const to = 'xxxxxx'
                let token = tokenInfo.token_1_svg
                await helpers.sleep(500)
                let element = driver.findElement(By.className('wrap-second'))
                await driver.executeScript("arguments[0].click();", element)
                await tokenHelpers.gotoTokenDetails(driver, token)
                await driver.wait(until.elementLocated(By.id('transfer-token-btn')), 5000).click();
                await driver.wait(until.elementLocated(By.id('advanced')), 5000).click();
                await helpers.sleep(4000);
                await driver.wait(until.elementLocated(By.id('kwarg-0')), 5000).sendKeys(`1`);
                await driver.wait(until.elementLocated(By.id('kwarg-1')), 5000).sendKeys(to);
                await driver.wait(until.elementLocated(By.id('lamden-tx-next-btn')), 5000).click();
                const text = await driver.wait(until.elementLocated(By.css('.notification .msg')), 5000).getText();
                assert.equal(`The receiving address ${to} is not a valid Lamden address. Proceeding could result in a loss of funds. Continue?`, text)
                await tokenHelpers.cancelTransferModal(driver)
                await helpers.gotoAccountsPage(driver)
            });
        })
    
        context('token approve', function() {
            it('Can send an approve transaction', async function() {
                let token = tokenInfo.token_1_svg
                await helpers.sleep(500)
                let element = driver.findElement(By.className('wrap-second'))
                await driver.executeScript("arguments[0].click();", element)
                await tokenHelpers.gotoTokenDetails(driver, token)
                await driver.wait(until.elementLocated(By.id('approve-token-btn')), 5000).click();
                await tokenHelpers.validateTransacationFormDetails(driver, token, 'approve')
                await tokenHelpers.cancelTransferModal(driver)
                await helpers.sleep(500)
                await helpers.gotoAccountsPage(driver)
            });
        })
    })