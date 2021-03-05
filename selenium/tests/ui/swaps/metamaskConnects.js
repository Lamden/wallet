const assert = require('assert');
const {Builder, By, until} = require('selenium-webdriver');
let chrome = require("selenium-webdriver/chrome");
const helpers = require('../../../helpers/helpers')
let config = require("../../../config/config")
let walletInfo = require("../../../fixtures/walletInfo.js")

let chromeOptions = new chrome.Options();
chromeOptions.addArguments(`load-extension=${config.walletPath},${config.metamaskPath}`);

describe('Complete A Lamden Wallet Token Swap', function () {
    let driver;
    before(async function() {
        driver = await new Builder()
                .forBrowser('chrome')
                .setChromeOptions(chromeOptions)
                .build();
        await driver.get(`chrome-extension://${config.walletExtentionID}/app.html`);
    });

    after(() => driver && driver.quit());

    it('Setup Metamask', async function() {
        await helpers.setupMetamask(driver, false);
        assert.equal(true, true);
    });

    it('Setup Lamden Wallet firstRun', async function() {
        await helpers.completeFirstRunSetupRestore(driver, config.workingDir, walletInfo, false, false)
        assert.equal(true, true);
    });
    it('Renders Swaps.svelte', async function() {
        await driver.findElement(By.id('token-swap')).click();
        let startSwap_Button = await driver.findElement(By.id('start-swap-btn'))
        await startSwap_Button.getAttribute('innerText').then(text => {
            assert.equal(text, 'START SWAP');
        })
        await startSwap_Button.click()
    });
    it('Renders SwapsDisclaimer_Questions.svelte', async function() {
        let pageID = await driver.findElement(By.id('swap_questions'))
        assert.equal(typeof pageID !== 'undefined', true);
        await driver.findElement(By.id('accept-terms-btn')).getAttribute('disabled').then(disabled => {
            assert.equal(disabled, 'true');
        })
    });
    it('SwapsDisclaimer_Questions: Can navigate all disclaimers ', async function() {
        await helpers.sleep(300, true)
        await driver.executeScript(`document.getElementById('privacy_policy').click()`)
        await helpers.sleep(300, true)
        await driver.executeScript(`document.getElementById('read_and_confirmed').click()`)
        await helpers.sleep(300, true)
        await driver.executeScript(`document.getElementById('yourself_or_company_0').click()`)
        await helpers.sleep(300, true)
        await driver.executeScript(`document.getElementById('domiciled_or_usually_staying_0').click()`)
        await helpers.sleep(300, true)
        await driver.executeScript(`document.getElementById('domiciled_or_usually_staying_1').click()`)
        await helpers.sleep(300, true)
        await driver.executeScript(`document.getElementById('yourself_or_company_1').click()`)
        await helpers.sleep(300, true)
        await driver.executeScript(`document.getElementById('permanent_establishment_in_switzerland_0').click()`)
        await helpers.sleep(300, true)
        await driver.executeScript(`document.getElementById('permanent_establishment_in_switzerland_1').click()`)

        let acceptTermsButton = await driver.findElement(By.id('accept-terms-btn'))
        await acceptTermsButton.getAttribute('disabled').then(async (disabled) => {
            assert.equal(disabled, null);
            await acceptTermsButton.click()
        })

    });
    it('Renders SwapsDisclaimer_TokenExchange.svelte', async function() {
            await driver.wait(until.elementLocated(By.id('swap_exchangeOffer')), 5000)
            await driver.findElement(By.id('proceed-btn')).getAttribute('disabled').then(disabled => {
                assert.equal(disabled, 'true');
            })
            await helpers.sleep(500, true)
    });
    it('SwapsDisclaimer_TokenExchange: Can scroll legal, checkbox and click button ', async function() {
        await driver.executeScript(`document.getElementById('accept-offer-chk').click()`)
        await driver.executeScript(`document.getElementById('exchange_offer').scroll(0,99999)`)
        await helpers.sleep(300, true)
        await driver.executeScript(`document.getElementById('accept-offer-chk').click()`)

        let proceedButton = driver.wait(until.elementLocated(By.id('proceed-btn')), 5000)
        await proceedButton.getAttribute('disabled').then(async (disabled) => {
            assert.equal(disabled, null);
            await proceedButton.click()
        })
        await helpers.sleep(500, true)
    });
    it('Renders SwapsDisclaimer_ExchangeTerms.svelte', async function() {
        let pageID = await driver.findElement(By.id('swap_exchangeTerms'))
        assert.equal(typeof pageID !== 'undefined', true);
        await driver.findElement(By.id('proceed-btn')).getAttribute('disabled').then(disabled => {
            assert.equal(disabled, 'true');
        })
        await helpers.sleep(500, true)
    });
    it('SwapsDisclaimer_ExchangeTerms: Can scroll legal, checkbox and click button ', async function() {
        await driver.executeScript(`document.getElementById('accept-terms-chk').click()`)
        await driver.executeScript(`document.getElementById('exchange_terms').scroll(0,99999)`)
        await helpers.sleep(300, true)
        await driver.executeScript(`document.getElementById('accept-terms-chk').click()`)

        let proceedButton = await driver.findElement(By.id('proceed-btn'))
        await proceedButton.getAttribute('disabled').then(async (disabled) => {
            assert.equal(disabled, null);
            await proceedButton.click()
        })
        await helpers.sleep(500, true)
    });
    it('Renders SwapsChooseLamden.svelte', async function() {
        let continue_Button = driver.wait(until.elementLocated(By.id('continue-btn')), 5000)
        await continue_Button.getAttribute('disabled').then(disabled => {
            assert.equal(disabled, 'true');
        })
        await driver.findElement(By.className('custom-select')).click()
        await driver.findElement(By.xpath(`//div[contains(text(),'My TAU Address')]`)).click()
        
        await continue_Button.getAttribute('disabled').then(disabled => assert.equal(disabled, null))
        await continue_Button.click();
    });
    it('Renders SwapsConnectMetamask.svelte', async function() {
        await helpers.sleep(1000, true)
        let check_Button = await driver.findElement(By.id('check-btn'))
        await check_Button.getAttribute('innerText').then(text => {
            assert.equal(text, 'CONNECT METAMASK');
        })
        await check_Button.click()

        await helpers.sleep(3000)
        await helpers.switchWindow(driver, 2)  
        await driver.wait(until.elementLocated(By.xpath("//button[contains(text(),'Next')]")), 10000).click()
        let popupConfim_Buttom = await driver.wait(until.elementLocated(By.xpath("//button[contains(text(),'Connect')]")), 10000);
        await popupConfim_Buttom.click()
        await helpers.sleep(2000)
        await helpers.switchWindow(driver, 0) 

        let ethAddress = await driver.wait(until.elementLocated(By.id("eth-address")), 20000);
        let address = await ethAddress.getAttribute("text")
        assert.equal(address, config.metamaskAddress);

        let continue_Button = await driver.findElement(By.id('continue-btn'))
        await continue_Button.getAttribute('disabled').then(disabled => {
            assert.equal(disabled, null);
        })
    });
})