const assert = require('assert');
const {Builder, By, until} = require('selenium-webdriver');
const helpers = require('../../helpers/helpers')
let chrome = require("selenium-webdriver/chrome");
let config = require("../../config/config")
let swapInfo = require("../../fixtures/swapInfo.json")
const ClearingHouse_API = require('../../../src/js/crypto/clearingHouseAPI')

let chromeOptions = new chrome.Options();
chromeOptions.addArguments(`load-extension=${config.walletPath},${config.metamaskPath}`);

/*********************
MUST BE RUNNING CLearingHouse2 server locally!
*/

describe('Testing Clearinghouse API Handler', function () {
    let driver;
    let CH_API;
    before(async function() {
        driver = await new Builder()
                .forBrowser('chrome')
                .setChromeOptions(chromeOptions)
                .build();
        await driver.get(`chrome-extension://${config.walletExtentionID}/app.html`);
    });

    after(() => driver && driver.quit());
/*
    it('Setup Metamask Extention', async function() {
        await helpers.setupMetamask(driver);
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
*/
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

    it('startSwap(): Rejects swapObject paramater with no tx property.', async function() {
        let error;
        try{
            await CH_API.startSwap({answers: [1,2,3]})
        }catch (e) {
            error = e.message
        }
        assert.equal(error, "Cannot Start Swap: Missing paramater Ethereum Tx Hash <string>.");
    })

    it('startSwap(): Rejects swapObject paramater with no answers property.', async function() {
        let error;
        try{
            await CH_API.startSwap({tx: "eth_tx_hahsh"})
        }catch (e) {
            error = e.message
        }
        assert.equal(error, "Cannot Start Swap: Missing paramater Answers <array>.");
    })
    it('startSwap(): Can pass information correctly to the clearinghouse and return the swap information respose', async function() {
        this.timeout(30000);
        let error;
        let response;
        try{
            response = await CH_API.startSwap({tx: "etx_tx_hash", answers: [1,2,3]})
        }catch (e) {
            error = e.message
        }
        assert.equal(typeof response.error !== 'undefined', true);
    })
})