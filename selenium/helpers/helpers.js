const {By, until} = require('selenium-webdriver');
const nodeCryptoJs = require("node-cryptojs-aes")
const server = require('./server')
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
    await sleep(1000, true)
    let winHandles = await driver.getAllWindowHandles()
    await driver.switchTo().window(winHandles[windowNum])
    await sleep(1000, true)
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

const approvePopup = async (driver, popupWindow, switchback, preApprove = false) => {
    //await sleep(1000, true)
    await switchWindow(driver, popupWindow)
    if (preApprove){
        let chkBox = await driver.wait(until.elementLocated(By.id("pre-approve-chk")), 5000);
        await chkBox.click()
    }
    let popupApprove_Button = await driver.wait(until.elementLocated(By.id("approve-btn")), 5000);
    await popupApprove_Button.click()
    //await sleep(1000, true)
    await switchWindow(driver, switchback)
    //await sleep(1000, true)
}

const denyPopup = async (driver, popupWindow, switchback) => {
    //await sleep(1000, true)
    await switchWindow(driver, popupWindow)
    let popupDeny_Button = await driver.wait(until.elementLocated(By.id("deny-btn")), 5000);
    await popupDeny_Button.click()
    //await sleep(1000, true)
    await switchWindow(driver, switchback)
    //await sleep(2000, true)
}

const sendConnectRequest = async (driver, connectionInfo, awaitResponse = true) => {
    return driver.executeScript(`
        window.walletInfoResponse = new Promise((resolve, reject) => {window.resolver = resolve})
        document.addEventListener('lamdenWalletInfo', (response) => {
            window.resolver(response.detail)
        });
        document.dispatchEvent( new CustomEvent('lamdenWalletConnect', {detail: '${JSON.stringify(connectionInfo)}'} ));
        ${awaitResponse ? "return await window.walletInfoResponse" : ""}
    `);
}

const sendGetInfoRequest = async (driver, awaitResponse = true) => {
    return driver.executeScript(`
        window.walletInfoResponse = new Promise((resolve, reject) => {window.resolver = resolve})
        document.addEventListener('lamdenWalletInfo', (response) => {
            window.resolver(response.detail)
        });
        document.dispatchEvent( new CustomEvent('lamdenWalletGetInfo'));
        ${awaitResponse ? "return await window.walletInfoResponse" : ""}
    `);
}

const getWalletResponse = async (driver) => {
    return driver.executeScript(`
        return await window.walletInfoResponse
    `);
}

const sendTx = async (driver, transactionInfo, awaitResponse = true) => {
    return driver.executeScript(`
        window.walletTxResult = new Promise((resolve, reject) => {window.txResolver = resolve})
        document.addEventListener('lamdenWalletTxStatus', (response) => {
            window.txResolver(response.detail)
        });
        document.dispatchEvent( new CustomEvent('lamdenWalletSendTx', {detail: '${JSON.stringify(transactionInfo)}'} ));
        ${awaitResponse ? "return await window.walletTxResult" : ""}
    `);
}

const getTxResult = async (driver) => {
    return driver.executeScript(`
        return await window.walletTxResult
    `);
}

const startServer = (port) => {return server.startServer(port)}

const closeTest = (driver, httpServer) => {return new Promise(async (resolve, reject) => {
    const stop = async () => {
        return await httpServer.close()
    }
    await stop().catch((err) => reject(err))
    driver && driver.quit();
    await sleep(1000, true)
    resolve()
})}

module.exports = {
    sleep,
    switchWindow,
    completeFirstRunSetup, completeFirstRunSetupRestore,
    getInstance,
    hashStringValue,
    unlockWallet, lockWallet,
    sendConnectRequest, sendGetInfoRequest,
    approvePopup, denyPopup,
    getWalletResponse,
    startServer, closeTest,
    sendTx, getTxResult,

}