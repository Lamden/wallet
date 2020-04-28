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

const keystoreInfo = {
    keys: {
        vk: '2341d744f11658d7f1ca1c514a1b76ff07898435c46402b1e4f8b00d4a13f5f9',
        sk: 'a57a2c0c7907ec65fddf50302ea4d2e2aa8d66fb2074c5e022052ed695b43d42'
    },
    file: process.cwd() + '/selenium/fixtures/testing.keystore',
    password: "Testing0!234567",
    hint: "testingPW"
}
const walletPassword = "Testing0!2"

describe('FirstRun_RestoreWallet - Complete First Run Setup', function () {
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
        await driver.executeScript(`document.getElementById('pwd1').value='${walletPassword}'`);
        await driver.executeScript(`document.getElementById('pwd2').value='${walletPassword}'`);
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
        await driver.findElement(By.id('filePicker')).sendKeys(keystoreInfo.file)
        await confirmKeystore_Button.getAttribute('disabled').then(disabled => {
            assert.equal(disabled, null);
        })
        await confirmKeystore_Button.click()
        sleep(2)
    }); 
    it('Renders RestorePassword.svelte', async function() {
        await driver.findElement(By.id('pwd-btn')).getAttribute('value').then(value => {
            assert.equal(value, 'Confirm Password');
        })
        await driver.findElement(By.id('last-modified')).getAttribute('innerText').then(text => {
            let includesText = text.includes('Mon Apr 20 2020')
            assert.equal(includesText, true);
        })
        await driver.findElement(By.id('pwd-hint')).getAttribute('innerText').then(text => {
            assert.equal(text, keystoreInfo.hint);
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
        await driver.executeScript(`document.getElementById('pwd-input').value='${keystoreInfo.password}'`)
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
            assert.equal(text, keystoreInfo.keys.vk);
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
        sleep(5)
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