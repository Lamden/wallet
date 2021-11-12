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

describe('Testing Coin Button', function () {
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

    context('test-setup', function() {
        it('Add a token to wallet, for testing', async function() {
            let token = tokenInfo.token_1_svg
            await tokenHelpers.addToken(driver, token)
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
            await tokenHelpers.validateCoinFromAddress(driver, "2341d744f11658d7f1ca1c514a1b76ff07898435c46402b1e4f8b00d4a13f5f9")
            await tokenHelpers.cancelTransferModal(driver)
            await helpers.sleep(1000)
        });
        it('Render TX UI modal on token details screen', async function() {
            let token = tokenInfo.token_1_svg
            await tokenHelpers.gotoTokenDetails(driver, token)
            await helpers.sleep(500)
            await tokenHelpers.openCoinSendModal(driver)
            await helpers.sleep(500)
            let tokenName = await driver.findElement(By.id("tokeninput")).getText()
            assert.equal(tokenName, "Pooch")
            await tokenHelpers.validateCoinFromAddress(driver, "2341d744f11658d7f1ca1c514a1b76ff07898435c46402b1e4f8b00d4a13f5f9")
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
            let name = "My TAU Address"
            await tokenHelpers.validateCoinNickname(driver, name)
            await tokenHelpers.validateCoinQR(driver)
            await tokenHelpers.validateCoinAddress(driver, "2341d744f11658d7f1ca1c514a1b76ff07898435c46402b1e4f8b00d4a13f5f9")
            await tokenHelpers.closeReceiveModal(driver)
            await helpers.sleep(1000)
        });
        it('Close receive modal', async function() {
            await tokenHelpers.openAccountsScreen(driver)
            await helpers.sleep(500)
            await tokenHelpers.openCoinReceiveModal(driver)
            await helpers.sleep(500)
            await tokenHelpers.closeReceiveModal(driver)
            await helpers.sleep(1000)
            await tokenHelpers.validateCloseReceiveModal(driver)
        });
    })
})