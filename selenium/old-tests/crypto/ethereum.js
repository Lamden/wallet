const assert = require('assert');
const {Builder, By, until} = require('selenium-webdriver');
const helpers = require('../../helpers/helpers')
let chrome = require("selenium-webdriver/chrome");
let config = require("../../config/config")
let swapInfo = require("../../fixtures/swapInfo.json")

let chromeOptions = new chrome.Options();
chromeOptions.addArguments(`load-extension=${config.walletPath},${config.metamaskPath}`);

describe('Testing Lamden Wallet Ethereum Controller', function () {
    let driver;
    let kovanChainInfo;
    before(async function() {
        driver = await new Builder()
                .forBrowser('chrome')
                .setChromeOptions(chromeOptions)
                .build();
        await driver.get(`chrome-extension://${config.walletExtentionID}/app.html`);
    });

    //after(() => {driver && driver.quit()});

    it('Setup Metamask Extention', async function() {
      await helpers.setupMetamask(driver);
      assert.equal(true, true);
    });

    it('Ethereum Script is exposed for testing', async function() {
      await helpers.switchWindow(driver, 0)   
      await driver.executeScript(`
          backpage = chrome.extension.getBackgroundPage(); 
          return backpage.walletEthereum
        `)
        .then(eth => {
          assert.equal(typeof eth !== 'undefined', true);
        })
    });

    it('getWeb3(): Can get get a Web3 instance from MetaMask Inpage Provider', async function() {
      await driver.executeScript(`
          backpage = chrome.extension.getBackgroundPage(); 
          return backpage.walletEthereum.getWeb3().currentProvider.constructor.name;
        `)
        .then(provider => {
          assert.equal(provider, "MetaMaskInpageProvider");
        })
  });

  it('requestAccount(): Can communicate when user rejects connection', async function() {
    driver.executeScript(`
        backpage = chrome.extension.getBackgroundPage();
        window.requestAccount1 = backpage.walletEthereum.requestAccount();
      `)
    await helpers.sleep(5000, true)
    await helpers.switchWindow(driver, 2) 
    let popupConfim_Buttom = await driver.wait(until.elementLocated(By.xpath("//button[contains(text(),'Cancel')]")), 2000);
    await popupConfim_Buttom.click()
    await helpers.sleep(2000) 
    await helpers.switchWindow(driver, 0) 
    let requestResult = await driver.executeScript(`
      return  await window.requestAccount1;
    `)
    assert.equal(requestResult.error.includes('User rejected the request.'), true);
  });
/*
  it('requestAccount(): Returns correct eth Address from metamask on Confirm', async function() {
    driver.executeScript(`
        backpage = chrome.extension.getBackgroundPage();
        window.requestAccount2 = backpage.walletEthereum.requestAccount();
      `)
    await helpers.sleep(5000, true)
    await helpers.switchWindow(driver, 2) 
    await driver.wait(until.elementLocated(By.xpath("//button[contains(text(),'Next')]")), 2000).click()
    let popupConfim_Buttom = await driver.wait(until.elementLocated(By.xpath("//button[contains(text(),'Connect')]")), 2000);
    await popupConfim_Buttom.click()
    await helpers.sleep(2000) 
    await helpers.switchWindow(driver, 0) 
    let address = await driver.executeScript(`
      return await window.requestAccount2;
    `)
    assert.equal(address, config.metamaskAddress);
  });

  it('getChainInfo(): Returns correct chain ID from Metamask', async function() {
    await driver.executeScript(`
      backpage = chrome.extension.getBackgroundPage();
      return await backpage.walletEthereum.getChainInfo();
    `).then(chainInfo => {
      assert.equal(chainInfo.chainID, 42);
      assert.equal(chainInfo.chainName, 'Kovan Network');
      kovanChainInfo = chainInfo
    })
  });

  it('balanceOfToken(): Returns correct token Amount', async function() {
    await driver.executeScript(`
      backpage = chrome.extension.getBackgroundPage();
      return await backpage.walletEthereum.balanceOfToken('${swapInfo.getTokenAmount.address}','${kovanChainInfo.tauContract}');
    `).then(balance => {
      assert.equal(balance.value, swapInfo.getTokenAmount.expectedAmount);
    })
  });

  it('balanceOfToken(): Returns zero balance if invalid eth address is provided', async function() {
    await driver.executeScript(`
      backpage = chrome.extension.getBackgroundPage();
      return await backpage.walletEthereum.balanceOfToken('thisisnotanaddress','${kovanChainInfo.tauContract}');
    `).then(balance => {
      assert.equal(balance.error, 'ETH address is invalid');
    })
  });

  it('balanceOfToken(): Returns zero balance if invalid contract address is provided', async function() {
    await driver.executeScript(`
      backpage = chrome.extension.getBackgroundPage();
      return await backpage.walletEthereum.balanceOfToken('${swapInfo.getTokenAmount.address}','thisisnotanaddress');
    `).then(balance => {
      assert.equal(balance.error, 'Not an ERC20 contract address');
    })
  });
  
  it('balanceOfTAU(): Returns correct dTAU balance', async function() {
    await driver.executeScript(`
      backpage = chrome.extension.getBackgroundPage();
      return await backpage.walletEthereum.balanceOfTAU('${swapInfo.getTokenAmount.address}');
    `).then(balance => {
      assert.equal(balance.value, swapInfo.getTokenAmount.expectedAmount);
    })
  });

  it('balanceOfToken(): Returns an error if ETH address is invalid', async function() {
    await driver.executeScript(`
      backpage = chrome.extension.getBackgroundPage();
      return await backpage.walletEthereum.balanceOfTAU('thisisnotanaddress');
    `).then(balance => {
      assert.equal(balance.error, 'ETH address is invalid');
    })
  });

  it('checkTxStatus(): Can lookup a txHash and report it is successful', async function() {
    await driver.executeScript(`
      backpage = chrome.extension.getBackgroundPage();
      return await backpage.walletEthereum.checkTxStatus('${swapInfo.checkTxStatus.successfulTx}');
    `).then(txInfo => {
      assert.equal(txInfo.status, true);
    })
  });

  it('checkTxStatus(): Can lookup a txHash and report it failed', async function() {
    await driver.executeScript(`
      backpage = chrome.extension.getBackgroundPage();
      return await backpage.walletEthereum.checkTxStatus('${swapInfo.checkTxStatus.failedTx}');
    `).then(txInfo => {
      assert.equal(txInfo.status, false);
    })
  });

  it('checkTxStatus(): Sends error message if txhash is not found', async function() {
    await driver.executeScript(`
      backpage = chrome.extension.getBackgroundPage();
      return await backpage.walletEthereum.checkTxStatus('notatxhash');
    `).then(txInfo => {
      assert.equal(txInfo.error, 'TxHash not found');
    })
  });

  it('sendSwapContractApproval(): Can detect when the user closes the popup', async function() {
    this.timeout(30000);

    await driver.executeScript(' \
        backpage = chrome.extension.getBackgroundPage(); \
        console.log(backpage); \
        window.txResult = backpage.walletEthereum.sendSwapContractApproval("' + config.metamaskAddress + '", "'+swapInfo.swapAmount+'");')

    await helpers.sleep(5000, true)
    await helpers.switchWindow(driver, 2) 

    let popupConfim_Button = await driver.wait(until.elementLocated(By.xpath("//button[contains(text(),'Reject')]")), 10000);
    await popupConfim_Button.click()

    await helpers.sleep(2000) 
    await helpers.switchWindow(driver, 0) 

    let txInfo = await driver.executeScript(`
      console.log(await window.txResult);
      return await window.txResult;
    `)
    assert.equal(txInfo.error.includes('User denied transaction signature'), true);
  });

  it('sendSwapContractApproval(): Sends an allowance transaction', async function() {
    this.timeout(30000);
    await driver.executeScript('\
        backpage = chrome.extension.getBackgroundPage();\
        window.txResult = backpage.walletEthereum.sendSwapContractApproval("' + config.metamaskAddress + '", "' + swapInfo.swapAmount + '")')
    await helpers.sleep(5000, true)
    await helpers.switchWindow(driver, 2) 

    let popupConfim_Button = await driver.wait(until.elementLocated(By.xpath("//button[contains(text(),'Confirm')]")), 10000);
    await popupConfim_Button.click()

    await helpers.sleep(2000) 
    await helpers.switchWindow(driver, 0) 
    console.log('        o WAITING FOR METAMASK TO COMPLETE TX')
    let txInfo = await driver.executeScript(`
      return await window.txResult;
    `)
    assert.equal(txInfo.status, true);
  })

  it('sendSwapContractTx(): Sends a swap contract transaction', async function() {
    this.timeout(30000);
    let script = '\
    backpage = chrome.extension.getBackgroundPage();\
    window.txResult = backpage.walletEthereum.sendSwapContractTx(\
    "'  + config.metamaskAddress + '", "' + swapInfo.swapAmount + '", "' + swapInfo.lamdenAddress + '")'
    await driver.executeScript(script)
    await helpers.sleep(5000, true)
    await helpers.switchWindow(driver, 2) 

    let popupConfim_Button = await driver.wait(until.elementLocated(By.xpath("//button[contains(text(),'Confirm')]")), 10000);
    await popupConfim_Button.click()

    await helpers.sleep(2000) 
    await helpers.switchWindow(driver, 0) 
    console.log('        o WAITING FOR METAMASK TO COMPLETE TX')
    let txInfo = await driver.executeScript(`
      return await window.txResult;
    `)
    assert.equal(txInfo.status, true);
  })*/
})