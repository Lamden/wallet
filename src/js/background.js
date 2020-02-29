import '../img/icon-128.png'
import '../img/icon-34.png'
import { encryptObject, decryptObject, encryptStrHash, decryptStrHash, hashStringValue } from './utils.js';

import Lamden from 'lamden-js'
const validators = require('types-validate-assert')
const { validateTypes, assertTypes } = validators

const lamdenNetworksMap = {
    mainnet: 'Lamden Mainnet',
    testnet: 'Lamden Testnet',
    mockchain: 'Lamden Public Mockchain'
}

//Settings
let hash;
let firstRun;

//Background Store copies
let coinStore;
let dappsStore;
let settingsStore;
let networksStore;
let txStore;


//Misc Values
let pendingTxList;
let txToConfirm = {};
let current = '';
let walletIsLocked = true;
/*
chrome.storage.local.set(
    {
       // "hash": "",
      //  "coins": [],
      //  "txs": {},
      //  "pendingTxs": {},
       // "networks":{},
        "dapps":{},
      //  "settings": undefined
    }
)
*/
chrome.storage.local.get(
    {
        "hash": "",
        "coins": [],
        "txs": {},
        "pendingTxs": {},
        "networks":{},
        "dapps":{},
        "settings": undefined
    },
    function(getValue) {
        hash = getValue.hash
        firstRun = hash === "" ? true : false;
        coinStore = getValue.coins
        txStore = getValue.txs;
        networksStore = getValue.networks;
        settingsStore = getValue.settings; 
        pendingTxList = getValue.pendingTxs;
        dappsStore = getValue.dapps;
    }
)

chrome.storage.onChanged.addListener(function(changes) {
    console.log(changes)
    for (let key in changes) {
        if (key === 'coins') coinStore = changes[key].newValue;
        if (key === 'dapps') dappsStore = changes[key].newValue;
        if (key === 'networks') networksStore = changes[key].newValue;
        if (key === 'txs') {
            txStore = changes[key].newValue;
            //alert(JSON.stringify(txStore)); 
        }
        if (key === 'pendingTxs') pendingTxList = changes[key].newValue;
    }
});

const fromApp = (sender) => {
    return sender.url === `${window.location.origin}/app.html`
}
const fromConfirm = (sender) => {
    return sender.url.split('#')[0] === `${window.location.origin}/confirm.html`
}

const getSenderHash = (sender) => {
    return sender.url.split('#')[1]
}

const isJSON = (json) => {
	if (Object.prototype.toString.call(json) !== "[object String]") return false
    try{
        return JSON.parse(json)
    }catch (e){ return false}
}

const isAcceptedNetwork = (networkName) => {
    return Object.keys(lamdenNetworksMap).includes(networkName)
}

const stripRef = (value) => {
    return JSON.parse(JSON.stringify(value))
}

const validatePassword = (testPassword) => {
    try{
        return decryptObject(testPassword, hash).valid
    } catch (e) {}
    return false
}

const setWalletIsLocked = (status) => {
    walletIsLocked = status;
    chrome.runtime.sendMessage({type: 'walletIsLocked', data: walletIsLocked})
    sendMessageToAllDapps('sendWalletInfo')
}

const encryptString = (string) => {
    try{
        return encryptStrHash(current, string);
    }catch(e){console.log(e)}
    return false;
}

const decryptString = (string) => {
    try{
        return decryptStrHash(current, string);
    }catch(e){console.log(e)}
    return false;
}

const getWallet = (vk) => {
	return coinStore.find(coin => coin.vk === vk)
}

const getCurrentNetwork = () => {
    let networks = [...networksStore.lamden, ...networksStore.user]
    let foundNetwork = networks.find(network => networksStore.current === `${network.host}:${network.port}`)
    return foundNetwork
}

const getLamdenNetwork = (networkName) => {
    return networksStore.lamden.find(network => network.name === networkName)
}

const sendTx = (txBuilder, sk, sentFrom) => {
    txBuilder.send(decryptString(sk), () => {
        let txData = txBuilder.getAllInfo()
        saveTxData(txBuilder);
        sendMessageToTab(sentFrom, txData)
    })
}

const saveTxData = (txBuilder) => {
    let result = txBuilder.txSendResult;
    //alert(JSON.stringify(result))
    let netKey = txBuilder.url;
    let vk = txBuilder.sender;

    if (result.hash){
        //create keys if they don't exist
        if (!pendingTxList[netKey]) pendingTxList[netKey] = {}
        if (!pendingTxList[netKey][vk]) pendingTxList[netKey][vk] = [];

        pendingTxList[netKey][vk].push(txBuilder.getAllInfo());

        chrome.storage.local.set({"pendingTxs": pendingTxList});
        //alert('SAVING TO STORE: ' + JSON.stringify(pendingTxList))
    }else{
        //create keys if they don't exist
        if (!txStore[netKey]) txStore[netKey] = {}
        if (!txStore[netKey][vk]) txStore[netKey][vk] = [];

        let txDate = {
            txInfo: txBuilder.getTxInfo(),
            resultInfo: txBuilder.getResultInfo(),
            timestamp: result.timestamp
        }

        txStore[netKey][vk].push(txDate);

        chrome.storage.local.set({"txs": txStore});
        //alert('SAVING TO STORE: ' + JSON.stringify(txStore))        
    }
}

function updateTxData(){/*
    let netKey = txBuilder.url
    let vk = txBuilder.sender
    if (!txStore[netKey]) return;
    if (!txStore[netKey][vk]) return;

    let txHistory = txStore[netKey][vk]
    let foundTx = txHistory.find(f => f.id === txBuilder.id)

    if (!foundTx) return

    foundTx = txBuilder.getAllInfo()
    chrome.storage.local.set({"txs": txStore});
    alert('UPDATING STORE: ' + JSON.stringify(txStore))
    */
}

const sendMessageToTab = (url, type, data) => {
    chrome.windows.getAll({populate:true},function(windows){
        windows.forEach((window) => {
            window.tabs.forEach((tab) => {
                if (url === tab.url){
                    chrome.tabs.sendMessage(tab.id, {type, data});  
                }
            });
        });
    });
}

const sendMessageToAllDapps = (type, data) => {
    chrome.windows.getAll({populate:true},function(windows){
        windows.forEach((window) => {
            window.tabs.forEach((tab) => {
                Object.keys(dappsStore).forEach(dapp => {
                    if (tab.url === dapp){
                        chrome.tabs.sendMessage(tab.id, {type, data});  
                    }
                })
            });
        });
    });
}


const createKeystore = (info) => {
    return JSON.stringify({
        data: encryptObject(info.pwd, {'version' : info.version, keyList: decryptedKeys()}),
        w: info.hint === "" ? "" : encryptStrHash(info.obscure, info.hint),
    });
}

const decryptedKeys = () => {
    return stripRef(coinStore).map( coin => {
        let decryptedKey;
        try{
            decryptedKey = decryptString(coin.sk);
        } catch (e) {}
        if (decryptedKey) coin.sk = decryptedKey
        else {
            coin.sk = `Cannot decrypt Secret Key: wrong password or bad data. Encrypted Data: ${coin.sk}`
        }
        return coin
    })
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (chrome.runtime.lastError) return;
    if (fromApp(sender)){
        if(message.type === 'createPassword'){
            try{
                let hashedPW = encryptObject(message.data, {valid: true})
                hash = hashedPW
                current = message.data
                firstRun = false;
                chrome.storage.local.set({"hash" : hashedPW});
                sendResponse(true)
            } catch (e){sendResponse(false)}
        }
        if(message.type === 'isFirstRun'){
            sendResponse(firstRun)
        }
        if (message.type === 'unlockWallet') {
            if (validatePassword(message.data)){
                current = message.data
                setWalletIsLocked(false)
            }
            sendResponse(walletIsLocked)
        }
        if (message.type === 'validatePassword') sendResponse(validatePassword(message.data))
        if (message.type === 'lockWallet') setWalletIsLocked(true)
        if (message.type === 'encryptSk') sendResponse(encryptString(message.data))
        if (message.type === 'decryptSk') sendResponse(decryptString(message.data))
        if (message.type === 'backupCoinstore') sendResponse(createKeystore(message.data))
        if (message.type === 'decryptStore') sendResponse(decryptedKeys())
    }

    if (message.type === 'walletIsLocked') sendResponse(walletIsLocked)

    if (message.type === 'sendLamdenTransaction'){
        let txInfo = {};
        try{
            txInfo = JSON.parse(message.data)
        } catch (e) {
            sendResponse({status: "Error: Failed to Parse JSON object"})
        }
        
        let wallet = getWallet(txInfo.senderVk);
        if (!wallet) sendResponse({status: `Error: Did not find Sender Key (${txInfo.senderVk}) in Lamden Wallet`});

        try{
            txInfo.uid = encryptString(wallet.vk, 'tracking-id')
            let txBuilder = new Lamden.TransactionBuilder(getCurrentNetwork(), txInfo)
            sendResponse({status: "Transaction Sent, Awaiting Response"})
            sendTx(txBuilder, wallet.sk, sender.url)
        }catch (err){
            sendResponse({status: `Error: Failed to create Tx - ${err}`})
        }
    }
});

////////////////////////////
//DAPP SECTION
const getDappInfo = (sender) => {
    if (!dappsStore[sender.url]) return false
    return dappsStore[sender.url]
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (chrome.runtime.lastError) return;

    
    if (message.type === 'lamdenWalletConnect') {
        if (walletIsLocked){
            sendResponse({errors:["Wallet is Locked"]})
            return
        }
        const connectionMessage = validateConnectionMessage(message.data)
        if (validateTypes.hasKeys(connectionMessage, ['errors'])){
            sendResponse(connectionMessage)
            return
        }else{
            const dappInfo = getDappInfo(sender)
            let sendInfo = false;
            if (dappInfo){
                if (dappInfo[connectionMessage.networkName]){
                    if (dappInfo[connectionMessage.networkName].contractName === connectionMessage.contractName){
                        sendResponse_WalletInfo(dappInfo, sendResponse);
                        sendInfo = true;
                    }
                } 
            }
            if (!sendInfo){
                promptApproveDapp(sender, connectionMessage)
                sendResponse("ok")
            }
        }
    }

	if (message.type === 'getWalletInfo') {
        let dappInfo = getDappInfo(sender)
        console.log(dappsStore)
        if (!dappInfo){
            sendResponse({errors:["The user has not yet given your app wallet access. Please send a connection request even to 'lamdenWalletConnect'."]})
            return
        }else{
            sendResponse_WalletInfo(dappInfo, sendResponse);
        }
    }
    
    if (message.type === 'storeLockStatusChanged'){
		//Send Lock status to all Pages
		sendMsgToAllTabs({type: 'sendWalletInfo'})
	}

	if (message.type === 'currentNetworkChanged'){
        //Send Network Name to all pages
		sendMsgToAllTabs({type: 'sendWalletInfo'})
    }
    
    //Only do these requests if the sender was from the confirm popup
    if (fromConfirm(sender)){
        let confirmHash = sender.url.split('#')[1]

        if (message.type === 'getConfirmInfo'){
            try {
                sendResponse(txToConfirm[confirmHash])
            } catch (e){}
            sendResponse(false)
        }

        if (message.type === 'approveConfirm'){
            approveDapp(sender)
        }
    }
});

const validateConnectionMessage = (data) => {
    let errors = [];
    const messageData = isJSON(data)
    if (!messageData) {
        return {errors: ['Expected connect request to be JSON string']}
    }
    if (!validateTypes.isStringWithValue(messageData.dappName)) {
        errors.push("'dappName' <string> required to process connect request")
    }
    if (!validateTypes.isStringWithValue(messageData.contractName)) {
        errors.push("'contractName' <string> required to process connect request")
    }
    if (validateTypes.isStringWithValue(messageData.networkName)){
        if (!isAcceptedNetwork(messageData.networkName)){
            errors.push(`'networkName' <string> '${messageData.networkName}' is not a valid value. Valid Networks values are ${Object.keys(lamdenNetworksMap)}.`)
        }
    }else{
        errors.push("'networkName' <string> required to process connect request")
    }
    if (validateTypes.isStringWithValue(messageData.description)) {
        if (messageData.description.length < 60){
            errors.push("'description' <string> character length required to be greather than 60")
        }
    }else{
        errors.push("'description' <string> required to process connect request")
    }
    if (errors.length > 0) {
        return {'errors': errors}
    }
    return messageData
}

const contractExists = (networkName, contractName) => {
    let network = new Lamden.Network(getLamdenNetwork(lamdenNetworksMap[networkName]))
    return network.API.contractExists(contractName)
}

const sendResponse_WalletInfo = (dappInfo, sendResponse) => {
    let installedStatus = {
        installed: true,
        setup: !firstRun,
        locked: walletIsLocked,
        wallets: []
    }
    if (installedStatus.locked === false){
        installedStatus.wallets = [dappInfo.vk]
        installedStatus.currentNetwork = new Lamden.Network(getCurrentNetwork()).getNetworkInfo()
    }
    sendResponse(installedStatus)
}

const promptApproveDapp = async (sender, messageData) => {
    let exists = await contractExists(messageData.networkName, messageData.contractName)
    if (!exists) {
        const errors = [`contractName: '${messageData.contractName}' does not exists on '${messageData.networkName}' network.`]
        sendMessageToTab(sender.url, 'sendErrorsToTab', {errors})
    }else{
        const keypair = Lamden.wallet.new_wallet()
        const windowId = hashStringValue(keypair.vk)
        txToConfirm[windowId] = {
            type: 'ApproveConnection',
            messageData,
            url: sender.url
        };
    
        chrome.windows.create({
            url: `/confirm.html#${windowId}`, width: 500, height: 700, type: 'popup',
        });
    }
}

const approveDapp = (sender) => {
    const confirmData = txToConfirm[getSenderHash(sender)]
    if (!walletIsLocked){
        let keyPair = Lamden.wallet.new_wallet()
        keyPair.sk = encryptString(keyPair.sk)
        const messageData = confirmData.messageData
        if (keyPair.sk){
            console.log(confirmData.url)
            if (!dappsStore[confirmData.url]) dappsStore[confirmData.url] = {}
            if (!dappsStore[confirmData.url][messageData.networkName]) dappsStore[confirmData.url][messageData.networkName] = {}
            dappsStore[confirmData.url][messageData.networkName].contractName = messageData.contractName
            dappsStore[confirmData.url].appName = messageData.dappName
            dappsStore[confirmData.url].vk = keyPair.vk
            console.log(dappsStore)

            coinStore.push({
                'network': 'lamden',
                'name': "Lamden",
                'nickname' : messageData.dappName,
                'symbol': "TAU",
                'vk': keyPair.vk,
                'sk': keyPair.sk
            })
            chrome.storage.local.set({"dapps": dappsStore});
            chrome.storage.local.set({"coins": coinStore});
            sendMessageToTab(confirmData.url, 'sendWalletInfo')
        }else{
            throw new Error('Unable to encrypt private key while approving dapp')
        }
    }else{
        const errors = ['Tried to approve app but wallet was locked']
        sendMessageToTab(confirmData.url, 'sendErrorsToTab', {errors})
    }

}

