const assert = require('assert');
const {Builder, By, until} = require('selenium-webdriver');
const helpers = require('../../helpers/helpers')
let chrome = require("selenium-webdriver/chrome");
let config = require("../../config/config")
let swapInfo = require("../../fixtures/swapInfo.json")
const ClearingHouse_API = require('../../../src/js/crypto/clearingHouseAPI')

let chromeOptions = new chrome.Options();
chromeOptions.addArguments(`load-extension=${config.walletPath},${config.metamaskPath}`);

describe('Testing Clearinghouse API Handler', function () {
    let driver;
    let CH_API;
    let CH_Response;
    before(async function() {
        driver = await new Builder()
                .forBrowser('chrome')
                .setChromeOptions(chromeOptions)
                .build();
        await driver.get(`chrome-extension://${config.walletExtentionID}/app.html`);
    });

    after(() => driver && driver.quit());

    it('Setup Metamask Extention', async function() {
        await helpers.sleep(500)
        await helpers.switchWindow(driver, 1) 
        await driver.findElement(By.xpath("//button[contains(text(),'Get Started')]")).click()
        await driver.findElement(By.xpath("//button[contains(text(),'Import wallet')]")).click()
        await driver.findElement(By.xpath("//button[contains(text(),'No Thanks')]")).click()
        await helpers.sleep(1000)
        //await driver.findElement(By.tagName("textarea")).sendKeys(config.metamaskBackupPhrase)
        await driver.findElement(By.xpath("//input[@placeholder='Paste seed phrase from clipboard']")).sendKeys(config.metamaskBackupPhrase)
        await driver.findElement(By.id("password")).sendKeys(config.metamaskPassword)
        await driver.findElement(By.id("confirm-password")).sendKeys(config.metamaskPassword)
        await driver.findElement(By.className("first-time-flow__terms")).click()
        await helpers.sleep(500)
        await driver.findElement(By.xpath("//button[contains(text(),'Import')]")).click()
        await helpers.sleep(500)
        await driver.findElement(By.xpath("//button[contains(text(),'All Done')]")).click()
        await helpers.sleep(500)
        await driver.findElement(By.xpath("//div[@title='Main Ethereum Network']")).click()
        await driver.findElement(By.xpath("//span[contains(text(),'Kovan Test Network')]")).click()
        assert.equal(true, true);
    });

    it('Test Setup: Ethereum Script is exposed for testing', async function() {
      await helpers.switchWindow(driver, 0)   
      await driver.executeScript(`
          backpage = chrome.extension.getBackgroundPage(); 
          return backpage.walletEthereum
        `)
        .then(eth => {
          assert.equal(typeof eth !== 'undefined', true);
        })
    });

    it('Test Setup: Approve metamask connection', async function() {
        driver.executeScript(`
            backpage = chrome.extension.getBackgroundPage();
            window.requestAccount2 = backpage.walletEthereum.requestAccount();
          `)
        await helpers.sleep(5000, true)
        await helpers.switchWindow(driver, 2) 
        await driver.wait(until.elementLocated(By.xpath("//button[contains(text(),'Next')]")), 10000).click()
        let popupConfim_Buttom = await driver.wait(until.elementLocated(By.xpath("//button[contains(text(),'Connect')]")), 10000);
        await popupConfim_Buttom.click()
        await helpers.sleep(2000) 
        await helpers.switchWindow(driver, 0) 
        let address = await driver.executeScript(`return await window.requestAccount2;`)
        assert.equal(address, config.metamaskAddress);
      });

    it('Test Setup: Approve Token to transfer', async function() {
        this.timeout(30000);
        await driver.executeScript(`
            backpage = chrome.extension.getBackgroundPage();
            window.txResult = backpage.walletEthereum.sendSwapContractApproval('${config.metamaskAddress}','${swapInfo.swapAmount}')
        `)
        await helpers.sleep(5000, true)
        await helpers.switchWindow(driver, 2) 

        let popupConfim_Button = await driver.wait(until.elementLocated(By.xpath("//button[contains(text(),'Confirm')]")), 10000);
        await popupConfim_Button.click()

        await helpers.sleep(2000) 
        await helpers.switchWindow(driver, 0) 
        console.log('        o WAITING FOR METAMASK TO COMPLETE TX')
        let txInfo = await driver.executeScript(`return await window.txResult;`)
        assert.equal(txInfo.status, true);
    })

    it('clearingHouseAPI.js: Can create a new class instance', function() {
        let error;
        try{
            CH_API = new ClearingHouse_API()
        }catch (e) {
            error = e.message
        }
        assert.equal(error, undefined);
        assert.equal(CH_API.constructor.name, "ClearingHouse_API");
    })

    it('startSwap(): Rejects swapObject paramater with no ethAddress property', async function() {
        let error;
        try{
            await CH_API.startSwap({lamdenAddress: swapInfo.lamdenAddress})
        }catch (e) {
            error = e.message
        }
        assert.equal(error, "Cannot Start Swap: Missing paramater Ethereum Address <string>.");
    })

    it('startSwap(): Rejects swapObject paramater with no lamdenAddress property', async function() {
        let error;
        try{
            await CH_API.startSwap({ethAddress: config.metamaskAddress})
        }catch (e) {
            error = e.message
        }
        assert.equal(error, "Cannot Start Swap: Missing paramater Lamden Address <string>.");
    })
    it('startSwap(): Can pass information correctly to the clearinghouse and return the swap information respose', async function() {
        this.timeout(30000);
        let error;
        let response;
        try{
            response = await CH_API.startSwap({ethAddress: config.metamaskAddress, lamdenAddress: swapInfo.lamdenAddress})
        }catch (e) {
            error = e.message
        }
        assert.equal(error, undefined);
        assert.equal(response.status, "success");
        CH_Response = response
    })
    it('checkSwapStatus(): Rejects if no UUID string provided', async function() {
        let error;
        try{
            await CH_API.checkSwapStatus()
        }catch (e) {
            error = e.message
        }
        assert.equal(error, "Missing paramater UUID <string>.");
    })
    it('checkSwapStatus(): Can fetch and return the status of a swap', async function() {
        this.timeout(120000);
        let swapCompleted = await new Promise((resolve, reject) => {
            let maxTries = 40;
            let tries = 0;
            const getStatus = async () => {
                let error;
                let response;
                try{
                    tries = tries + 1
                    response = await CH_API.checkSwapStatus(CH_Response.uuid_receipt)
                }catch (e) {
                    error = e.message
                }
                assert.equal(error, undefined);
                if (response.status === 'Swap is completed.') resolve(true)
                else {
                    if (tries >= maxTries) resolve(false)
                    else setTimeout(getStatus, 1000)
                }
            }
            getStatus();
        })
        assert.equal(swapCompleted, true);
    })
})