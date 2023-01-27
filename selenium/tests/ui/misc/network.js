const whitelabel = require('../../../../whitelabel.json')

const assert = require('assert');
const {Builder, By, until} = require('selenium-webdriver');
let chrome = require("selenium-webdriver/chrome");
let config = require("../../../config/config")
const helpers = require('../../../helpers/helpers')
let tokenInfo = require("../../../fixtures/tokenInfo.json")
let existingTokenInfo = require("../../../fixtures/existingTokenInfo.json")
const tokenHelpers = require('../../../helpers/helpers-token')
let walletInfo = require("../../../fixtures/walletInfo")
var validators = require('types-validate-assert');
const { timeStamp } = require('console');
const { validateTypes } = validators

let chromeOptions = new chrome.Options();
chromeOptions.addArguments("lang=en-us");
chromeOptions.addArguments(`load-extension=${config.walletPath}`);

const badNetwork = {
    name: 'Bad Network',
    currencySymbol: "badsymbol",
    type: 'devnet',
    host: 'https://www.badnetwork.io',
    blockservice: 'http://165.22.47.195:3535'
}

const goodNetwork = {
    name: 'Good Network',
    currencySymbol: "goodsymbol",
    type: 'devnet',
    host: 'https://masternode-01.lamden.io',
    blockservice: 'http://165.22.47.195:3535'
}

const editNetwork = {
    name: 'Edit Network',
    currencySymbol: "editgoodsymbol",
    type: 'devnet',
    host: 'https://masternode-01.lamden.io',
    blockservice: 'http://165.22.47.195:3535'
}

describe('Testing Manage Network', function () {
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

    context('Manage Network', function() {
        it('Renders ManageNetworkMain.svelte', async function() {
            await helpers.gotoNetwork(driver)
            let title = await driver.findElement(By.css(".current-network h6")).getAttribute('innerText')
            assert.equal(title, 'Manage Networks')
            // switch to add network
            await driver.findElement(By.id('undefined-currently-selected')).click()
            await helpers.sleep(500)
            await driver.findElement(By.id("select-option-5")).click()
        });
        it('Form Valid - Rejects empyty network name', async function() {
            await helpers.sleep(500)
            let element = await driver.findElement(By.id("save"))
            driver.executeScript("arguments[0].click();", element)
            let name = await driver.findElement(By.id("name"))
            let msg = await name.getAttribute('validationMessage')
            assert.equal(msg, 'Please fill out this field.')
        })
        it('Form Valid - Rejects reserved network name', async function() {
            let name = await driver.findElement(By.id("name"))
            await name.sendKeys('Lamden Mainnet\n')
            let msg = await name.getAttribute('validationMessage')
            assert.equal(msg, 'Reserved name cannot be set')

            await name.clear();

            await name.sendKeys('Lamden Testnet\n')
            msg = await name.getAttribute('validationMessage')
            assert.equal(msg, 'Reserved name cannot be set')
        })
        it('Form Valid - Rejects reserved currency symbol name', async function() {
            let symbol = await driver.findElement(By.id("currencySymbol"))
            await symbol.sendKeys('a\n')
            let msg = await symbol.getAttribute('validationMessage')
            assert.equal(msg, 'Minimum 2 characters')
            await symbol.clear()
        })
        it('Form Valid - Rejects reserved currency symbol name', async function() {
            let symbol = await driver.findElement(By.id("currencySymbol"))
            await symbol.sendKeys('tau\n')
            let msg = await symbol.getAttribute('validationMessage')
            assert.equal(msg, 'Currency Symbol can not be tau')

            await symbol.sendKeys('test')
        })
        it('Form Valid - Rejects reserved currency symbol name', async function() {
            await driver.findElement(By.id("save")).click()
            let hostinput = await driver.findElement(By.id("hostlist"))
            let msg1 = await hostinput.getAttribute('validationMessage')
            assert.equal(msg1, 'Required at least one host')

            await hostinput.sendKeys('https://masternode-01.lamden.io')
            await driver.executeScript("arguments[0].blur();", hostinput)
            await driver.findElement(By.css(".add-btn")).click()
            await driver.findElement(By.id("save")).click()
            let msg2 = await driver.findElement(By.id("blockServiceList")).getAttribute('validationMessage')
            //assert.equal(msg2, 'Required at least one block service')
        })
        it('Add A Bad Network - negative', async function() {
            await helpers.clearNetwork(driver);
            await helpers.fillNetworkForm(driver, badNetwork);
            await helpers.sleep(1000);
            await driver.findElement(By.id("save")).click()
            await helpers.sleep(30000);
            let msg = await driver.findElement(By.id("hostlist")).getAttribute('validationMessage')
            assert.equal(msg, 'Cannot contact network')
        })
        it('Add A Good Network', async function() {
            this.timeout(50000)
            await helpers.clearNetwork(driver);
            await helpers.fillNetworkForm(driver, goodNetwork);
            await helpers.sleep(1000);
            await driver.findElement(By.id("save")).click()
            let finishBtn = await driver.wait(until.elementLocated(By.id("finish-btn")), 40000);
            let text = await finishBtn.getAttribute('innerText');
            assert.equal(text, 'FINISH')
            await finishBtn.click()
            await helpers.sleep(1000)
        })
        it('Edit A Network', async function() {
            this.timeout(50000)
            await helpers.gotoNetwork(driver)
            await helpers.sleep(500)
            await driver.findElement(By.id('undefined-currently-selected')).click()
            await helpers.sleep(500)
            await driver.findElement(By.id("select-option-5")).click()
            await helpers.clearNetwork(driver);
            await helpers.fillNetworkForm(driver, editNetwork);
            await helpers.sleep(1000);
            await driver.findElement(By.id("save")).click()
            let finishBtn = await driver.wait(until.elementLocated(By.id("finish-btn")), 40000);
            let text = await finishBtn.getAttribute('innerText');
            assert.equal(text, 'FINISH')
            let title = await driver.findElement(By.css("h6")).getAttribute('innerText');
            assert.equal(title, 'Updated Success')
            await finishBtn.click()
            await helpers.sleep(3000)
            
            // valid result
            let networkname = await driver.findElement(By.css("#nav-network option:nth-child(5)")).getAttribute('innerText')
            assert.equal(networkname, editNetwork.name)
        })
    })
})