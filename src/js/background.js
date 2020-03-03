import '../img/icon-128.png'
import '../img/icon-34.png'

import { encryptObject, decryptObject, encryptStrHash, decryptStrHash, hashStringValue } from './utils.js';
import Lamden from 'lamden-js'

const validators = require('types-validate-assert')
const { validateTypes, assertTypes } = validators

//Settings
let hash;
let firstRun;

//Background Data Stores
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
const LamdenNetworkTypes = ['mainnet','testnet','mockchain']
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

/********************************************************************
 *  Storage handlers to persist the Lamden Wallet in chrome.storage.local
 ********************************************************************/
chrome.storage.local.get(
    {
        "hash": "",
        "coins": [],
        "txs": {},
        "pendingTxs": {},
        "networks":{},
        "dapps":{},
        "settings": {}
    },
    function(getValue) {
        console.log(getValue)
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

/*******************************************************************
 * Sync information in the store with the background page everytime new information is saved.
 * This also will sync data when the svelte stores save to chrome.local.storage
 ********************************************************************/

chrome.storage.onChanged.addListener(function(changes) {
    console.log(changes)
    for (let key in changes) {
        if (key === 'coins') coinStore = changes[key].newValue;
        if (key === 'settings') settingsStore = changes[key].newValue;
        if (key === 'dapps') dappsStore = changes[key].newValue;
        if (key === 'networks') networksStore = changes[key].newValue;
        if (key === 'txs') {
            txStore = changes[key].newValue;
            //alert(JSON.stringify(txStore)); 
        }
        if (key === 'pendingTxs') pendingTxList = changes[key].newValue;
    }
});

/***********************************************************************
 * MISC Functions
 ***********************************************************************/
const isJSON = (json) => {
	if (Object.prototype.toString.call(json) !== "[object String]") return false
    try{
        return JSON.parse(json)
    }catch (e){ return false}
}

const stripRef = (value) => {
    return JSON.parse(JSON.stringify(value))
}

/***********************************************************************
 * Password Functions
 ***********************************************************************/
const validatePassword = (testPassword) => {
    try{
        return decryptObject(testPassword, hash).valid
    } catch (e) {}
    return false
}

/***********************************************************************
 * Wallet Locking Functions
 ***********************************************************************/
const setWalletIsLocked = (status) => {
    walletIsLocked = status;
    sendMessageToApp('walletIsLocked', walletIsLocked)
    sendMessageToAllDapps('sendWalletInfo')
}

/***********************************************************************
 * Encryption / Decryption Functions
 ***********************************************************************/

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


/***********************************************************************
 * CoinStore/Wallet Functions
 ***********************************************************************/

const getWallet = (vk) => {
	return coinStore.find(coin => coin.vk === vk)
}

const coinStoreDelete = (coinInfo) => {
    const before = coinStore.length
    coinStore.splice(coinStore.indexOf(coinInfo), 1);
    if (coinStore.length < before){
        chrome.storage.local.set({"coins": coinStore});
        return true
    }else{
        return false
    }
}

const coinStoreUpdateAllBalances = (networkInfo) => {
    coinStore.forEach((coin) => {
        coinStoreUpdateBalance(coin.vk, networkInfo)
    })
    return true
}

const coinStoreUpdateBalance = async (vk, networkInfo) => {
    let network;
    if (networkInfo){
        network = new Lamden.Network(networkInfo)
    } else {
        network = new Lamden.Network(getCurrentNetwork())
    }
    const foundCoin = coinStore.find(coin => coin.vk === vk)
    if (foundCoin){
        if (!foundCoin.balances) foundCoin.balances = {};
        if (!foundCoin.balances[network.url]) foundCoin.balances[network.url] = 0
        let balance = await network.API.getTauBalance(foundCoin.vk)
        if (parseFloat(parseFloat(balance).toFixed(8)) !== parseFloat(parseFloat(foundCoin.balances[network.url]).toFixed(8))){
            foundCoin.balances[network.url] = balance
            chrome.storage.local.set({"coins": coinStore});
        }
    }
    return true
}

/***********************************************************************
 * NetworkStore / API Functions
 ***********************************************************************/

const getCurrentNetwork = () => {
    const networks = [...networksStore.lamden, ...networksStore.user]
    const foundNetwork = networks.find(network => networksStore.current === `${network.host}:${network.port}`)
    return foundNetwork
}

const getLamdenNetwork = (networkType) => {
    console.log(networkType)
    const foundNetwork = networksStore.lamden.find(network => network.type === networkType.toLowerCase())
    console.log(foundNetwork)
    if (!foundNetwork) return false;
    return foundNetwork;
}

const isAcceptedNetwork = (networkType) => {
    return LamdenNetworkTypes.includes(networkType)
}

const contractExists = (networkType, contractName) => {
    const networkInfo = getLamdenNetwork(networkType)
    if (!networkInfo) return false;
    const network = new Lamden.Network(networkInfo)
    return network.API.contractExists(contractName)
}

/***********************************************************************
 * Transaction Functions
 ***********************************************************************/
const sendTx = (txBuilder, sk, sentFrom) => {
    txBuilder.send(decryptString(sk), () => {
        const txData = txBuilder.getAllInfo()
        saveTxData(txBuilder);
        sendMessageToTab(sentFrom, 'txStatus', txData)
    })
}

const saveTxData = (txBuilder) => {
    const result = txBuilder.txSendResult;
    //alert(JSON.stringify(result))
    const netKey = txBuilder.url;
    const vk = txBuilder.sender;

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

/***********************************************************************
 * dApp Approavl and Handling Functions
 ***********************************************************************/

const validateConnectionMessage = (data) => {
    let errors = [];
    const messageData = isJSON(data)
    if (!messageData) {
        return {errors: ['Expected connect request to be JSON string']}
    }
    if (!validateTypes.isStringWithValue(messageData.appName)) {
        errors.push("'appName' <string> required to process connect request")
    }
    if (!validateTypes.isStringWithValue(messageData.contractName)) {
        errors.push("'contractName' <string> required to process connect request")
    }
    if (validateTypes.isStringWithValue(messageData.networkType)){
        if (!isAcceptedNetwork(messageData.networkType)){
            errors.push(`'networkType' <string> '${messageData.networkType}' is not a valid network type. Valid Types are ${LamdenNetworkTypes}.`)
        }
    }else{
        errors.push("'networkType' <string> required to process connect request")
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

const sendResponse_WalletInfo = (dappInfo, sendResponse) => {
    console.log(settingsStore)
    let installedStatus = {
        version: settingsStore.version,
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
    console.log(messageData)
    let exists = await contractExists(messageData.networkType, messageData.contractName)
    if (!exists) {
        const errors = [`contractName: '${messageData.contractName}' does not exists on '${messageData.networkType}' network.`]
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

const promptApproveTransaction = async (sender, messageData) => {
    console.log(messageData)
    const keypair = Lamden.wallet.new_wallet()
    const windowId = hashStringValue(keypair.vk)
    txToConfirm[windowId] = {
        type: 'ApproveTransaction',
        messageData,
        url: sender.url
    };

    chrome.windows.create({
        url: `/confirm.html#${windowId}`, width: 500, height: 700, type: 'popup',
    });
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
            if (!dappsStore[confirmData.url][messageData.networkType]) dappsStore[confirmData.url][messageData.networkType] = {}
            dappsStore[confirmData.url][messageData.networkType].contractName = messageData.contractName
            dappsStore[confirmData.url].appName = messageData.appName
            dappsStore[confirmData.url].url = confirmData.url
            dappsStore[confirmData.url].vk = keyPair.vk
            console.log(dappsStore)

            coinStore.push({
                'network': 'lamden',
                'name': "Lamden",
                'nickname' : messageData.appName,
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

const approveTransaction = (sender) => {
    const confirmData = txToConfirm[getSenderHash(sender)]
    if (!walletIsLocked){
        const txData = confirmData.messageData.txData;
        const wallet = confirmData.messageData.wallet;
        const txBuilder = new Lamden.TransactionBuilder(txData.networkInfo, txData.txInfo)
        sendTx(txBuilder, wallet.sk, sender.url)
    }else{
        const errors = ['Tried to send transaction app but wallet was locked']
        sendMessageToTab(confirmData.url, 'sendErrorsToTab', {errors})
    }
}

/***********************************************************************
 * Chrome Extention Messaging Helpers Functions
 ***********************************************************************/
const fromApp = (url) => {
    return url === `${window.location.origin}/app.html`
}

const fromAuthorizedDapp = (url) => {
    if (!getDappInfo(url)) return false
    return true
}

const getDappInfo = (url) => {
    if (!dappsStore[url]) return false
    return dappsStore[url]
}

const fromConfirm = (url) => {
    return url.split('#')[0] === `${window.location.origin}/confirm.html`
}

const getSenderHash = (sender) => {
    return sender.url.split('#')[1]
}

const sendTxErrorResponse = (status, errors, rejected, sendResponse) => {
    sendResponse({status, errors, rejected});
}

//Send a message to the tab that the App currently open in
const sendMessageToApp = (type, data) => {
    const appTab = `${window.location.origin}/app.html`
    sendMessageToTab(appTab, type, data)
}

//Send a message to a dApp open in tab
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

//Send a message to all dApps open in tabs
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

/*****************************************************************************
 * In App/Dapp message handling
 * This routine is a 'sender' filter for chrome extention message API to seperate messages from the App itself
 * from outside webpages.  This isolates the sensitive information stored in the background page to the App and autorized Dapps.
 *****************************************************************************/
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (chrome.runtime.lastError) return;
    const isFromAuthorizedDapp = fromAuthorizedDapp(sender.url);
    const dappInfo = isFromAuthorizedDapp ? getDappInfo(sender.url) : undefined;
    const isFromApp = fromApp(sender.url);
    const isFromConfirm = fromConfirm(sender.url);

    console.log(message)
    console.log(sender)
    console.log(isFromAuthorizedDapp)
    console.log(dappInfo)
    console.log(isFromApp)
    console.log(isFromConfirm)


    //Reject any messages not from the App itself of from the autorized Dapp List.
    if (!isFromAuthorizedDapp && !isFromApp && !isFromConfirm){
        console.log('in here')
        /*************************************************
         ** UNAUTHOIZED MESSAGE PROCESSING
        **************************************************/
       //Process messages from dApps that want to be authorized
        if (message.type === 'lamdenWalletConnect') {
            if (walletIsLocked){
                sendResponse({errors:["Wallet is Locked"]})
                return
            }
            //Make sure the connection request is valid before processing; return erros to dApp
            const connectionMessage = validateConnectionMessage(message.data)
            if (validateTypes.hasKeys(connectionMessage, ['errors'])){
                sendResponse(connectionMessage)
                return
            }else{
                //Open Confirm popup to the user to approve the app
                promptApproveDapp(sender, connectionMessage)
                sendResponse("ok")
            }
        }else{
            sendResponse(`You must be an authorized dApp to send message type ${message.type}. Send 'lamdenWalletConnect' event first to authorize.`)
        }
    }else{
        /*************************************************
         ** MESSAGES FROM THE LAMDEN WALLET APP 
        **************************************************/
        if (isFromApp){
            //Create password on initial "firstRun" setup
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
            //Check if the wallet has been setup yet
            if(message.type === 'isFirstRun'){
                sendResponse(firstRun)
            }
            //Unlock the wallet
            if (message.type === 'unlockWallet') {
                //Validate the password is correct first
                if (validatePassword(message.data)){
                    current = message.data
                    //Unlock wallet
                    setWalletIsLocked(false)
                }
                sendResponse(walletIsLocked)
            }
            //Check the password is correct
            if (message.type === 'validatePassword') sendResponse(validatePassword(message.data))
            //Respond to request checking if the wallet is locked
            if (message.type === 'walletIsLocked') sendResponse(walletIsLocked)
            //Lock the wallet
            if (message.type === 'lockWallet') setWalletIsLocked(true)
            //encrypt a passed in string with the user's hashed password (should be an sk)
            if (message.type === 'encryptSk') sendResponse(encryptString(message.data))

            //Only Allow access to these messages processors if the wallet is Unlocked
            if (!walletIsLocked){
                //decrypt a passed in string using the user's hashed password (should be an sk)
                if (message.type === 'decryptSk') sendResponse(decryptString(message.data))
                //Create a keystore file that is encrypted with a new password, decrypting all sk's first
                if (message.type === 'backupCoinstore') sendResponse(createKeystore(message.data))
                //Decrypt all keys, for use when user wants to view their secret keys in the UI
                if (message.type === 'decryptStore') sendResponse(decryptedKeys())
                //Delete a coin/wallet from the coinStore
                if (message.type === 'coinStoreDelete') sendResponse(coinStoreDelete(message.data))
                //Call the currentNetwork API to refresh all balances in the coinStore
                if (message.type === 'coinStoreUpdateAllBalances') sendResponse(coinStoreUpdateAllBalances(message.data))
                //Call the currentNetwork API to refresh the balance of 1 coin/wallet in the coinStore
                if (message.type === 'coinStoreUpdateBalance') sendResponse(coinStoreUpdateBalance(message.data))
                //Create and Send a transaction to the currentNetwork Masternode
                if (message.type === 'sendLamdenTransaction'){
                    let txInfo = message.data;
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
            }
        }

        /*************************************************
         ** MESSAGES FROM THE LAMDEN WALLET CONFIRM POPUP
        **************************************************/
        if (isFromConfirm){
            //Get the window Hash
            let confirmHash = sender.url.split('#')[1]
            //recover the information about the request being confirmed
            if (message.type === 'getConfirmInfo'){
                console.log(confirmHash)
                console.log(txToConfirm[confirmHash])
                try {
                    sendResponse(txToConfirm[confirmHash])
                } catch (e){}
                sendResponse(false)
            }

            if (message.type === 'approveConfirm'){
                approveDapp(sender)
            }

            if (message.type === 'approveTransaction'){
                approveTransaction(sender)
            }
        }

        /*************************************************
         ** MESSAGES FROM AUTHORIZED DAPPs
        **************************************************/
        if (isFromAuthorizedDapp){
            //Send specifics about the wallet that the dApp may need to handle
            if (message.type === 'getWalletInfo') sendResponse_WalletInfo(dappInfo, sendResponse);

            //Process a transaction request sent from the dApp; same as from the Lamden Wallet App with two differences
            // 1) For security the txInfo contractName is populated/overwritten by the LamdenWallet as the one that was approved by the user
            // 2) The Wallet sets/overwrites the "senderVK" in txInfo to the one created for the dApp upon authorization.
            // This means that a dApp can only send transactions that were approved by the user in the original connection request
            if (message.type === 'dAppSendLamdenTransaction'){
                const errorStatus = `Unable to process transaction`
                const rejectedTx = message.data
                if (walletIsLocked){
                    sendTxErrorResponse(errorStatus, ['Wallet is Locked'], rejectedTx, sendResponse)
                }else{
                    let txInfo = {};
                    let errors = []
                    
                    try{
                        //Make sure the txInfo was a JSON string (for security)
                        txInfo = JSON.parse(message.data)
                        //Validate a network Name was passed as it will be needed later
                        assertTypes.isStringWithValue(txInfo.networkType)
                    } catch (err) {
                        sendTxErrorResponse(errorStatus, ['Failed to Parse JSON object', err.message], rejectedTx, sendResponse)
                    }
                    console.log(txInfo)
                    //Reject transaction attempt if network type has not been approved
                    if (!dappInfo[txInfo.networkType]) {
                        errors = [`Transactions on ${txInfo.networkType} have not been approved for ${dappInfo.url}.`]
                        sendTxErrorResponse(errorStatus, errors, rejectedTx, sendResponse)
                    }
                    
                    //Find the wallet in the coinStore that is assocated with this dapp (was created specifically for this dApp during authorization)
                    const wallet = getWallet(dappInfo.vk);
                    errors = [`Error: Expected to find entry in Lamden Wallet for dApp ${dappInfo.url} but no matching keypair exists for vk: ${dappInfo.vk}.  Submit new Connection request to have a new one created.`]
                    if (!wallet) sendTxErrorResponse(errorStatus, errors, rejectedTx, sendResponse)
                    
                    //Get the Lamden Network Object for the network types specified in the txInfo request 
                    const network = getLamdenNetwork(txInfo.networkType)
                    if (!network) {
                        errors = [`'networkType' <string> '${txInfo.networkType}' is not a valid network type. Valid types are ${LamdenNetworkTypes}.`]
                        sendTxErrorResponse(errorStatus, errors, rejectedTx, sendResponse);
                    }
                    
                    try{
                        //Create a unique ID for this transaction for reference later if needed
                        txInfo.uid = encryptString(wallet.vk, 'tracking-id')
                        //Set senderVk to the one assocated with this dapp
                        txInfo.senderVk = wallet.vk;
                        //Set the contract name to the one approved by the user for the dApp
                        txInfo.contractName = dappInfo[txInfo.networkType].contractName
                        //Create a Lamden Transaction
                        const txBuilder = new Lamden.TransactionBuilder(network, txInfo)
                        //Send dummp response so message tunnel doesn't error
                        sendResponse("ok")
                        const info = (({ appName, url }) => ({ appName, url }))(dappInfo);
                        const txData = txBuilder.getAllInfo()
                        promptApproveTransaction(sender, {txData, wallet, dappInfo: info})
                    }catch (err){
                        sendTxErrorResponse(errorStatus, ['Unable to Build Lamden Transaction', err.message], rejectedTx, sendResponse);
                    }
                }
            }
        }
    }
});