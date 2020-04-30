const assert = require('assert');
const fs = require('fs');
const {Builder, By, until} = require('selenium-webdriver');
let chrome = require("selenium-webdriver/chrome");

const userFolder = "Users"
const user = "jeff"
const walletLocation = "Documents/lamden/wallet"
const walletBuildDir = "build"
const metamaskFolder = "Library/Application Support/Google/Chrome/Default/Extensions/nkbihfbeogaeaoehlefnkodbefgpgknn"
const metamaskVersion = "7.7.8_0"
const metamaskBackupPhrase = "slab tomorrow actual evoke cattle churn brick bus toilet intact zoo erase"
const metamaskExtention = `/${userFolder}/${user}/${walletLocation}/${walletBuildDir}`
const walletExtention = `/${userFolder}/${user}/${metamaskFolder}/${metamaskVersion}`

const mmPassword = "Testing0!2"
const walletPassword = "Testing0!2"
const swapDetails = {
    amount: 10,
    ethAddress: "0x00eB12f5C96B15001bf8f32bEEd970d178719AcC"
}
const getTokenAmountTesting ={
  address: "0x20b367e6EdeC9A06E14CDad7F8B31fCdE5Dada9D",
  expectedEmount: 100.55
}
const checkTxStatusTesting = {
  successfulTx: "0x126bd4480168b40e3e9a19a32b9eec0fb2c4e7696974d2c27db8850971ad6b3e",
  failedTx: "0xb23d37386a995802a8e01fa50df960d405d69e0abf4da9fc38e5a7f67b3f70de",
}

let chromeOptions = new chrome.Options();
chromeOptions.addArguments(`load-extension=${walletExtention},${metamaskExtention}`);


const msleep = (n) => {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, n);
  }
  const sleep = (n) => {
    msleep(n*1000);
}

describe('Testing Lamden Wallet Ethereum Controller', function () {
    let driver;
    let kovanChainInfo;
    before(async function() {
        driver = await new Builder()
                .forBrowser('chrome')
                .setChromeOptions(chromeOptions)
                .build();
        await driver.get('chrome-extension://hiknponkciemeacgombejeookoebjdoe/app.html');
    });

    //after(() => driver && driver.quit());

    it('Setup Metamask Extention', async function() {
        sleep(2)
        let winHandles = await driver.getAllWindowHandles()
        await driver.switchTo().window(winHandles[1])
        await driver.findElement(By.tagName("button")).click()
        await driver.findElement(By.xpath("//button[contains(text(),'Import Wallet')]")).click()
        await driver.findElement(By.xpath("//button[contains(text(),'No Thanks')]")).click()
        sleep(1)
        await driver.findElement(By.tagName("textarea")).sendKeys(metamaskBackupPhrase)
        await driver.findElement(By.id("password")).sendKeys(mmPassword)
        await driver.findElement(By.id("confirm-password")).sendKeys(mmPassword)
        await driver.findElement(By.xpath("//div[@role='checkbox']")).click()
        sleep(1)
        await driver.findElement(By.xpath("//button[contains(text(),'Import')]")).click()
        sleep(1)
        await driver.findElement(By.xpath("//button[contains(text(),'All Done')]")).click()
        sleep(1)
        await driver.findElement(By.xpath("//div[@title='Main Ethereum Network']")).click()
        await driver.findElement(By.xpath("//span[contains(text(),'Kovan Test Network')]")).click()
        assert.equal(true, true);
    });

    it('Ethereum Script is exposed for testing', async function() {
        let winHandles = await driver.getAllWindowHandles()
        await driver.switchTo().window(winHandles[0])    
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
          assert.equal(provider, "MetamaskInpageProvider");
        })
  });

  it('requestAccount(): Can communicate when user rejects connection', async function() {
    driver.executeScript(`
        backpage = chrome.extension.getBackgroundPage();
        window.requestAccount1 = backpage.walletEthereum.requestAccount();
      `)
    await new Promise((resolve, reject) => {
      setTimeout(() => resolve(true), 5000) // resolve
    });
    let winHandles = await driver.getAllWindowHandles()
    await driver.switchTo().window(winHandles[2])
    let popupConfim_Buttom = await driver.wait(until.elementLocated(By.xpath("//button[contains(text(),'Cancel')]")), 10000);
    await popupConfim_Buttom.click()
    sleep(2)
    winHandles = await driver.getAllWindowHandles()
    await driver.switchTo().window(winHandles[0])
    let requestResult = await driver.executeScript(`
      return await window.requestAccount1;
    `)
    assert.equal(requestResult.error.includes('User denied account authorization'), true);
  });

  it('requestAccount(): Returns correct eth Address from metamask on Confirm', async function() {
    driver.executeScript(`
        backpage = chrome.extension.getBackgroundPage();
        window.requestAccount2 = backpage.walletEthereum.requestAccount();
      `)
    await new Promise((resolve, reject) => {
      setTimeout(() => resolve(true), 5000) // resolve
    });
    let winHandles = await driver.getAllWindowHandles()
    await driver.switchTo().window(winHandles[2])
    let popupConfim_Buttom = await driver.wait(until.elementLocated(By.xpath("//button[contains(text(),'Connect')]")), 10000);
    await popupConfim_Buttom.click()
    sleep(2)
    winHandles = await driver.getAllWindowHandles()
    await driver.switchTo().window(winHandles[0])  
    let address = await driver.executeScript(`
      return await window.requestAccount2;
    `)
    assert.equal(address, swapDetails.ethAddress);
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
      return await backpage.walletEthereum.balanceOfToken('${getTokenAmountTesting.address}','${kovanChainInfo.tauContract}');
    `).then(balance => {
      assert.equal(balance.value, getTokenAmountTesting.expectedEmount);
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
      return await backpage.walletEthereum.balanceOfToken('${getTokenAmountTesting.address}','thisisnotanaddress');
    `).then(balance => {
      assert.equal(balance.error, 'Not an ERC20 contract address');
    })
  });
  
  it('balanceOfTAU(): Returns correct dTAU balance', async function() {
    await driver.executeScript(`
      backpage = chrome.extension.getBackgroundPage();
      return await backpage.walletEthereum.balanceOfTAU('${getTokenAmountTesting.address}');
    `).then(balance => {
      assert.equal(balance.value, getTokenAmountTesting.expectedEmount);
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
      return await backpage.walletEthereum.checkTxStatus('${checkTxStatusTesting.successfulTx}');
    `).then(txInfo => {
      assert.equal(txInfo.status, true);
    })
  });

  it('checkTxStatus(): Can lookup a txHash and report it failed', async function() {
    await driver.executeScript(`
      backpage = chrome.extension.getBackgroundPage();
      return await backpage.walletEthereum.checkTxStatus('${checkTxStatusTesting.failedTx}');
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

  it('sendControllerApproval(): Can detect when the user closes the popup', async function() {
    this.timeout(30000);
    await driver.executeScript(`
        backpage = chrome.extension.getBackgroundPage();
        window.txResult = backpage.walletEthereum.sendControllerApproval('${swapDetails.ethAddress}','${1}')
    `)

    await new Promise((resolve, reject) => {
      setTimeout(() => resolve(true), 5000) // resolve
    });

    let winHandles = await driver.getAllWindowHandles()
    await driver.switchTo().window(winHandles[2])

    let popupConfim_Button = await driver.wait(until.elementLocated(By.xpath("//button[contains(text(),'Reject')]")), 10000);
    await popupConfim_Button.click()

    sleep(2)
    winHandles = await driver.getAllWindowHandles()
    await driver.switchTo().window(winHandles[0])

    let txInfo = await driver.executeScript(`
      return await window.txResult;
    `)
    assert.equal(txInfo.error.includes('User denied transaction signature'), true);
  });

  it('sendControllerApproval(): Sends an allowance transaction', async function() {
    this.timeout(30000);
    await driver.executeScript(`
        backpage = chrome.extension.getBackgroundPage();
        window.txResult = backpage.walletEthereum.sendControllerApproval('${swapDetails.ethAddress}','${1}')
    `)

    await new Promise((resolve, reject) => {
      setTimeout(() => resolve(true), 5000) // resolve
    });

    let winHandles = await driver.getAllWindowHandles()
    await driver.switchTo().window(winHandles[2])

    let popupConfim_Button = await driver.wait(until.elementLocated(By.xpath("//button[contains(text(),'Confirm')]")), 10000);
    await popupConfim_Button.click()

    sleep(2)
    winHandles = await driver.getAllWindowHandles()
    await driver.switchTo().window(winHandles[0])
    console.log('        o WAITING FOR METAMASK TO COMPLETE TX')
    let txInfo = await driver.executeScript(`
      return await window.txResult;
    `)
    assert.equal(txInfo.status, true);
  });
})