const assert = require('assert');
const path = require('path');
const {Builder, By} = require('selenium-webdriver');
let chrome = require("selenium-webdriver/chrome");
const helpers = require('../../../helpers/helpers')
const config = require("../../../config/config")
const walletInfo = require("../../../fixtures/walletInfo")
const mnemonicWords = require("../../../fixtures/mnemonic.json")

let chromeOptions = new chrome.Options();
chromeOptions.addArguments("lang=en-us");
chromeOptions.addArguments(`load-extension=${config.walletPath}`);

describe('FirstRun_RestoreWallet - Complete First Run Setup from mnemonic words', function () {
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

    it('FirstRunCreatePW.svelte - ACCEPTS correct password', async function() {
        await driver.executeScript(`document.getElementById('pwd1').value='${walletInfo.walletPassword}'`);
        await driver.executeScript(`document.getElementById('pwd2').value='${walletInfo.walletPassword}'`);
        await driver.findElement(By.id('save-pwd')).click()
    })

    it('Renders RestoreOptions.svelte', async function() {
        await helpers.sleep(1000)
        let title = await driver.findElement(By.css('.flow-page h6'));
        let text = await title.getAttribute('innerText');
        assert.equal(text, 'Restore Accounts');
        // renders mnemonic
        let elements = await driver.findElements(By.css('.mnemonic .cell input'));
        assert.equal(elements.length, 24);

        // renders keystroe upload
        await driver.findElement(By.id('restore-options-currently-selected')).click()
        await helpers.sleep(500, true)
        await driver.findElement((By.xpath('//*[@id="select-option-1"]'))).click()
        let savePassword_FilePicker =  await driver.findElement(By.id('filePicker'))
        await savePassword_FilePicker.getAttribute('type').then(type => {
            assert.equal(type, 'file');
        })

        // renders private key
        await driver.findElement(By.id('restore-options-currently-selected')).click()
        await helpers.sleep(500, true)
        await driver.findElement(By.xpath('//*[@id="select-option-2"]')).click()
        let label = await driver.findElement(By.css('.inputbox-label')).getAttribute('innerText');
        assert.equal(label, 'Private Key');
    })
    it('RestoreOptions.svelte - Can Restore from Mnemonic word', async function() {
        await driver.findElement(By.id('restore-options-currently-selected')).click()
        await helpers.sleep(500, true)
        await driver.findElement(By.xpath('//*[@id="select-option-0"]')).click()

        let words = mnemonicWords.mnemonic.split(' ');
        let elements = await driver.findElements(By.css('.mnemonic .cell input'));
        for(let i=0; i<24; i++){
            await elements[i].sendKeys(`${words[i]}\n`);
        }

        await driver.findElement(By.id('next')).click();
        await helpers.sleep(2000)
    }); 
    it('Renders RestoreAddWallets.svelte', async function() {
        let restoreWallets_Button =  await driver.findElement(By.id('restore-btn'))
        await restoreWallets_Button.getAttribute('innerText').then(text => {
            assert.equal(text, 'RESTORE ACCOUNTS');
        })
        await driver.findElement(By.id('back-btn')).getAttribute('innerText').then(text => {
            assert.equal(text, 'BACK');
        })
        await driver.findElement(By.id('div-address-0')).getAttribute('innerText').then(text => {
            assert.equal(text, mnemonicWords.vk);
        })

    });
    it('RestoreAddWallets.svelte - can check all boxes', async function() {
        await driver.executeScript(`document.getElementById('chk-all').innerText='testing'`)
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
        await driver.findElement(By.className('message')).getAttribute('innerText').then(text => {
            assert.equal(text, 'Added My TAU Account to your Lamden Vault');
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