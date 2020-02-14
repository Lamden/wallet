import '../img/icon-128.png'
import '../img/icon-34.png'
import { encryptObject, decryptObject, encryptStrHash, decryptStrHash } from './utils.js';

import { createNetworksStore } from './stores/networksStore.js' 
import { TransactionBuilder } from './lamden/transactionBuilder.js'

let password = '';
let walletIsLocked = true;
let hash;
let coinStore;
let txStore;
/*
chrome.storage.local.remove(["txs"], function() {
    chrome.storage.local.get({"hash": "", "coins": [], "txs": {}}, function(getValue) {
        hash = getValue.hash
        coinStore = getValue.coins
        txStore = getValue.txs;
    })
})*/

chrome.storage.local.get({"hash": "", "coins": [], "txs": {}}, function(getValue) {
    hash = getValue.hash
    coinStore = getValue.coins
    txStore = getValue.txs;
})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (chrome.runtime.lastError) return;

    if(message.type === 'createPassword'){
        chrome.storage.local.set({"hash" : encryptObject(message.data, {valid: true})}, () => {
            sendResponse(true)
        });
    }

    if (message.type === 'validatePassword') {
        sendResponse(validatePassword(message.data))
    }

    if (message.type === 'unlockWallet') {
        if (validatePassword(message.data)){
            password = message.data
            setWalletIsLocked(false)
        }
        sendResponse(walletIsLocked)
    }

    if (message.type === 'lockWallet') {
        setWalletIsLocked(true)
    }

    if (message.type === 'walletIsLocked') {
        sendResponse(walletIsLocked)
    }

    if (message.type === 'encryptSk') {
        sendResponse(encryptString(message.data))
    }

    if (message.type === 'decryptSk') {
        sendResponse(decryptString(message.data))
    }

    if (message.type === 'sendLamdenTransaction'){
        let wallet = getWallet(message.data.senderVk);
        if (!wallet) sendResponse({status: 'Error: Did not find publc key (vk) in wallet'});
        try{
            message.data.uid = encryptString(wallet.vk, 'tracking-id')
            let txBuilder = new TransactionBuilder(getCurrentNetwork(), message.data)
            sendResponse({status: 'Sending Transaction. await result.'})
            sendTx(txBuilder, wallet.sk)
        }catch (err){
            sendResponse({status: `Failed to create Tx - ${err}`})
        }
    }
});

function validatePassword(testPassword){
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
        return encryptStrHash(password, string);
    }catch(e){}
    return false;
}

function decryptString(string){
    try{
        return decryptStrHash(password, string);
    }catch(e){}
    return false;
}

function getWallet(vk){
	return coinStore.find(coin => coin.vk === vk)
}

function getCurrentNetwork(){
    let NetworksStore = createNetworksStore()
	return NetworksStore.getCurrentNetwork()
}

function sendTx(txBuilder, sk){
    saveTxData(txBuilder)
    txBuilder.send(decryptString(sk), () => updateTxData(txBuilder))
}

function saveTxData(txBuilder){
    let netKey = txBuilder.url;
    let vk = txBuilder.sender;
    //create keys if they don't exist
    if (!txStore[netKey]) txStore[netKey] = {}
    if (!txStore[netKey][vk]) txStore[netKey][vk] = [];

    //Add tx to Store List
    txStore[netKey][vk].push(txBuilder.getAllInfo());

    chrome.storage.local.set({"txs": txStore});
    alert('SAVING TO STORE: ' + JSON.stringify(txStore))
}

function updateTxData(){
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
}

chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (let key in changes) {
        if (key === 'coins') coinStore = changes[key].newValue;
        if (key === 'txs') txStore = changes[key].newValue;
    }
});