const {By, until} = require('selenium-webdriver');
const nodeCryptoJs = require("node-cryptojs-aes")
const server = require('./server')
const path = require('path')
const config = require('../config/config')
const http = require('http')
const { CryptoJS } = nodeCryptoJs;

const { testnetMasternode } = config;

const wait_sync = (seconds) => {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, seconds);
}

const wait_async = async (seconds) => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(true), seconds)
      });
}

const sleep = async (seconds, async) => {
    if (async) await wait_async(seconds)
    else await wait_sync(seconds)
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
    await changeToTestnet(driver)
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
    await sleep(10000)
    await changeToTestnet(driver)
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
const changeToTestnet = async (driver) => {
    await driver.findElement(By.id("nav-network-info")).click()
    await driver.findElement(By.className('custom-select')).click()
    await driver.findElement(By.xpath("//div[contains(text(),'Lamden Testnet')]")).click()
    await sleep(1000, true)
    await driver.findElement(By.id("accounts")).click()
}

const setAsTrustedDapp = async (driver) => {
    await driver.findElement(By.id("coin-row-1")).click()
    await driver.findElement(By.xpath("//div[contains(text(),'dApp Settings')]")).click()
    await driver.findElement(By.id("preapproval-btn")).click()
    let trusted_Radio = await driver.wait(until.elementLocated(By.id("trusted")), 5000);
    await trusted_Radio.click()
    await driver.findElement(By.id("back-btn")).click() 
    await driver.findElement(By.id("cancel-modal-btn")).click()
    await driver.findElement(By.id("accounts")).click()
    await sleep(1000, true)

}

const getInstance = (obj) => {
    return JSON.parse(JSON.stringify(obj))
}

const hashStringValue = (string)  => {
    return CryptoJS.MD5(string).toString(CryptoJS.enc.Hex)
}

const approvePopup = async (driver, popupWindow, switchback, trusted = true, fund= {show: true, amount: 0}) => {
    await sleep(2000, true)
    await switchWindow(driver, popupWindow)
    let infoNext_Button = await driver.wait(until.elementLocated(By.id("info-next-btn")), 5000);
    await infoNext_Button.click()
    await sleep(500, true)
    if (fund.show){
        if (fund.amount > 0){
            let fundInput = await driver.findElement(By.id('fund-amount-input'))
            fundInput.sendKeys(fund.amount)
            await sleep(500, true)
            await driver.findElement(By.className('custom-select')).click()
            await sleep(500, true)
            await driver.findElement(By.xpath("//div[contains(text(),'My TAU Address')]")).click()
            await sleep(500, true)
        }
        let fundNext_Button = await driver.wait(until.elementLocated(By.id("fund-next-btn")), 5000);
        await fundNext_Button.click()
        await sleep(500, true)
    }

    if (!trusted){
        let trusted_Radio = await driver.wait(until.elementLocated(By.id("not-trusted")), 5000);
        await trusted_Radio.click()
    }
    let trustedNext_Button = await driver.wait(until.elementLocated(By.id("trusted-next-btn")), 5000);
    await trustedNext_Button.click()
    await sleep(500, true)
    await switchWindow(driver, switchback)
    //await sleep(1000, true)
}

const approveTxPopup = async (driver, popupWindow, switchback) => {
    await sleep(2000, true)
    await switchWindow(driver, popupWindow)
    let approve_Button = await driver.wait(until.elementLocated(By.id("approve-btn")), 500);
    await approve_Button.click()
    await sleep(500, true)
    await switchWindow(driver, switchback)
    //await sleep(1000, true)
}

const approveApprovalPopup = async (driver, popupWindow, switchback) => {
    await sleep(2000, true)
    await switchWindow(driver, popupWindow)
    let approve_Button = await driver.wait(until.elementLocated(By.id("approve-btn")), 500);
    await approve_Button.click()
    await sleep(500, true)
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
        const resolveDetail = (response) => {
            window.resolver(response.detail)
            document.removeEventListener('lamdenWalletInfo', resolveDetail)
        }
        document.addEventListener('lamdenWalletInfo', resolveDetail);
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



const makeHttpRequest = (url, callback) => {
    http.get(url, (resp) => {
        let data = '';
    
        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });
    
        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            callback(JSON.parse(data))    
        });
    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });
}

const getAccountBalance = (vk) => {
    return new Promise(resolver => {
        const resolveRequest = (data) => {
            if (!data.value) resolver(0)
            else resolver(parseInt(data.value)) 
        }
        makeHttpRequest(`http://${testnetMasternode}/contracts/currency/balances?key=${vk}`, resolveRequest)
    })
}

const getApprovalAmount = (sender, to) => {
    return new Promise(resolver => {
        const resolveRequest = (data) => {
            if (!data.value) resolver(0)
            else resolver(parseInt(data.value))  
        }
        makeHttpRequest(`http://${testnetMasternode}/contracts/currency/balances?key=${sender}:${to}`, resolveRequest)
    })
}


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
    completeFirstRunSetup, completeFirstRunSetupRestore, changeToTestnet, setAsTrustedDapp,
    getInstance,
    hashStringValue,
    unlockWallet, lockWallet,
    sendConnectRequest, sendGetInfoRequest,
    approvePopup, approveTxPopup, approveApprovalPopup, denyPopup,
    getWalletResponse,
    startServer, closeTest,
    sendTx, getTxResult,
    getApprovalAmount, getAccountBalance
}