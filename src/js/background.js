import '../img/icon-128.png'
import '../img/icon-34.png'
import { encryptObject, decryptObject, encryptStrHash, decryptStrHash } from './utils.js';

import Lamden from 'lamden-js'

//Settings
let hash;
let firstRun;

//Background Store copies
let coinStore;
let settingsStore;
let networksStore;
let txStore;


//Misc Values
let pendingTxList;
let current = '';
let walletIsLocked = true;
//chrome.storage.local.set({"hash": ""});

chrome.storage.local.get(
    {
        "hash": "",
        "coins": [],
        "txs": {},
        "pendingTxs": {},
        "networks":{},
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
    }
)

chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (let key in changes) {
        if (key === 'coins') coinStore = changes[key].newValue;
        if (key === 'networks') networksStore = changes[key].newValue;
        if (key === 'txs') {
            
            txStore = changes[key].newValue;
            //alert(JSON.stringify(txStore)); 
        }
        if (key === 'pendingTxs') pendingTxList = changes[key].newValue;
    }
});

function fromApp(sender){
    return sender.url === `${window.location.origin}/app.html`
}

function stripRef(value){
    return JSON.parse(JSON.stringify(value))
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
        if (message.type === 'encryptSk') {
            console.log(message.data)
            sendResponse(encryptString(message.data))
        }
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

function validatePassword(testPassword){
    console.log(hash)
    try{
        return decryptObject(testPassword, hash).valid
    } catch (e) {}
    return false
}

function setWalletIsLocked(status){
    walletIsLocked = status;
    chrome.runtime.sendMessage({type: 'walletIsLocked', data: walletIsLocked})
}

function encryptString(string){
    try{
        return encryptStrHash(current, string);
    }catch(e){console.log(e)}
    return false;
}

function decryptString(string){
    try{
        return decryptStrHash(current, string);
    }catch(e){console.log(e)}
    return false;
}

function getWallet(vk){
	return coinStore.find(coin => coin.vk === vk)
}

function getCurrentNetwork(){
    let networks = [...networksStore.lamden, ...networksStore.user]
    let foundNetwork = networks.find(network => networksStore.current === `${network.host}:${network.port}`)
    return foundNetwork
}

function sendTx(txBuilder, sk, sentFrom){
    txBuilder.send(decryptString(sk), () => {
        let txData = txBuilder.getAllInfo()
        saveTxData(txBuilder);
        sendMessageToTab(sentFrom, txData)
    })
}

function saveTxData(txBuilder){
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

function sendMessageToTab(url, data){
    chrome.windows.getAll({populate:true},function(windows){
        windows.forEach((window) => {
            window.tabs.forEach((tab) => {
                if (url === tab.url){
                    chrome.tabs.sendMessage(tab.id, {type: 'txResult', data});  
                }
            });
        });
    });
}


function createKeystore(info) {
    return JSON.stringify({
        data: encryptObject(info.pwd, {'version' : info.version, keyList: decryptedKeys()}),
        w: info.hint === "" ? "" : encryptStrHash(info.obscure, info.hint),
    });
}

function decryptedKeys(){
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

