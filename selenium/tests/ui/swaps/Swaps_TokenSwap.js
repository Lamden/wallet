const assert = require('assert');
const fs = require('fs');
const {Builder, By, until} = require('selenium-webdriver');
let chrome = require("selenium-webdriver/chrome");

const userFolder = "Users"
const user = "jeff"
const walletLocation = "Documents/lamden/wallet"
const walletBuildDir = "build"
const metamaskFolder = "Library/Application Support/Google/Chrome/Default/Extensions/nkbihfbeogaeaoehlefnkodbefgpgknn"
const metamaskVersion = "7.7.8_0"
const metamaskBackupPhrase = "slab tomorrow actual evoke cattle churn brick bus toilet intact zoo erase"
const metamaskExtention = `/${userFolder}/${user}/${walletLocation}/${walletBuildDir}`
const walletExtention = `/${userFolder}/${user}/${metamaskFolder}/${metamaskVersion}`

const mmPassword = "Testing0!2"
const walletPassword = "Testing0!2"
const swapDetails = {
    amount: 10
}

let chromeOptions = new chrome.Options();
chromeOptions.addArguments(`load-extension=${walletExtention},${metamaskExtention}`);


const msleep = (n) => {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, n);
  }
  const sleep = (n) => {
    msleep(n*1000);
}

describe('Complete A Lamden Wallet Token Swap', function () {
    let driver;
    before(async function() {
        driver = await new Builder()
                .forBrowser('chrome')
                .setChromeOptions(chromeOptions)
                .build();
        await driver.get('chrome-extension://hiknponkciemeacgombejeookoebjdoe/app.html');
        //await driver.get('chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn/home.html');
    });

    //after(() => driver && driver.quit());

    it('Setup Metamask', async function() {
        sleep(2)
        let winHandles = await driver.getAllWindowHandles()
        await driver.switchTo().window(winHandles[1])
        await driver.findElement(By.tagName("button")).click()
        await driver.findElement(By.xpath("//button[contains(text(),'Import Wallet')]")).click()
        await driver.findElement(By.xpath("//button[contains(text(),'No Thanks')]")).click()
        sleep(1)
        await driver.findElement(By.tagName("textarea")).sendKeys(metamaskBackupPhrase)
        await driver.findElement(By.id("password")).sendKeys(mmPassword)
        await driver.findElement(By.id("confirm-password")).sendKeys(mmPassword)
        await driver.findElement(By.xpath("//div[@role='checkbox']")).click()
        sleep(1)
        await driver.findElement(By.xpath("//button[contains(text(),'Import')]")).click()
        sleep(1)
        await driver.findElement(By.xpath("//button[contains(text(),'All Done')]")).click()
        sleep(1)
        await driver.findElement(By.xpath("//div[@title='Main Ethereum Network']")).click()
        await driver.findElement(By.xpath("//span[contains(text(),'Kovan Test Network')]")).click()
        assert.equal(true, true);
    });

    it('Setup Lamden Wallet firstRun', async function() {
        let winHandles = await driver.getAllWindowHandles()
        await driver.switchTo().window(winHandles[0])        
        await driver.findElement(By.id('create-wallet')).click();
        await driver.executeScript(`document.getElementById('pwd1').value='${walletPassword}'`);
        await driver.executeScript(`document.getElementById('pwd2').value='${walletPassword}'`);
        await driver.findElement(By.id('save-pwd')).click()
        await driver.findElement(By.id('i-understand')).click()
        sleep(5)
        await driver.executeScript(`document.getElementById('pwd-input').value='${walletPassword}'`);
        await driver.findElement(By.id('login-btn')).click()
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
        await driver.findElement(By.xpath("//div[contains(text(),'My Lamden Address')]")).click()
        
        await continue_Button.getAttribute('disabled').then(disabled => assert.equal(disabled, null))
        await continue_Button.click();
    });
    it('Renders SwapsConnectMetamask.svelte', async function() {
        let continue_Button = await driver.findElement(By.id('continue-btn'))
        await continue_Button.getAttribute('disabled').then(disabled => {
            assert.equal(disabled, 'true');
        })
        let check_Button = await driver.findElement(By.id('check-btn'))
        await check_Button.click();
        sleep(3)
        let winHandles = await driver.getAllWindowHandles()
        await driver.switchTo().window(winHandles[2])  
        await driver.findElement(By.xpath("//button[contains(text(),'Connect')]")).click()
        sleep(2)
        await driver.switchTo().window(winHandles[0])
        await continue_Button.getAttribute('disabled').then(disabled => {
            assert.equal(disabled, null);
        })
        await continue_Button.click()

    });
    it('Renders SwapsSendApproval.svelte', async function() {
        await driver.findElement(By.id('continue-btn')).getAttribute('disabled').then(disabled => {
            assert.equal(disabled, 'true');
        })
        let amount_Input = await driver.findElement(By.xpath("//input[@type='number']"))
        await amount_Input.clear()
        await amount_Input.sendKeys(swapDetails.amount)
    });
    it('SwapsSendApproval.svelte - Triggers Metamask popup for approval', async function() {
        await driver.findElement(By.id('send-approval-btn')).click()
        sleep(3)
        let winHandles = await driver.getAllWindowHandles()
        await driver.switchTo().window(winHandles[2])
        let popupConfim_Buttom = await driver.wait(until.elementLocated(By.xpath("//button[contains(text(),'Confirm')]")), 4000);
        await popupConfim_Buttom.click()
    });
    it('SwapsSendApproval.svelte - Waits for metamask to return tx status', async function() {
        let winHandles = await driver.getAllWindowHandles()
        await driver.switchTo().window(winHandles[0])
        await driver.wait(until.elementLocated(By.className("circle-checkmark")), 8000);
        let continue_Button = await driver.findElement(By.id('continue-btn'))
        await continue_Button.getAttribute('disabled').then(disabled => {
            assert.equal(disabled, null);
        })
        await continue_Button.click()
    });
    it('Renders SwapsCheckStatus.svelte', async function() {
        sleep(3)
        await driver.wait(until.elementLocated(By.className("button__solid button__green")), 10000);
        await driver.findElement(By.id('initiate-btn')).click()
    });
    it('Renders SwapsPerformSwap.svelte', async function() {
        let home_Button = await driver.findElement(By.id('home-btn'))
        await driver.wait(until.elementIsEnabled(home_Button), 30000)
        await home_Button.click()
    });
    it('Vaidate Lamden Balance ', async function() {
        sleep(10)
        await driver.findElement(By.className('refresh-icon')).click()
        sleep(5)
        await driver.findElement(By.className('amount flex-column')).getAttribute('innerText').then(text => {
            assert.equal(text, `${swapDetails.amount} dTAU`);
        })
    });
})
