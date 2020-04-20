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

describe('FirstRun_CreateWallet - Complete First Run Setup', function () {
    let driver;
    before(async function() {
        driver = await new Builder()
                .forBrowser('chrome')
                .setChromeOptions(chromeOptions)
                .build();
        await driver.get('chrome-extension://hiknponkciemeacgombejeookoebjdoe/app.html');
    });

    after(() => driver && driver.quit());

    it('Renders FirstRunIntro.svelte', async function() {
        let createWallet_Button =  await driver.findElement(By.id('create-wallet'))
        await createWallet_Button.getAttribute('innerText').then(text => {
            assert.equal(text, 'CREATE A WALLET');
        })
        await driver.findElement(By.id('restore-wallet')).getAttribute('innerText').then(text => {
            assert.equal(text, 'RESTORE A WALLET');
        })
        await createWallet_Button.click();
    });
    
    it('Renders FirstRunCreatePW.svelte', async function() {
        
        let savePassword_Button =  await driver.findElement(By.id('save-pwd'))
        await savePassword_Button.getAttribute('value').then(value => {
            assert.equal(value, 'Save Password');
        })
        let password1_Input = await driver.findElement(By.id('pwd1'))
        await password1_Input.getAttribute('value').then(value => {
            assert.equal(value, "");
        })

        let password2_Input = await driver.findElement(By.id('pwd2'))
        await password2_Input.getAttribute('value').then(value => {
            assert.equal(value, "");
        })
    });

    it('FirstRunCreatePW.svelte - REJECTS unmatched passwords ', async function() {
        await driver.executeScript("document.getElementById('pwd1').value='Testing0!2'");
        await driver.executeScript("document.getElementById('pwd2').value='testing0!2'");
        await driver.findElement(By.id('save-pwd')).click()

        await driver.findElement(By.id('pwd2')).getAttribute('validationMessage').then(message => {
            assert.equal(message, 'Passwords do not match');
        })
        
    })

    it('FirstRunCreatePW.svelte - REJECTS password with not enough characters ', async function() {
        await driver.executeScript("document.getElementById('pwd1').value='Testing0!'");
        await driver.executeScript("document.getElementById('pwd2').value='Testing0!'");
        await driver.findElement(By.id('save-pwd')).click()

        await driver.findElement(By.id('pwd1')).getAttribute('validationMessage').then(message => {
            assert.equal(message, 'Please match the requested format.');
        })
    })

    it('FirstRunCreatePW.svelte - REJECTS password with no lowercase', async function() {
        await driver.executeScript("document.getElementById('pwd1').value='TESTING0!2'");
        await driver.executeScript("document.getElementById('pwd2').value='TESTING0!2'");
        await driver.findElement(By.id('save-pwd')).click()

        await driver.findElement(By.id('pwd1')).getAttribute('validationMessage').then(message => {
            assert.equal(message, 'Please match the requested format.');
        })
    })
    it('FirstRunCreatePW.svelte - REJECTS password with no capital lettter ', async function() {
        await driver.executeScript("document.getElementById('pwd1').value='testing0!2'");
        await driver.executeScript("document.getElementById('pwd2').value='testing0!2'");
        await driver.findElement(By.id('save-pwd')).click()

        await driver.findElement(By.id('pwd1')).getAttribute('validationMessage').then(message => {
            assert.equal(message, 'Please match the requested format.');
        })
    })
    it('FirstRunCreatePW.svelte - REJECTS password with no number', async function() {
        await driver.executeScript("document.getElementById('pwd1').value='TestingPW!'");
        await driver.executeScript("document.getElementById('pwd2').value='TestingPW!'");
        await driver.findElement(By.id('save-pwd')).click()

        await driver.findElement(By.id('pwd1')).getAttribute('validationMessage').then(message => {
            assert.equal(message, 'Please match the requested format.');
        })
    })
    it('FirstRunCreatePW.svelte - REJECTS password with no special character', async function() {
        await driver.executeScript("document.getElementById('pwd1').value='Testing012'");
        await driver.executeScript("document.getElementById('pwd2').value='Testing012'");
        await driver.findElement(By.id('save-pwd')).click()

        await driver.findElement(By.id('pwd1')).getAttribute('validationMessage').then(message => {
            assert.equal(message, 'Please match the requested format.');
        })
    })
    it('FirstRunCreatePW.svelte - ACCEPTS correct password ', async function() {
        await driver.executeScript(`document.getElementById('pwd1').value='${walletPassword}'`);
        await driver.executeScript(`document.getElementById('pwd2').value='${walletPassword}'`);
        await driver.findElement(By.id('save-pwd')).click()
    })

    it('Renders FirstRunTOS.svelte', async function() {
        let iUnderstand_Button =  await driver.findElement(By.id('i-understand'))
        await iUnderstand_Button.getAttribute('innerText').then(text => {
            assert.equal(text, 'I UNDERSTAND');
        })

       await iUnderstand_Button.click()
       sleep(5)
    });

    it('Renders Lockscreen.svelte', async function() {
        await driver.findElement(By.id('login-btn')).getAttribute('value').then(value => {
            assert.equal(value, 'Login');
        })
        await driver.findElement(By.id('pwd-input')).getAttribute('value').then(value => {
            assert.equal(value, "");
        })
    });

    it('Lockscreen.svelte Can Login', async function() {
        await driver.executeScript(`document.getElementById('pwd-input').value='${walletPassword}'`);
        await driver.findElement(By.id('login-btn')).click()
        await driver.findElement(By.className('coinsmain')).then(element => {
            assert.equal(element.constructor.name, 'WebElement');
        })
    });
})
