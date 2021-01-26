const whitelabel = require('../../../../whitelabel.json')

const assert = require('assert');
const {Builder, By, until} = require('selenium-webdriver');
let chrome = require("selenium-webdriver/chrome");
let config = require("../../../config/config")
const helpers = require('../../../helpers/helpers')
let tokenInfo = require("../../../fixtures/tokenInfo.json")
const tokenHelpers = require('../../../helpers/helpers-token')
let walletInfo = require("../../../fixtures/walletInfo")
var validators = require('types-validate-assert');
const { validateTypes } = validators

let chromeOptions = new chrome.Options();
chromeOptions.addArguments(`load-extension=${config.walletPath}`);

describe('Testing Token Integration - Add Tokens to Wallet', function () {
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

    context('add tokens', function() {
        it('Can add a token with svg icon from contract', async function() {
            let token = tokenInfo.evil_frosty
            await tokenHelpers.addToken_ShowDetails(driver, token)
            await helpers.sleep(4000)
            await tokenHelpers.validateTokenName(driver, token)
            await tokenHelpers.validateTokenSymbol(driver, token)
            await tokenHelpers.validateTokenLogo(driver, token)
            await tokenHelpers.addToken_Save(driver, token)
        });
        it('Can add a token with png icon from contract', async function() {
            let token = tokenInfo.valentine_token
            await tokenHelpers.addToken_ShowDetails(driver, token)
            await helpers.sleep(4000)
            await tokenHelpers.validateTokenName(driver, token)
            await tokenHelpers.validateTokenSymbol(driver, token)
            await tokenHelpers.validateTokenLogo(driver, token)
            await tokenHelpers.addToken_Save(driver, token)
        });
        it('Can add a token with url icon from contract', async function() {
            let token = tokenInfo.protection
            await tokenHelpers.addToken_ShowDetails(driver, token)
            await helpers.sleep(4000)
            await tokenHelpers.validateTokenName(driver, token)
            await tokenHelpers.validateTokenSymbol(driver, token)
            await tokenHelpers.validateTokenLogo(driver, token)
            token.logo_type = "urlB64"
            await tokenHelpers.addToken_Save(driver, token)
        });
        it('Displays placeholder token icon if no icon found in contract or uploaded', async function() {
            let token = tokenInfo.jeff_token
            await tokenHelpers.addToken_ShowDetails(driver, token)
            await helpers.sleep(4000)
            await tokenHelpers.validateTokenName(driver, token)
            await tokenHelpers.validateTokenSymbol(driver, token)
            await tokenHelpers.validateTokenLogo(driver, token)
            await tokenHelpers.addToken_Save(driver, token)
        });
        it('Can change Token Name from what was taken from contract', async function() {
            let token = tokenInfo.lama_token
            await tokenHelpers.addToken_ShowDetails(driver, token)
            await helpers.sleep(4000)
            token.tokenName = 'Super Token'
            await tokenHelpers.changeTokenName(driver, 'Super Token')
            await tokenHelpers.addToken_Save(driver, token)
        });
        it('Can change Token Symbol from what was taken from contract', async function() {
            let token = tokenInfo.archer_token
            await tokenHelpers.addToken_ShowDetails(driver, token)
            await helpers.sleep(4000)
            token.tokenSymbol = 'SUPER'
            await tokenHelpers.changeTokenSymbol(driver, 'SUPER')
            await tokenHelpers.addToken_Save(driver, token)
        });
    })

    context('add tokens - negative', function() {
        it('Will display error in inputbox if token already added', async function() {
            let token = tokenInfo.evil_frosty
            await tokenHelpers.addToken_ShowDetails(driver, token)
            await helpers.sleep(4000)
            await tokenHelpers.validateInputError(driver, "Token already in Wallet")
            await tokenHelpers.cancelAddTokenModal(driver)
        });
        it('Will display error in inputbox token contract is invalid', async function() {
            let token = tokenInfo.invalid_token_contract
            await tokenHelpers.addToken_ShowDetails(driver, token)
            await helpers.sleep(4000)
            await tokenHelpers.validateInputError(driver, "Invalid Token Contract")
            await tokenHelpers.cancelAddTokenModal(driver)
        });
        it('Add Button disabled if required information no found in token contract', async function() {
            let token = tokenInfo.token_no_values
            await tokenHelpers.addToken_ShowDetails(driver, token)
            await helpers.sleep(4000)
            let addbutton = await driver.findElement(By.id("add-token-btn"))
            assert.equal(await addbutton.isEnabled(), false);
        });
    })
})