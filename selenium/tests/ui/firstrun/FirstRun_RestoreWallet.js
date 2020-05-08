const assert = require('assert');
const path = require('path');
const {Builder, By} = require('selenium-webdriver');
let chrome = require("selenium-webdriver/chrome");
const helpers = require('../../../helpers/helpers')
const config = require("../../../config/config")
const walletInfo = require("../../../fixtures/walletInfo")

let chromeOptions = new chrome.Options();
chromeOptions.addArguments(`load-extension=${config.walletPath}`);

describe('FirstRun_RestoreWallet - Complete First Run Setup', function () {
    let driver;
    before(async function() {
        driver = await new Builder()
                .forBrowser('chrome')
                .setChromeOptions(chromeOptions)
                .build();
        await driver.get(`chrome-extension://${config.walletExtentionID}/app.html`);
    });

    after(() => driver && driver.quit());

    it('Renders FirstRunIntro.svelte', async function() {
        let restoreWallet_Button =  await driver.findElement(By.id('restore-wallet'))
        await restoreWallet_Button.getAttribute('innerText').then(text => {
            assert.equal(text, 'RESTORE A WALLET');
        })
        await driver.findElement(By.id('create-wallet')).getAttribute('innerText').then(text => {
            assert.equal(text, 'CREATE A WALLET');
        })
        await restoreWallet_Button.click();
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
    it('FirstRunCreatePW.svelte - ACCEPTS correct password', async function() {
        await driver.executeScript(`document.getElementById('pwd1').value='${walletInfo.walletPassword}'`);
        await driver.executeScript(`document.getElementById('pwd2').value='${walletInfo.walletPassword}'`);
        await driver.findElement(By.id('save-pwd')).click()
    })
    it('Renders RestoreUpload.svelte', async function() {
        let savePassword_FilePicker =  await driver.findElement(By.id('filePicker'))
        await savePassword_FilePicker.getAttribute('type').then(type => {
            assert.equal(type, 'file');
        })
        let confirmKeystore_Button =  await driver.findElement(By.id('confirm-keystore-btn'))
        await confirmKeystore_Button.getAttribute('innerText').then(text => {
            assert.equal(text, 'CONFIRM KEYSTORE');
        })
    }); 
    it('RestoreUpload.svelte - Can Accept and uploaded keystore file', async function() {
        let confirmKeystore_Button =  await driver.findElement(By.id('confirm-keystore-btn'))
        await confirmKeystore_Button.getAttribute('disabled').then(disabled => {
            assert.equal(disabled, 'true');
        })
        await driver.findElement(By.id('filePicker')).sendKeys(path.join(config.workingDir, walletInfo.keystoreInfo.file))
        await confirmKeystore_Button.getAttribute('disabled').then(disabled => {
            assert.equal(disabled, null);
        })
        await confirmKeystore_Button.click()
        await helpers.sleep(2000)
    }); 
    it('Renders RestorePassword.svelte', async function() {
        await driver.findElement(By.id('pwd-btn')).getAttribute('value').then(value => {
            assert.equal(value, 'Confirm Password');
        })
        await driver.findElement(By.id('last-modified')).getAttribute('innerText').then(text => {
            assert.equal(text.length > 0, true);
        })
        await driver.findElement(By.id('pwd-hint')).getAttribute('innerText').then(text => {
            assert.equal(text, walletInfo.keystoreInfo.hint);
        })
        await driver.findElement(By.id('pwd-input')).getAttribute('value').then(value => {
            assert.equal(value, "");
        })
    });
    it('RestorePassword.svelte - REJECTS blank password', async function() {
        await driver.findElement(By.id('pwd-btn')).click()

        await driver.findElement(By.id('pwd-input')).getAttribute('validationMessage').then(message => {
            assert.equal(message, 'Please fill out this field.');
        })
        await driver.executeScript("document.getElementById('pwd-input').setCustomValidity('')")
        await driver.executeScript("document.getElementById('pwd-input').reportValidity()")
    }); 
    it('RestorePassword.svelte - REJECTS incorrect password', async function() {
        await driver.executeScript("document.getElementById('pwd-input').value='IncorrectPassword'");
        await driver.findElement(By.id('pwd-btn')).click()

        await driver.findElement(By.id('pwd-input')).getAttribute('validationMessage').then(message => {
            assert.equal(message, 'Incorrect KeyStore Password');
        })
        await driver.executeScript("document.getElementById('pwd-input').setCustomValidity('')")
        await driver.executeScript("document.getElementById('pwd-input').reportValidity()")

    }); 
    it('RestorePassword.svelte - ACCEPTS correct password', async function() {
        await driver.executeScript(`document.getElementById('pwd-input').value='${walletInfo.keystoreInfo.password}'`)
        await driver.findElement(By.id('pwd-btn')).click()
    });
    it('Renders RestoreAddWallets.svelte', async function() {
        let restoreWallets_Button =  await driver.findElement(By.id('restore-btn'))
        await restoreWallets_Button.getAttribute('innerText').then(text => {
            assert.equal(text, 'RESTORE WALLETS');
        })
        driver.findElement(By.id('cancel-btn')).getAttribute('innerText').then(text => {
            assert.equal(text, 'CANCEL');
        })
        driver.findElement(By.id('div-address-0')).getAttribute('innerText').then(text => {
            assert.equal(text, walletInfo.keystoreInfo.keys.vk);
        })

    });
    it('RestoreAddWallets.svelte - can check all boxes', async function() {
        await driver.findElement(By.id('chk-all')).click()

        let checkboxes = await driver.findElements(By.xpath("//input[@type='checkbox']"))
        checkboxes.forEach(async checkbox => {
            let isChecked = await checkbox.getAttribute('checked')
            assert.equal(isChecked, 'true');
        })
        await driver.findElement(By.id('restore-btn')).click()
        await helpers.sleep(5000)
    });
    it('Renders RestoreComplete.svelte', async function() {
        let finish_Button =  await driver.findElement(By.id('home-btn'))
        await finish_Button.getAttribute('innerText').then(text => {
            assert.equal(text, 'FINISH');
        })
        await driver.findElement(By.className('name')).getAttribute('innerText').then(text => {
            assert.equal(text, 'Lamden');
        })
        await driver.findElement(By.className('message')).getAttribute('innerText').then(text => {
            assert.equal(text, 'Added My TAU Address to your wallet');
        })

        await finish_Button.click()
        await helpers.sleep(5000)
    });
    it('Renders Coins Main', async function() {
        await driver.findElement(By.className('coinsmain')).then(element => {
            assert.equal(element.constructor.name, 'WebElement');
        })
    });
})