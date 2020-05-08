const {By, until} = require('selenium-webdriver');
const nodeCryptoJs = require("node-cryptojs-aes")
const path = require('path')
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


const completeFirstRunSetupRestore = async (driver, workingDir, walletInfo, lock = true) => {
    await switchWindow(driver, 0)      
    await driver.findElement(By.id('restore-wallet')).click();
    await driver.executeScript(`document.getElementById('pwd1').value='${walletInfo.walletPassword}'`);
    await driver.executeScript(`document.getElementById('pwd2').value='${walletInfo.walletPassword}'`);
    await driver.findElement(By.id('save-pwd')).click()
    await driver.findElement(By.id('filePicker')).sendKeys(path.join(workingDir, walletInfo.keystoreInfo.file))
    await driver.findElement(By.id('confirm-keystore-btn')).click()
    await sleep(2000)
    await driver.executeScript(`document.getElementById('pwd-input').value='${walletInfo.keystoreInfo.password}'`)
    await driver.findElement(By.id('pwd-btn')).click()
    await driver.findElement(By.id('chk-all')).click()
    await driver.findElement(By.id('restore-btn')).click()
    await sleep(1000)
    await driver.findElement(By.id('home-btn')).click()
    await sleep(3000)
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

const approveDappConnection = async (driver, popupWindow, switchback) => {
    await sleep(2000, true)
    await switchWindow(driver, popupWindow)
    let popupDeny_Buttom = await driver.wait(until.elementLocated(By.id("approve-btn")), 5000);
    await popupDeny_Buttom.click()
    await sleep(2000, true)
    await switchWindow(driver, switchback)
    await sleep(2000, true)
}

const sendConnectRequest = async (driver, connectionInfo, awaitResponse = true) => {
    return driver.executeScript(`
        window.walletResponse = new Promise((resolve, reject) => {window.resolver = resolve})
        document.addEventListener('lamdenWalletInfo', (response) => {
            window.resolver(response.detail)
        });
        document.dispatchEvent( new CustomEvent('lamdenWalletConnect', {detail: '${JSON.stringify(connectionInfo)}'} ));
        ${awaitResponse ? "return await window.walletResponse" : ""}
    `);
}

const sendGetInfoRequest = async (driver, awaitResponse = true) => {
    return driver.executeScript(`
        window.walletResponse = new Promise((resolve, reject) => {window.resolver = resolve})
        document.addEventListener('lamdenWalletInfo', (response) => {
            window.resolver(response.detail)
        });
        document.dispatchEvent( new CustomEvent('lamdenWalletGetInfo'));
        ${awaitResponse ? "return await window.walletResponse" : ""}
    `);
}

const getWalletResponse = async (driver) => {
    return driver.executeScript(`
        return await window.walletResponse
    `);
}

const closeTest = (driver, httpServer = undefined) => {
    driver && driver.quit();
    if (httpServer) httpServer.close();
}
module.exports = {
    sleep,
    switchWindow,
    completeFirstRunSetup, completeFirstRunSetupRestore,
    getInstance,
    hashStringValue,
    unlockWallet, lockWallet,
    sendConnectRequest, sendGetInfoRequest,
    approveDappConnection,
    getWalletResponse,
    closeTest

}