const {By} = require('selenium-webdriver');
const nodeCryptoJs = require("node-cryptojs-aes")
const { CryptoJS } = nodeCryptoJs;

const wait_sync = (seconds) => {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, seconds);
}

const wait_async = async (seconds) => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(true), seconds)
      });
}

const sleep = async (seconds, async) => {
    //console.log(`sleeping ${seconds/1000} seconds`, new Date().toLocaleTimeString())
    if (async) await wait_async(seconds)
    else await wait_sync(seconds)
    //console.log('done', new Date().toLocaleTimeString())
}

const switchWindow = async (driver, windowNum) => {
    let winHandles = await driver.getAllWindowHandles()
    await driver.switchTo().window(winHandles[windowNum])
}

const completeFirstRunSetup = async (driver, walletPassword, lock = true) => {
    await switchWindow(driver, 0)      
    await driver.findElement(By.id('create-wallet')).click();
    await driver.executeScript(`document.getElementById('pwd1').value='${walletPassword}'`);
    await driver.executeScript(`document.getElementById('pwd2').value='${walletPassword}'`);
    await driver.findElement(By.id('save-pwd')).click()
    await driver.findElement(By.id('i-understand')).click()
    await sleep(5000)
    if (lock){
        await driver.findElement(By.id('lock')).click()
    }
}

const unlockWallet = async (driver, walletPassword, switchback) => {
    await switchWindow(driver, 0) 
    await driver.executeScript(`document.getElementById('pwd-input').value='${walletPassword}'`);
    await driver.findElement(By.id('login-btn')).click()
    await switchWindow(driver, switchback) 
    await sleep(1000, true)
}

const lockWallet = async (driver, switchback) => {
    await switchWindow(driver, 0) 
    await driver.findElement(By.css("div.brand.clickable")).click()
    await driver.findElement(By.id('lock')).click()
    await switchWindow(driver, switchback) 
    await sleep(1000, true)
}

const getInstance = (obj) => {
    return JSON.parse(JSON.stringify(obj))
}

const hashStringValue = (string)  => {
    return CryptoJS.MD5(string).toString(CryptoJS.enc.Hex)
}

module.exports = {
    sleep,
    switchWindow,
    completeFirstRunSetup,
    getInstance,
    hashStringValue,
    unlockWallet, lockWallet
}