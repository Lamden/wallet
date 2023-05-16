const assert = require('assert');
const {Builder, By, until } = require('selenium-webdriver');
let chrome = require("selenium-webdriver/chrome");
const helpers = require('../../../helpers/helpers')
let config = require("../../../config/config")
let walletInfo = require("../../../fixtures/walletInfo");

let chromeOptions = new chrome.Options();
chromeOptions.addArguments("lang=en-us");
chromeOptions.addArguments(`load-extension=${config.walletPath}`);

describe('FirstRun_CreateWallet - Complete First Run Setup', function () {
    let driver;
    let mnemonics;
    before(async function() {
        driver = await new Builder()
                .forBrowser('chrome')
                .setChromeOptions(chromeOptions)
                .build();
        await driver.get(`chrome-extension://${config.walletExtentionID}/app.html`);
    });

    after(() => driver && driver.quit());

    it('Renders FirstRunIntro.svelte', async function() {
        await helpers.sleep(2000)
        let createWallet_Button = await driver.wait(until.elementLocated(By.id('create-wallet')), 25000); 
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
        await savePassword_Button.getAttribute('innerText').then(value => {
            assert.equal(value, 'SAVE PASSWORD');
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
        await driver.executeScript(`document.getElementById('pwd1').value='${walletInfo.walletPassword}'`);
        await driver.executeScript(`document.getElementById('pwd2').value='${walletInfo.walletPassword}'`);
        await driver.findElement(By.id('save-pwd')).click()
    })

    it('Renders FirstRunGenMnemonic.svelte', async function() {
        await helpers.sleep(1000)
        let title = await driver.findElement(By.css('.wrap > h6'));
        await title.getAttribute('innerText').then(text => {
            assert.equal(text, 'Copy Your Seed Recovery Phrase')
        })
        let elements = await driver.findElements(By.css('.mnemonic .cell input'))
        assert.equal(elements.length, 24)

        let words = [];
        elements.forEach(element => {
            let value = element.getAttribute("value");
            words.push(value);
        });
        await Promise.all(words).then((res)=>{
            mnemonics = res;;
        })
        await driver.findElement(By.css('.chk-checkmark')).click();
        await driver.findElement(By.id('next')).click();
        await helpers.sleep(5000);
    })

    it('Renders FirstRunVerifyMnemonic.svelte', async function() {
        let title = await driver.findElement(By.css('.flow-page h6'));
        let text = await title.getAttribute('innerText');
        assert.equal(text, 'Verify Seed Recovery Phrase');
        let elements = await driver.findElements(By.css('.mnemonic .cell input'));
        for(let i=0; i<24; i++){
            try {
                await elements[i].sendKeys(`${mnemonics[i]}\n`);
            } catch {
                // tbd
            }
        }
        await driver.findElement(By.id('next')).click();
    })

    it('Renders FirstRunRemember.svelte', async function() {
        await helpers.sleep(1000)
        await driver.findElement(By.css('.chk-checkmark')).click();
        let iUnderstand_Button =  await driver.findElement(By.id('i-understand'))
        await iUnderstand_Button.getAttribute('innerText').then(text => {
            assert.equal(text, 'I UNDERSTAND');
        })
       await iUnderstand_Button.click()
       await helpers.sleep(5000)
       await helpers.lockWallet(driver, 0)
    });

    it('Renders Lockscreen.svelte', async function() {
        await helpers.sleep(1000)
        await driver.findElement(By.id('login-btn')).getAttribute('value').then(value => {
            assert.equal(value, 'Login');
        })
        await driver.findElement(By.id('pwd-input')).getAttribute('value').then(value => {
            assert.equal(value, "");
        })
    });

    it('Lockscreen.svelte Can Login', async function() {
        await driver.executeScript(`document.getElementById('pwd-input').value='${walletInfo.walletPassword}'`);
        await driver.findElement(By.id('login-btn')).click()
        await helpers.sleep(500)
        await driver.findElement(By.className('coinsmain')).then(element => {
            assert.equal(element.constructor.name, 'WebElement');
        })
    });
})
