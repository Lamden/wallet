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

describe('Testing Token Integration - Edit Token Info', function () {
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
            let token = tokenInfo.token_1_svg
            await tokenHelpers.addToken(driver, token)
        })
    })

    context('tokens options', function() {
        let frostyToken = JSON.parse(JSON.stringify(tokenInfo.token_1_svg))
        it('Will display all information from internal storage', async function() {
            await tokenHelpers.gotoTokenDetails(driver, frostyToken)
            await tokenHelpers.gotoTokenOptions(driver)
            await tokenHelpers.validateTokenName(driver, frostyToken)
            await tokenHelpers.validateTokenSymbol(driver, frostyToken)
            await tokenHelpers.validateTokenLogo(driver, frostyToken)
            await tokenHelpers.cancelTokenOptionsModal(driver)
            await helpers.gotoAccountsPage(driver)
            await driver.findElement(By.className('wrap-second')).click()
            await helpers.sleep(1000)
        });

        it('Will save token name if changed', async function() {
            await tokenHelpers.gotoTokenDetails(driver, frostyToken)
            await tokenHelpers.gotoTokenOptions(driver)
            await tokenHelpers.validateTokenName(driver, frostyToken)
            frostyToken.tokenName = 'Super Token'
            await tokenHelpers.changeTokenName(driver, 'Super Token')
            await tokenHelpers.saveTokenModal(driver)
            await tokenHelpers.validateTokenOnAccountsScreen(driver, frostyToken)
        });

        it('Will save token symbol if changed', async function() {
            await tokenHelpers.gotoTokenDetails(driver, frostyToken)
            await tokenHelpers.gotoTokenOptions(driver)
            await tokenHelpers.validateTokenSymbol(driver, frostyToken)
            frostyToken.tokenSymbol = 'SUPER'
            await tokenHelpers.changeTokenSymbol(driver, 'SUPER')
            await tokenHelpers.saveTokenModal(driver)
            await tokenHelpers.validateTokenOnAccountsScreen(driver, frostyToken)
        });

        it('Will save token icon if changed to svg', async function() {
            await tokenHelpers.gotoTokenDetails(driver, frostyToken)
            await tokenHelpers.gotoTokenOptions(driver)
            await helpers.sleep(500, true)
            await tokenHelpers.uploadImage(driver, tokenImages.svgLogo)
            frostyToken.logo = tokenImages.svgLogoBase64
            frostyToken.logo_type = "svg"
            await tokenHelpers.validateTokenLogoInBox(driver, frostyToken)
            await tokenHelpers.saveTokenModal(driver)
            await tokenHelpers.validateTokenOnAccountsScreen(driver, frostyToken)
        });

        it('Will save token icon if changed to png', async function() {
            await tokenHelpers.gotoTokenDetails(driver, frostyToken)
            await tokenHelpers.gotoTokenOptions(driver)
            await helpers.sleep(500, true)
            await tokenHelpers.uploadImage(driver, tokenImages.pngLogo)
            frostyToken.logo = tokenImages.pngLogoBase64
            frostyToken.logo_type = "png"
            await tokenHelpers.validateTokenLogoInBox(driver, frostyToken)
            await tokenHelpers.saveTokenModal(driver)
            await tokenHelpers.validateTokenOnAccountsScreen(driver, frostyToken)
        });

        it('Refresh button will refresh changed information back to token contract information ', async function() {
            await tokenHelpers.gotoTokenDetails(driver, frostyToken)
            await tokenHelpers.gotoTokenOptions(driver)
            await helpers.sleep(500, true)
            await tokenHelpers.refreshTokenInfoButton(driver)
            frostyToken = tokenInfo.token_1_svg 
            await tokenHelpers.validateTokenName(driver, frostyToken)
            await tokenHelpers.validateTokenSymbol(driver, frostyToken)
            await tokenHelpers.validateTokenLogo(driver, frostyToken)
            await tokenHelpers.saveTokenModal(driver)
            //await helpers.sleep(500000)
            await tokenHelpers.validateTokenOnAccountsScreen(driver, frostyToken)
        });

        it('Can delete token', async function() {
            await tokenHelpers.gotoTokenDetails(driver, frostyToken)
            await tokenHelpers.gotoTokenOptions(driver)
            await helpers.sleep(500, true)
            await tokenHelpers.deleteToken(driver)
            await tokenHelpers.validateTokenNotOnAccountsScreen(driver, frostyToken)

        });
    })
})