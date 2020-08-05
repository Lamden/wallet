const assert = require('assert');
const {Builder, By, until} = require('selenium-webdriver');
let chrome = require("selenium-webdriver/chrome");
const helpers = require('../../../helpers/helpers')
let config = require("../../../config/config")
let walletInfo = require("../../../fixtures/walletInfo.js")
let swapInfo = require("../../../fixtures/swapInfo")

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
        await helpers.changeToTestnet(driver)
        await helpers.sleep(1000)
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
        let continue_Button = await driver.findElement(By.id('continue-btn'))
        await continue_Button.getAttribute('disabled').then(disabled => {
            assert.equal(disabled, null);
        })
        await continue_Button.click()

    });
    it('Renders SwapsSendApproval.svelte', async function() {
        let approval_Button = await driver.findElement(By.id('send-approval-btn'))
        await approval_Button.getAttribute('innerText').then(text => {
            assert.equal(text, 'SEND APPROVAL');
        })
        let amount_Input = await driver.findElement(By.xpath("//input[@type='number']"))
        await amount_Input.clear()
        await amount_Input.sendKeys(swapInfo.swapAmount)
    });
    it('SwapsSendApproval.svelte - Triggers Metamask popup for approval', async function() {
        await driver.findElement(By.id('send-approval-btn')).click()
        await helpers.sleep(3000)
        await helpers.switchWindow(driver, 2) 
        let popupConfim_Button = await driver.wait(until.elementLocated(By.xpath("//button[contains(text(),'Confirm')]")), 10000);
        await popupConfim_Button.click()
    });
    it('SwapsSendApproval.svelte - Waits for metamask to return tx status', async function() {
        await helpers.switchWindow(driver, 0) 
        await driver.wait(until.elementLocated(By.className("circle-checkmark")), 30000);
        let continue_Button = await driver.findElement(By.id('continue-btn'))
        await continue_Button.getAttribute('disabled').then(disabled => {
            assert.equal(disabled, null);
        })
        await continue_Button.click()
    });
    it('Renders SwapsCheckStatus.svelte', async function() {
        await helpers.sleep(3000)
        await driver.wait(until.elementLocated(By.className("button__solid button__green")), 10000);
        let initiate_Button = await driver.findElement(By.id('initiate-btn'))
        await initiate_Button.getAttribute('disabled').then(disabled => {
            assert.equal(disabled, null);
        })
        await initiate_Button.click()
    });
    it('Renders SwapsPerformSwap.svelte', async function() {
        let home_Button = await driver.findElement(By.id('home-btn'))
        await driver.wait(until.elementIsEnabled(home_Button), 30000)
        await home_Button.click()
    });
    it('Vaidate Lamden Balance ', async function() {
        await helpers.sleep(10000)
        await driver.findElement(By.id('refresh-icon')).click()
        await helpers.sleep(5000)
        await driver.findElement(By.className('text-huge')).getAttribute('innerText').then(text => {
            assert.equal(text, `${swapInfo.swapAmount}`);
        })
    });
})