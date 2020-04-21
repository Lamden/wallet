const assert = require('assert');
const {Builder, By} = require('selenium-webdriver');
let chrome = require("selenium-webdriver/chrome");

let chromeOptions = new chrome.Options();
chromeOptions.addArguments("load-extension=/Users/jeff/Documents/lamden/wallet/build");

const msleep = (n) => {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, n);
  }
  const sleep = (n) => {
    msleep(n*1000);
}

const walletPassword = "Testing0!2"

describe('Complete First Run Setup', function () {
    let driver;
    before(async function() {
        driver = await new Builder()
                .forBrowser('chrome')
                .setChromeOptions(chromeOptions)
                .build();
        await driver.get('chrome-extension://hiknponkciemeacgombejeookoebjdoe/app.html');
    });

    //after(() => driver && driver.quit());

    it('FirstRun Setup Completes', async function() {
        await driver.findElement(By.id('create-wallet')).click();
        await driver.executeScript(`document.getElementById('pwd1').value='${walletPassword}'`);
        await driver.executeScript(`document.getElementById('pwd2').value='${walletPassword}'`);
        await driver.findElement(By.id('save-pwd')).click()
        await driver.findElement(By.id('i-understand')).click()
        sleep(5)
        //await driver.executeScript(`document.getElementById('pwd-input').value='${walletPassword}'`);
        //await driver.findElement(By.id('login-btn')).click()
        
    });/*
    it('Renders Swaps.svelte', async function() {
        await driver.findElement(By.id('token-swap')).click();
        await driver.findElement(By.id('start-swap-btn')).getAttribute('innerText').then(text => {
            assert.equal(text, 'START SWAP');
        }).click()
    });
    it('Renders SwapsChooseLamden.svelte', async function() {
        let continue_Button = await driver.findElement(By.id('continue-btn'))
        await continue_Button.getAttribute('disabled').then(disabled => {
            assert.equal(disabled, 'true');
        })
    });*/
})
