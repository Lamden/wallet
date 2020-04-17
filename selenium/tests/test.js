// test.js
// Import requirement packages
const assert = require('assert');
const {Builder, Key, By, Capabilities, until} = require('selenium-webdriver');
let chrome = require("selenium-webdriver/chrome");

let chromeOptions = new chrome.Options();
chromeOptions.addArguments("load-extension=/Users/jeff/Documents/lamden/wallet/build");

const msleep = (n) => {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, n);
  }
  const sleep = (n) => {
    msleep(n*1000);
  }

describe('Complete First Run Setup', function () {
    let driver;
    before(async function() {
        driver = await new Builder()
                .forBrowser('chrome')
                .setChromeOptions(chromeOptions)
                .build();
        await driver.get('chrome-extension://hiknponkciemeacgombejeookoebjdoe/app.html');
    });
    // Next, we will write steps for our test. 
    // For the element ID, you can find it by open the browser inspect feature.
    it('Renders FirstRunIntro.svelte', async function() {
        let createWallet_Button =  await driver.findElement(By.id('create-wallet'))
        await createWallet_Button.getAttribute('innerText').then(text => {
            assert.equal(text, 'CREATE A WALLET');
        })
        await driver.findElement(By.id('restore-wallet')).getAttribute('innerText').then(text => {
            assert.equal(text, 'RESTORE A WALLET');
        })

        //Move to Next Screen
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

        await driver.executeScript("document.getElementById('pwd1').value='Testing0!2'");
        await driver.executeScript("document.getElementById('pwd2').value='Testing0!2'");

       await savePassword_Button.click()

    });

    it('Renders FirstRunTOS.svelte', async function() {
        let iUnderstand_Button =  await driver.findElement(By.id('i-understand'))
        await iUnderstand_Button.getAttribute('innerText').then(text => {
            assert.equal(text, 'I UNDERSTAND');
        })

       await iUnderstand_Button.click()
       sleep(5)


    });

    it('Renders Lockscreen', async function() {
        await driver.findElement(By.id('login-btn')).getAttribute('value').then(value => {
            assert.equal(value, 'Login');
        })
        await driver.findElement(By.id('pwd-input')).getAttribute('value').then(value => {
            assert.equal(value, "");
        })
    });

    it('Can Login', async function() {
        await driver.executeScript("document.getElementById('pwd-input').value='Testing0!2'");
        await driver.findElement(By.id('login-btn')).click()
        await driver.findElement(By.className('coinsmain')).then(element => {
            assert.equal(element.constructor.name, 'WebElement');
        })
    });


    // close the browser after running tests
    //after(() => driver && driver.quit());
})