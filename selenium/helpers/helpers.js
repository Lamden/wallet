const {By, until} = require('selenium-webdriver');
const nodeCryptoJs = require("node-cryptojs-aes")
const server = require('./server')
const path = require('path')
const config = require('../config/config')
const http = require('http')
const https = require('https')
const assert = require('assert');
const { CryptoJS } = nodeCryptoJs;
const mnemonicWords = require("../fixtures/mnemonic.json")

const { testnetMasternode, testnetBlockService, testnetBlockService_v2} = config;

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
    await sleep(1000, true)
    let element = driver.findElement(By.id('accounts'))
    await driver.executeScript("arguments[0].click();", element)
}

const completeFirstRunSetup = async (driver, walletPassword, lock = true, testnet = true) => {
    await switchWindow(driver, 0)      
    await driver.findElement(By.id('create-wallet')).click();
    await driver.executeScript(`document.getElementById('pwd1').value='${walletPassword}'`);
    await driver.executeScript(`document.getElementById('pwd2').value='${walletPassword}'`);
    await driver.findElement(By.id('save-pwd')).click()
    await sleep(2000)

    let elements = await driver.findElements(By.css('.mnemonic .cell input'))

    let vals;
    let words = [];
    elements.forEach(element => {
        let value = element.getAttribute("value");
        words.push(value);
    });
    await Promise.all(words).then((res)=>{
        vals = res;;
    })
    await driver.findElement(By.css('.chk-checkmark')).click();
    await driver.findElement(By.id('next')).click();
    await sleep(3000);

    elements = await driver.findElements(By.css('.mnemonic .cell input'));
    for(let i=0; i<24; i++){
        try {
            await elements[i].sendKeys(`${vals[i]}\n`);
        } catch {
            // tbd
        }
    }
    await driver.findElement(By.id('next')).click();
    await sleep(2000)

    await driver.findElement(By.css('.chk-checkmark')).click();
    await driver.findElement(By.id('i-understand')).click()
    await sleep(3000)

    // await ignoreBackupModal(driver)
    if (testnet) await changeToTestnetV2(driver)
    await driver.findElement(By.id('refresh-icon')).click()
    await sleep(3000, true)
    if (lock){
        await driver.findElement(By.id('lock')).click()
    }
}

const ignoreBackupModal = async (driver) => {
    // await validBackupModal(driver)
    await driver.wait(until.elementLocated(By.id(`ignore-btn`)), 25000).click();
    await sleep(1000, true)
}

const completeFirstRunSetupRestore = async (driver, workingDir, walletInfo, lock = true, testnet=true, ignoreBackup=true) => {
    await switchWindow(driver, 0)
    await driver.wait(until.elementLocated(By.id("restore-wallet")), 10000).click();
    await driver.executeScript(`document.getElementById('pwd1').value='${walletInfo.walletPassword}'`);
    await driver.executeScript(`document.getElementById('pwd2').value='${walletInfo.walletPassword}'`);
    await driver.findElement(By.id('save-pwd')).click()
    await sleep(2000)

    let words = mnemonicWords.mnemonic.split(' ');
    let elements = await driver.findElements(By.css('.mnemonic .cell input'));
    for(let i=0; i<24; i++){
        await elements[i].sendKeys(`${words[i]}\n`);
    }
    await driver.findElement(By.id('next')).click();
    await sleep(2000)

    await driver.executeScript(`document.getElementById('chk-all').innerText='testing'`)
    await driver.findElement(By.id('chk-all')).click()
    await driver.findElement(By.id('restore-btn')).click()
    await sleep(2000)
    await driver.findElement(By.id('home-btn')).click()
    await sleep(3000)
    // await driver.findElement(By.id('ignore-btn')).click()
    if (ignoreBackup) await ignoreBackupModal(driver)
    if (testnet) {
        await changeToTestnetV2(driver)
        await sleep(2000)
    }
    await driver.findElement(By.id('refresh-icon')).click()
    await sleep(3000, true)
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
    await sleep(1000)
    let element = await driver.findElement(By.css("div.brand.clickable"))
    driver.executeScript("arguments[0].click();", element)
    await driver.findElement(By.id('lock')).click()
    await switchWindow(driver, switchback) 
    await sleep(1000, true)
}
const changeToTestnet = async (driver) => {
    await driver.wait(until.elementLocated(By.id('nav-network-currently-selected')), 5000).click();
    let navNetwork = await driver.wait(until.elementLocated(By.id("select-option-3")), 5000);
    navNetwork.click()
    await sleep(2000, true)
}

const changeToTestnetV2 = async (driver) => {
    await driver.wait(until.elementLocated(By.id('nav-network-currently-selected')), 5000).click();
    let navNetwork = await driver.wait(until.elementLocated(By.id("select-option-3")), 5000);
    navNetwork.click()
    await sleep(2000, true)
}

const setAsTrustedDapp = async (driver) => {
    await sleep(500, true)
    await driver.findElement(By.id("dapp-connections")).click()
    await driver.wait(until.elementLocated(By.id("dapp-appname-0")), 5000).click()
    await sleep(1000, true)
    await driver.findElement(By.id("modify-dapp-btn")).click()
    await sleep(500, true)
    await driver.findElement(By.id("preapproval-btn")).click()
    await sleep(500, true)
    let trusted_Radio = await driver.wait(until.elementLocated(By.id("trusted")), 5000);
    await trusted_Radio.click()
    await sleep(500, true)
    await driver.findElement(By.id("back-btn")).click() 
    await sleep(500, true)
    await driver.findElement(By.id("dapp-options-save-btn")).click()
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

const approvePopup = async (driver, popupWindow, switchback, trusted = true) => {
    await sleep(2000, true)
    await switchWindow(driver, popupWindow)
    let infoNext_Button = await driver.wait(until.elementLocated(By.id("info-next-btn")), 5000);
    await infoNext_Button.click()
    await sleep(500, true)

    accountCard = await driver.wait(until.elementLocated(By.id("account-0")), 5000);
    await accountCard.click()

    accountLink_Button = await driver.wait(until.elementLocated(By.id("account-link-btn")), 5000);
    await accountLink_Button.click()

    if (!trusted){
        await sleep(1000)
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

const sendDappVerifyRequest = async (data, driver, awaitResponse = true) => {
    return driver.executeScript(`
        window.dappVerifiedResponse = new Promise((resolve, reject) => {window.dappVerifyResolver = resolve})

        const resolveDetail = (response) => {
            console.log(response)
            window.dappVerifyResolver(response.detail)
            document.removeEventListener('dappVerified', resolveDetail)
        }

        document.addEventListener('authReturn', resolveDetail);
        document.dispatchEvent( new CustomEvent('auth', {detail: '${JSON.stringify(data)}'} ));

        ${awaitResponse ? "console.log(await window.dappVerifiedResponse); return await window.dappVerifiedResponse" : ""}
    `);
}

const sendDappVerifyRequest_special = async (driver, awaitResponse = true) => {
    return driver.executeScript(`
        window.dappVerifiedResponse = new Promise((resolve, reject) => {window.dappVerifyResolver = resolve})

        const resolveDetail = (response) => {
            console.log(response)
            window.dappVerifyResolver(response.detail)
            document.removeEventListener('dappVerified', resolveDetail)
        }

        document.addEventListener('authReturn', resolveDetail);
        const detail = JSON.stringify({"dapp_challenge": JSON.stringify({test: "test"}),"vk":"37d05a43874dd70f56a03625df1680a358b4728510228d5e5f280de51554a12b"})
        const evt = new CustomEvent('auth', {detail})
        document.dispatchEvent( evt );

        ${awaitResponse ? "console.log(await window.dappVerifiedResponse); return await window.dappVerifiedResponse" : ""}
    `);
}

const getDappVerifiedResponse = async (driver) => {
    return driver.executeScript(`
        console.log(await window.dappVerifiedResponse);
        return await window.dappVerifiedResponse
    `);
}

const setupSendListener = (driver) => {
    return driver.executeScript(`
        window.walletTxResult = {};
        window.txResolver = {};
        window.walletTxResult['emptyuid'] = new Promise((resolve, reject) => {window.txResolver['emptyuid'] = resolve})
        document.addEventListener('lamdenWalletTxStatus', (response) => {
            let detail = response.detail
            let uid;
            if (detail.data && detail.data.uid) {
                uid = detail.data.uid
            } else {
                uid = 'emptyuid'
            }

            if (detail.data){
                if (detail.data.blockResult){
                    if(detail.data.blockResult.hash) return
                }
            }
            window.txResolver[uid](detail)
        });
    `);
}

const createUID = () => hashStringValue(new Date().toISOString())

const sendTx = async (driver, transactionInfo, awaitResponse = true) => {
    let uid = transactionInfo.uid
    if (!uid) uid = 'emptyuid'
    return driver.executeScript(`
        window.walletTxResult['${uid}'] = new Promise((resolve, reject) => {window.txResolver['${uid}'] = resolve})
        document.dispatchEvent( new CustomEvent('lamdenWalletSendTx', {detail: '${JSON.stringify(transactionInfo)}'} ));
        ${awaitResponse ? `console.log(await window.walletTxResult['${uid}']); return await window.walletTxResult['${uid}']` : ""}
    `);
}

const getTxResult = async (driver, uid) => {
    return driver.executeScript(`
        console.log(await window.walletTxResult['${uid}'])
        return await window.walletTxResult['${uid}']
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

const getApprovalAmount = (sender, to, version = 1) => {
    return new Promise(resolver => {
        const resolveRequest = (data) => {
            if (typeof data.value === 'undefined') return resolver(0)
            if (!data.value) return resolver(0)
            if (data.value.__fixed__) return resolver(parseInt(data.value.__fixed__))
            else return resolver(parseInt(data.value))  
        }
        let api = version === 2 ? testnetBlockService_v2 : testnetBlockService

        makeHttpRequest(`${api}/current/one/currency/balances/${sender}:${to}`, resolveRequest)
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

    await driver.findElement(By.xpath("//input[@placeholder='Paste Recovery Phrase from clipboard']")).sendKeys(config.metamaskBackupPhrase)
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

const validBackupModal = async (driver) => {
    let modal = await driver.wait(until.elementLocated(By.className(`notification`)), 25000);
    await modal.findElement(By.css("h2")).getAttribute('innerText').then(text => {
        assert.equal(text, 'Your Backup is out of Date');
    })
    await driver.findElement(By.id('backup-btn')).getAttribute('innerText').then(text => {
        assert.equal(text, 'BACKUP');
    })
    await driver.findElement(By.id('help-btn')).getAttribute('innerText').then(text => {
        assert.equal(text, 'HELP');
    })
    await driver.findElement(By.id('ignore-btn')).getAttribute('innerText').then(text => {
        assert.equal(text, 'IGNORE');
    })
}

const addAccount = async (driver) => {
    await driver.findElement(By.id('accounts')).click();
    await driver.findElement(By.id('add-btn')).click();
    await driver.findElement(By.css('.submit-button')).click();
    let messageField = await driver.wait(until.elementLocated(By.id(`message-text`)), 25000);
    let message = await messageField.getAttribute("innerText")
    assert.equal(message, `Added New Tau Account to your Lamden Vault`);
    await driver.findElement(By.id("home-btn")).click()
    await sleep(500, true)
    await ignoreBackupModal(driver)
}

const addTrackedAccount = async (driver, address) => {
    await driver.findElement(By.id('accounts')).click();
    await driver.findElement(By.id('add-btn')).click();
    await driver.findElement(By.id('track-address-btn')).click();
    await driver.findElement(By.id("public-key")).sendKeys(address)
    await driver.findElement(By.css('.submit-button')).click();
    let messageField = await driver.wait(until.elementLocated(By.id(`message-text`)), 25000);
    let message = await messageField.getAttribute("innerText")
    assert.equal(message, `Added New Tau Account to your Lamden Vault`);
    await driver.findElement(By.id("home-btn")).click()
    await sleep(500, true)
    let emts = await driver.findElements(By.className("notification"))
    assert.equal(0, emts.length)
}

const changePassword = async (driver, oldpd, newpd, confirmpd) => {
    await sleep(500)
    await driver.findElement(By.id("settings")).click();
    await driver.findElement(By.id("change-btn")).click();
    await sleep(500)
    await driver.executeScript(`document.getElementById('pwd1-input').value='${oldpd}'`)
    await driver.findElement(By.id("pwd2-input")).sendKeys(newpd);
    await driver.executeScript(`document.getElementById('pwd3-input').value='${confirmpd}'`)
    await driver.findElement(By.id("change-pw-btn")).click();
}

const gotoBackup = async (driver) => {
    await sleep(500)
    await driver.findElement(By.id("settings")).click();
    await driver.findElement(By.id("backup-btn")).click();
    await sleep(500)
}

const gotoNetwork = async (driver) => {
    await sleep(500)
    await driver.findElement(By.id("settings")).click();
    await driver.findElement(By.id("networks-btn")).click();
    await sleep(500)
}

const clearNetwork = async (driver) => {
    await sleep(500)
    await driver.findElement(By.id("name")).clear();
    await driver.findElement(By.id("currencySymbol")).clear();
    await driver.findElements(By.css("#mainbox-hostlist>div>.text-btn")).then(res => {
        res.forEach(async item => {
            await driver.executeScript(`arguments[0].style.display = 'inline-block'`, item)
            await item.click()
        });
    })
    await driver.findElements(By.css("#mainbox-blockServiceList>div>.text-btn")).then(res => {

        res.forEach(async item => {
            await driver.executeScript(`arguments[0].style.display = 'inline-block'`, item)
            await item.click()
        });
    })
    await driver.findElement(By.id("explorer")).clear();
}

const fillNetworkForm = async (driver, networkinfo) => {
    await driver.findElement(By.id("name")).sendKeys(networkinfo.name);
    await driver.findElement(By.id("currencySymbol")).sendKeys(networkinfo.currencySymbol);

    let hostinput = await driver.findElement(By.id("hostlist"))
    await hostinput.sendKeys(networkinfo.host)
    await driver.findElement(By.css("#hostlist + .add-btn")).click()

    let blockserviceInput = await driver.findElement(By.id("blockServiceList"))
    await blockserviceInput.sendKeys(networkinfo.blockservice)
    await driver.findElement(By.css("#blockServiceList + .add-btn")).click()

    if (networkinfo.explorer) {
        await driver.findElement(By.id("explorer")).sendKeys(networkinfo.explorer);
    }
}

module.exports = {
    changePassword,
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
    changeAccountPopup,
    ignoreBackupModal,
    validBackupModal,
    addAccount,
    addTrackedAccount,
    gotoNetwork,
    clearNetwork,
    fillNetworkForm,
    gotoBackup,
    createUID,
    changeToTestnetV2,
    sendDappVerifyRequest, getDappVerifiedResponse, sendDappVerifyRequest_special
}