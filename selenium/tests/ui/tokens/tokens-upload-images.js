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

    context('upload token logos', function() {
        it('Can upload a png to change icon', async function() {
            let token = tokenInfo.token_1_svg
            await tokenHelpers.addToken_ShowDetails(driver, token, 1)
            await helpers.sleep(3000, true)
            await tokenHelpers.uploadImage(driver, tokenImages.pngLogo)
            token.logo = tokenImages.pngLogoBase64
            await tokenHelpers.validateTokenLogo(driver, token, "png")
            await helpers.sleep(1000, true)
            token.logo_type = "png"
            await tokenHelpers.addToken_Save(driver, token)
        });
        it('Can upload an svg to change icon', async function() {
            let token = tokenInfo.token_3_url
            await tokenHelpers.addToken_ShowDetails(driver, token, 1)
            await helpers.sleep(3000, true)
            await tokenHelpers.uploadImage(driver, tokenImages.svgLogo)
            token.logo = tokenImages.svgLogoBase64
            await tokenHelpers.validateTokenLogo(driver, token, "svg")
            await helpers.sleep(1000, true)
            token.logo_type = "svg"
            await tokenHelpers.addToken_Save(driver, token)
        });
        it('Can upload an image and then revert back to contract standard', async function() {
            let token = tokenInfo.token_4_placeholder
            await tokenHelpers.addToken_ShowDetails(driver, token, 1)
            await helpers.sleep(3000, true)
            await tokenHelpers.uploadImage(driver, tokenImages.svgLogo)
            await tokenHelpers.validateTokenLogo(driver, {...token, logo: tokenImages.svgLogoBase64, logo_type: "svg"})
            await tokenHelpers.clearUploadImage(driver)
            await helpers.sleep(500, true)
            await tokenHelpers.validateTokenLogo(driver, token)
            await helpers.sleep(500, true)
            await tokenHelpers.addToken_Save(driver, token)
        });
    })

    context('upload token logos - negative', function() {
        it('Will display size requirements if picture too large', async function() {
            let token = tokenInfo.token_5_svg
            await tokenHelpers.addToken_ShowDetails(driver, token, 1)
            await helpers.sleep(3000, true)
            await tokenHelpers.uploadImage(driver, tokenImages.pngLogoTooLarge)
            await tokenHelpers.validateImageTooLargeError(driver)
            await tokenHelpers.cancelAddTokenModal(driver)
        });
    })
})