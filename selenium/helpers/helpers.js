const {By, until} = require('selenium-webdriver');
const nodeCryptoJs = require("node-cryptojs-aes")
const server = require('./server')
const path = require('path')
const config = require('../config/config')
const http = require('http')
const https = require('https')
const { CryptoJS } = nodeCryptoJs;

const { testnetMasternode, testnetBlockService } = config;

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

const gotoAccountsPage = async (driver) => {
    await driver.findElement(By.id('accounts')).click();
}

const completeFirstRunSetup = async (driver, walletPassword, lock = true, testnet = true) => {
    await switchWindow(driver, 0)      
    await driver.findElement(By.id('create-wallet')).click();
    await driver.executeScript(`document.getElementById('pwd1').value='${walletPassword}'`);
    await driver.executeScript(`document.getElementById('pwd2').value='${walletPassword}'`);
    await driver.findElement(By.id('save-pwd')).click()
    await driver.findElement(By.id('i-understand')).click()
    await sleep(5000)
    if (testnet) await changeToTestnet(driver)
    await driver.findElement(By.id('refresh-icon')).click()
    await sleep(3000, true)
    if (lock){
        await driver.findElement(By.id('lock')).click()
    }
}


const completeFirstRunSetupRestore = async (driver, workingDir, walletInfo, lock = true, testnet=true) => {
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
    await driver.executeScript(`document.getElementById('chk-all').innerText='testing'`)
    await driver.findElement(By.id('chk-all')).click()
    await driver.findElement(By.id('restore-btn')).click()
    await sleep(2000)
    await driver.findElement(By.id('home-btn')).click()
    await sleep(4000)
    if (testnet) {
        await changeToTestnet(driver)
        await sleep(2000)
    }
    await driver.findElement(By.id('refresh-icon')).click()
    await sleep(6000, true)
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
    let navNetwork = await driver.wait(until.elementLocated(By.id("nav-network-info")), 5000);
    navNetwork.click()
    await sleep(1000, true)
}

const setAsTrustedDapp = async (driver) => {
    await sleep(500, true)
    await driver.findElement(By.id("coin-nickname-1")).click()
    await sleep(500, true)
    let btn = await driver.findElement(By.xpath("//div[contains(text(),'dApp Settings')]"))
    await driver.executeScript("arguments[0].click();", btn);
    await sleep(500, true)
    await driver.findElement(By.id("preapproval-btn")).click()
    await sleep(500, true)
    let trusted_Radio = await driver.wait(until.elementLocated(By.id("trusted")), 5000);
    await trusted_Radio.click()
    await sleep(500, true)
    await driver.findElement(By.id("back-btn")).click() 
    await sleep(500, true)
    await driver.findElement(By.id("cancel-modal-btn")).click()
    await sleep(500, true)
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

const changeAccountPopup = async (driver, popupWindow, switchback) => {
    await sleep(2000, true)
    await switchWindow(driver, popupWindow)
    let change_Button = await driver.wait(until.elementLocated(By.id("change-btn")), 500);
    await change_Button.click()
    await sleep(500, true)
    await driver.findElement(By.xpath("//div[contains(@class,'card') and not(contains(@class,'card-selected'))]"), 500).click();
    await sleep(500, true)
    let link_Button = await driver.wait(until.elementLocated(By.id("account-link-btn")), 500);
    await link_Button.click()
    await sleep(500, true)
    await switchWindow(driver, switchback)
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

const approveReApprovePopup = async (driver, popupWindow, switchback) => {
    await sleep(2000, true)
    await switchWindow(driver, popupWindow)
    let approve_Button = await driver.wait(until.elementLocated(By.id("approve-btn")), 500);
    await approve_Button.click()
    await sleep(500, true)
    await switchWindow(driver, switchback)
}

const approveApprovalPopup = async (driver, popupWindow, switchback) => {
    await sleep(2000, true)
    await switchWindow(driver, popupWindow)
    let approve_Button = await driver.wait(until.elementLocated(By.id("approve-btn")), 500);
    await approve_Button.click()
    await sleep(500, true)
    await switchWindow(driver, switchback)
}

const denyPopup = async (driver, popupWindow, switchback) => {
    await switchWindow(driver, popupWindow)
    let popupDeny_Button = await driver.wait(until.elementLocated(By.id("deny-btn")), 5000);
    await popupDeny_Button.click()
    await switchWindow(driver, switchback)
}

const sendConnectRequest = async (driver, connectionInfo, awaitResponse = true) => {
    return driver.executeScript(`
        window.walletInfoResponse = new Promise((resolve, reject) => {window.resolver = resolve})
        document.addEventListener('lamdenWalletInfo', (response) => {
            window.resolver(response.detail)
        });
        document.dispatchEvent( new CustomEvent('lamdenWalletConnect', {detail: '${JSON.stringify(connectionInfo)}'} ));
        ${awaitResponse ? "console.log(await window.walletInfoResponse); return await window.walletInfoResponse" : ""}
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
        ${awaitResponse ? "console.log(await window.walletInfoResponse); return await window.walletInfoResponse" : ""}
    `);
}

const getWalletResponse = async (driver) => {
    return driver.executeScript(`
        console.log(await window.walletInfoResponse);
        return await window.walletInfoResponse
    `);
}

const setupSendListener = (driver) => {
    return driver.executeScript(`
        window.walletTxResult = new Promise((resolve, reject) => {window.txResolver = resolve})
        document.addEventListener('lamdenWalletTxStatus', (response) => {
            let detail = response.detail

            if (detail.data){
                if (detail.data.blockResult){
                    if(detail.data.blockResult.hash) return
                }
            }
            window.txResolver(detail)
        });
    `);
}

const sendTx = async (driver, transactionInfo, awaitResponse = true) => {
    return driver.executeScript(`
        window.walletTxResult = undefined;
        window.txResolver = undefined;
        window.walletTxResult = new Promise((resolve, reject) => {window.txResolver = resolve})
        document.dispatchEvent( new CustomEvent('lamdenWalletSendTx', {detail: '${JSON.stringify(transactionInfo)}'} ));
        ${awaitResponse ? "console.log(await window.walletTxResult); return await window.walletTxResult" : ""}
    `);
}

const getTxResult = async (driver) => {
    return driver.executeScript(`
        console.log(await window.walletTxResult)
        return await window.walletTxResult
    `);
}

const startServer = (port) => {return server.startServer(port)}



const makeHttpRequest = (url, callback) => {
    let protocol = http;
    if(url.includes('https://')) protocol = https;
    protocol.get(url, (resp) => {
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
            if (typeof data.value === 'undefined') return resolver(0)
            if (!data.value) return resolver(0)
            if (data.value.__fixed__) return resolver(parseInt(data.value.__fixed__))
            else return resolver(parseInt(data.value)) 
        }
        makeHttpRequest(`${testnetBlockService}/current/one/currency/balances/${vk}`, resolveRequest)
    })
}

const getApprovalAmount = (sender, to) => {
    return new Promise(resolver => {
        const resolveRequest = (data) => {
            if (typeof data.value === 'undefined') return resolver(0)
            if (!data.value) return resolver(0)
            if (data.value.__fixed__) return resolver(parseInt(data.value.__fixed__))
            else return resolver(parseInt(data.value))  
        }
        makeHttpRequest(`${testnetBlockService}/current/one/currency/balances/${sender}:${to}`, resolveRequest)
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

const setupMetamask = async (driver, kovan = true) => {
    await sleep(500)
    await switchWindow(driver, 1) 
    await driver.findElement(By.xpath("//button[contains(text(),'Get Started')]")).click()
    await driver.findElement(By.xpath("//button[contains(text(),'Import wallet')]")).click()
    await driver.findElement(By.xpath("//button[contains(text(),'No Thanks')]")).click()
    await sleep(1000)

    await driver.findElement(By.xpath("//input[@placeholder='Paste seed phrase from clipboard']")).sendKeys(config.metamaskBackupPhrase)
    await driver.findElement(By.id("password")).sendKeys(config.metamaskPassword)
    await driver.findElement(By.id("confirm-password")).sendKeys(config.metamaskPassword)
    await driver.findElement(By.className("first-time-flow__terms")).click()
    await sleep(500)
    await driver.findElement(By.xpath("//button[contains(text(),'Import')]")).click()
    await sleep(2000)
    await driver.findElement(By.xpath("//button[contains(text(),'All Done')]")).click()
    await sleep(500)

    try {
        await driver.findElement(By.className("popover-header__button")).click()
    }catch(e){}
    if (kovan){
        await driver.findElement(By.className("network-display")).click()
        await driver.findElement(By.xpath("//span[contains(text(),'Kovan Test Network')]")).click()
    }
}

module.exports = {
    sleep,
    switchWindow,
    completeFirstRunSetup, completeFirstRunSetupRestore, changeToTestnet, setAsTrustedDapp,
    getInstance,
    hashStringValue,
    unlockWallet, lockWallet,
    sendConnectRequest, sendGetInfoRequest,
    approvePopup, approveTxPopup, approveApprovalPopup, denyPopup, approveReApprovePopup,
    getWalletResponse,
    startServer, closeTest,
    sendTx, getTxResult,
    getApprovalAmount, getAccountBalance,
    setupSendListener,
    gotoAccountsPage,
    setupMetamask,
    changeAccountPopup
}