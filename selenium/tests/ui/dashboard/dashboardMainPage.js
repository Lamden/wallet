const assert = require('assert');
const {Builder, By, until} = require('selenium-webdriver');
let chrome = require("selenium-webdriver/chrome");
let config = require("../../../config/config")
const helpers = require('../../../helpers/helpers')
let walletInfo = require("../../../fixtures/walletInfo")

let chromeOptions = new chrome.Options();
chromeOptions.addArguments("lang=en-us");
chromeOptions.addArguments(`load-extension=${config.walletPath}`);


describe('Testing Dashboard', function () {
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

    context('Dashboard Main Page', function() {
        it('Should not render "Network Dashboard" menu item exists for v1 network', async function() {
            try {
                await driver.findElement(By.css('#dashboard .name')).getAttribute("innerText")
            } catch (e) {
                assert.equal(`NoSuchElementError`, e.name)
            }

         })
        it('Renders "Network Dashboard" menu item exists for V2 network', async function() {
           await helpers.changeToTestnetV2(driver)
           let menuText = await driver.findElement(By.css('#dashboard .name')).getAttribute("innerText")
           assert.equal("Network Dashboard", menuText)
        })
    })  

    context('Node list Page', function() {
        it('Should not render "Network Dashboard" menu item exists for v1 network', async function() {
            try {
                await driver.findElement(By.css('#node-lists .name')).getAttribute("innerText")
            } catch (e) {
                assert.equal(`NoSuchElementError`, e.name)
            }

         })
        it('Renders "Network Dashboard" menu item exists for V2 network', async function() {
            await helpers.changeToTestnetV2(driver)
            let menuText = await driver.findElement(By.css('#node-lists .name')).getAttribute("innerText")
            assert.equal("My Nodes", menuText)
         })

        it('Can add a branding node', async function() {
            // switch to My Nodes page
            await driver.findElement(By.id('node-lists')).click()
            await helpers.sleep(500)
            // open add node modal
            await driver.findElement(By.css('#empty-add-btn')).click()
            await helpers.sleep(500)
            await driver.findElement(By.css('#add-brand-new-btn')).click()
            await helpers.sleep(500)
            let input = await driver.findElement(By.id("nickname"))
            let walletName = "node-wallet-for-test"
            await input.sendKeys(`${walletName}\n`)
            await helpers.sleep(500)
            await driver.findElement(By.css('#confirmTx-btn')).click()
            // verify
            await helpers.sleep(1000)
            let text = await driver.findElement(By.id("message-text")).getText()
            assert.equal(`${walletName} Success Created. Please backup the account in time.`, text)
            await helpers.sleep(1000)
            let text1 = await driver.findElement(By.css(".node-list .header-name")).getText()
            assert.equal(`My Unregister Nodes`, text1)
            // back to home
            await driver.findElement(By.css('#home-btn')).click()
        })

        it('Already have an account and can add a new node', async function() {
            // switch to My Nodes page
            await helpers.ignoreBackupModal(driver)
            await helpers.sleep(500)
            await driver.findElement(By.id('node-lists')).click()
            await helpers.sleep(500)
            // open add node modal
            await driver.findElement(By.css('#add-node-btn')).click()
            await helpers.sleep(500)
            await driver.findElement(By.css('#add-brand-new-btn')).click()
            await helpers.sleep(500)
            await driver.findElement(By.css('#already-have-account-btn')).click()
            await helpers.sleep(500)

            await driver.findElement(By.id('nodes-currently-selected')).click()
            await helpers.sleep(500)
            await driver.findElement(By.xpath('//*[@id="select-option-1"]/div[2]')).click()
            await helpers.sleep(500)
            await driver.findElement(By.css('#confirmTx-btn')).click()
            // verify
            await helpers.sleep(1000)
            let text = await driver.findElement(By.id("message-text")).getText()
            assert.equal(`Success Added`, text)
            // back to home
            await driver.findElement(By.css('#home-btn')).click()
        })
    }) 
})