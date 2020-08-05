const assert = require('assert');
const fs = require('fs');
const {Builder, By, until} = require('selenium-webdriver');
let chrome = require("selenium-webdriver/chrome");
const helpers = require('../../../helpers/helpers')
let config = require("../../../config/config")
let walletInfo = require("../../../fixtures/walletInfo")

let chromeOptions = new chrome.Options();
chromeOptions.addArguments(`load-extension=${config.walletPath},${config.metamaskPath}`);

describe('Token Swap Negative Tests', function () {
    let driver;
    before(async function() {
        driver = await new Builder()
                .forBrowser('chrome')
                .setChromeOptions(chromeOptions)
                .build();
        await driver.get(`chrome-extension://${config.walletExtentionID}/app.html`);
    });

    //after(() => driver && driver.quit());

    it('Setup Metamask', async function() {
        await helpers.sleep(500)
        await helpers.switchWindow(driver, 1) 
        await driver.findElement(By.xpath("//button[contains(text(),'Get Started')]")).click()
        await driver.findElement(By.xpath("//button[contains(text(),'Import wallet')]")).click()
        await driver.findElement(By.xpath("//button[contains(text(),'No Thanks')]")).click()
        await helpers.sleep(1000)
        //await driver.findElement(By.tagName("textarea")).sendKeys(config.metamaskBackupPhrase)
        await driver.findElement(By.xpath("//input[@placeholder='Paste seed phrase from clipboard']")).sendKeys(config.metamaskBackupPhrase)
        await driver.findElement(By.id("password")).sendKeys(config.metamaskPassword)
        await driver.findElement(By.id("confirm-password")).sendKeys(config.metamaskPassword)
        await driver.findElement(By.className("first-time-flow__terms")).click()
        await helpers.sleep(500)
        await driver.findElement(By.xpath("//button[contains(text(),'Import')]")).click()
        await helpers.sleep(500)
        await driver.findElement(By.xpath("//button[contains(text(),'All Done')]")).click()
        await helpers.sleep(500)
        await driver.findElement(By.xpath("//div[@title='Main Ethereum Network']")).click()
        await driver.findElement(By.xpath("//span[contains(text(),'Kovan Test Network')]")).click()
        assert.equal(true, true);
    });

    it('Setup Lamden Wallet firstRun', async function() {
        await helpers.switchWindow(driver, 0)    
        await driver.findElement(By.id('create-wallet')).click();
        await driver.executeScript(`document.getElementById('pwd1').value='${walletInfo.walletPassword}'`);
        await driver.executeScript(`document.getElementById('pwd2').value='${walletInfo.walletPassword}'`);
        await driver.findElement(By.id('save-pwd')).click()
        await driver.findElement(By.id('i-understand')).click()
        await helpers.sleep(5000)
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
    it('Renders SwapsChooseLamden.svelte', async function() {
        let continue_Button = await driver.findElement(By.id('continue-btn'))
        await continue_Button.getAttribute('disabled').then(disabled => {
            assert.equal(disabled, 'true');
        })
        await driver.findElement(By.className('custom-select')).click()
        await driver.findElement(By.xpath("//div[contains(text(),'My Lamden Account')]")).click()
        
        await continue_Button.getAttribute('disabled').then(disabled => assert.equal(disabled, null))
        await continue_Button.click();
    });
    it('Renders SwapsConnectMetamask.svelte', async function() {
        let check_Button = await driver.findElement(By.id('check-btn'))
        await check_Button.getAttribute('innerText').then(text => {
            assert.equal(text, 'CONNECT METAMASK');
        })
    });
    it('Will display error if user rejects the connect popup', async function() {
        await driver.findElement(By.id('check-btn')).click()

        await helpers.sleep(3000)
        await helpers.switchWindow(driver, 2)  
        await driver.findElement(By.xpath("//button[contains(text(),'Cancel')]")).click()
        await helpers.sleep(2000)
        await helpers.switchWindow(driver, 0) 

        await driver.findElement(By.className('error-box')).getAttribute('innerText').then(text => {
            let hasError = text.length > 0
            assert.equal(hasError, true);
        })
        let check_Button = await driver.findElement(By.id('check-btn'))
        await check_Button.getAttribute('disabled').then(disabled => {
            assert.equal(disabled, null);
        })
    });
})