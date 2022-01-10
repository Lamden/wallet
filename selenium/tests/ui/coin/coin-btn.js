const whitelabel = require('../../../../whitelabel.json')

const assert = require('assert');
const {Builder, By, until} = require('selenium-webdriver');
let chrome = require("selenium-webdriver/chrome");
let config = require("../../../config/config")
const helpers = require('../../../helpers/helpers')
const tokenHelpers = require('../../../helpers/helpers-token')
let walletInfo = require("../../../fixtures/walletInfo")
var validators = require('types-validate-assert');
let dappsInfo = require("../../../fixtures/dappsInfo.json")
let tokenInfo = require("../../../fixtures/tokenInfo.json")
const mnemonicWords = require("../../../fixtures/mnemonic.json")

let chromeOptions = new chrome.Options();
chromeOptions.addArguments(`load-extension=${config.walletPath}`);

describe('Testing Coin Button', function () {
    var driver;

    before(async function() {
        httpServer = await helpers.startServer(config.port)
        driver = await new Builder()
                .forBrowser('chrome')
                .setChromeOptions(chromeOptions)
                .build();
        //open tab to wallet
        await driver.get(`chrome-extension://${config.walletExtentionID}/app.html`);
    });

    after(() => {
        return helpers.closeTest(driver, httpServer)
    });

    context('test-setup', function() {
        it('init', async function() {
            await helpers.completeFirstRunSetupRestore(driver, config.workingDir, walletInfo, false, true)
        })
        it('Add a token to wallet, for testing', async function() {
            let token = tokenInfo.token_1_svg
            await tokenHelpers.addToken(driver, token)
        })
        it('Loads Test Website', async function() {
            await driver.executeScript(`window.open('http://localhost:${config.port}','_blank');`);
            await helpers.switchWindow(driver, 1)
            await driver.findElement(By.id('wallet-tests')).then(element => {
                assert.ok(element)
            })
        });
        it('Add a dapp connection, for testing', async function() {
            let connection = helpers.getInstance(dappsInfo.basicConnectionInfo)
            connection.charms = dappsInfo.charmsInfo
            connection.background = dappsInfo.background
            await helpers.sendConnectRequest(driver, connection, false)
            await helpers.approvePopup(driver, 2, 1, true, {show: false})
            await helpers.switchWindow(driver, 0)
        })
    })

    context('coin send button', function() {
        it('Render TX UI modal on accouts page', async function() {
            await tokenHelpers.openAccountsScreen(driver)
            await helpers.sleep(500)
            await tokenHelpers.openCoinSendModal(driver)
            await helpers.sleep(500)
            let name = "dTau"
            await tokenHelpers.validateCoinTokenName(driver, name)
            await tokenHelpers.validateCoinFromAddress(driver, mnemonicWords.vk)
            await tokenHelpers.cancelTransferModal(driver)
            await helpers.sleep(1000)
        });
        it('Render TX UI modal on token details screen', async function() {
            let token = tokenInfo.token_1_svg
            await driver.findElement(By.className("collapse-btn")).click()
            await tokenHelpers.gotoTokenDetails(driver, token)
            await helpers.sleep(500)
            await driver.findElement(By.className("collapse-btn")).click()
            let element = driver.findElement(By.id('send-btn'))
            await driver.executeScript("arguments[0].click();", element)
            //await driver.findElement(By.id('send-btn')).click();
            //await tokenHelpers.openCoinSendModal(driver)
            await helpers.sleep(500)
            let tokenName = await driver.findElement(By.id("tokeninput")).getText()
            assert.equal(tokenName, "Pooch")
            await tokenHelpers.validateCoinFromAddress(driver, mnemonicWords.vk)
            await tokenHelpers.cancelTransferModal(driver)
            await helpers.sleep(1000)
        });
    })

    context('coin receive button', function() {
        it('Render receive modal', async function() {
            await tokenHelpers.openAccountsScreen(driver)
            await helpers.sleep(500)
            await tokenHelpers.openCoinReceiveModal(driver)
            await helpers.sleep(500)
            let name = "My TAU Account"
            await tokenHelpers.validateCoinNickname(driver, name)
            await tokenHelpers.validateCoinQR(driver)
            await tokenHelpers.validateCoinAddress(driver, mnemonicWords.vk)
            await tokenHelpers.closeReceiveModal(driver)
            await helpers.sleep(1000)
        });
        it('Close receive modal', async function() {
            await driver.findElement(By.className("collapse-btn")).click()
            await helpers.sleep(1000)
            await tokenHelpers.openCoinReceiveModal(driver)
            await helpers.sleep(500)
            await tokenHelpers.closeReceiveModal(driver)
            await helpers.sleep(1000)
            await tokenHelpers.validateCloseReceiveModal(driver)
        });
    })

    context('coin connections button', function() {
        it('Render dapp details page', async function() {
            await tokenHelpers.openAccountsScreen(driver)
            await helpers.sleep(1000)
            await driver.wait(until.elementLocated(By.css(".dapps > span:nth-child(1)")), 10000).click();
            await helpers.sleep(500)
            const appname = await driver.findElement(By.css(".current-linked-account > span:nth-child(1)")).getAttribute('innerText');
            assert.equal(appname, dappsInfo.basicConnectionInfo.appName)
        });
    })
})