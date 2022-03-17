const assert = require('assert');
const {Builder, By, until} = require('selenium-webdriver');
let chrome = require("selenium-webdriver/chrome");
let config = require("../../../config/config")
const helpers = require('../../../helpers/helpers')
let walletInfo = require("../../../fixtures/walletInfo")
var validators = require('types-validate-assert');
const privatekeyInfo = require("../../../fixtures/privatekey.json")

let chromeOptions = new chrome.Options();
chromeOptions.addArguments("lang=en-us");
chromeOptions.addArguments(`load-extension=${config.walletPath}`);

describe('Testing Backup View Account Keys', function () {
    var driver;

    before(async function() {
        driver = await new Builder()
                .forBrowser('chrome')
                .setChromeOptions(chromeOptions)
                .build();
        //open tab to wallet
        await driver.get(`chrome-extension://${config.walletExtentionID}/app.html`);
        await helpers.completeFirstRunSetupRestore(driver, config.workingDir, walletInfo, false, false)
    });

    after(() => driver && driver.quit());

    context('Testing Backup View Account Keys', function() {
        it('Renders BackupIntro.svelte', async function() {
            await helpers.gotoBackup(driver)
            let title = await driver.findElement(By.css('.flow-page h6')).getAttribute('textContent')
            assert.equal(title, 'Backup Lamden Vault');
            let btn1 = await driver.findElement(By.id('view-phrase-btn')).getText()
            let btn2 = await driver.findElement(By.id('backup-legacy-btn')).getText()
            let btn3 = await driver.findElement(By.id('view-keys-btn')).getText()
            let btn4 = await driver.findElement(By.id('back-btn')).getText()
            assert.equal(btn1, 'VIEW RECOVERY PHRASE')
            assert.equal(btn2, 'BACKUP LEGACY ACCOUNTS')
            assert.equal(btn3, 'VIEW ACCOUNT KEYS')
            assert.equal(btn4, 'BACK')
        });
        it('View Account Key Successfully', async function() {
            await driver.findElement(By.id('view-keys-btn')).click()
            await helpers.sleep(1000)
            await driver.findElement(By.css('input[type="password"]')).sendKeys(walletInfo.walletPassword)
            await driver.findElement(By.css('input[type="submit"]')).click()
            await helpers.sleep(2000)
            let text = await driver.findElement(By.css('.flow-page .flex-row  .result-box p.text-secondary')).getText()
            let sk = text.replace('Private Key:', '').trim()
            assert.equal(sk, privatekeyInfo.sk)
        })
    })
})