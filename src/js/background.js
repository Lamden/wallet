import '../img/icon-128.png'
import '../img/icon-34.png'

import { encryptObject, decryptObject, encryptStrHash, decryptStrHash, hashStringValue } from './utils.js';
import Lamden from 'lamden-js'
import Ethereum from './crypto/ethereum'

const validators = require('types-validate-assert')
const { validateTypes, assertTypes } = validators

//Settings
const appRoute = 'app.html'
let hash;
let firstRun;
let nonceRetryTimes = 5
let nonceRetryWaitTime = 1000

//Background Data Stores
let vault
let coinStore = [];
let dappsStore;
let settingsStore;
let networksStore;
let balancesStore;
let txStore;
let pendingTxStore;


//Misc Values.
let vaultNotCreated = false;
let txSaveList = [];
let txToConfirm = {};
let nonceCache = {};
let current = '';
let lastSentDate = new Date()
let walletIsLocked = true;
let updatingBalances = false;
let checkingTransactions = false;
let savingTransactions = false;
const LamdenNetworkTypes = ['mainnet','testnet','mockchain']

/********************************************************************
 *  Storage handlers to persist the Lamden Wallet in chrome.storage.local
 ********************************************************************/
chrome.storage.local.get(
    {
        "hash": "",  //depreciated for vault storage
        "vault": "", 
        "coins": [],
        "txs": {},
        "balances":{},
        "pendingTxs": [],
        "networks":{},
        "dapps":{},
        "settings": {}
    },
    function(getValue) {
        hash = getValue.hash  //depreciated for vault storage
        vault = getValue.vault
        if (vault === "" && validateTypes.isStringWithValue(hash)) coinStore = getValue.coins;
        firstRun = hash === "" && vault === "" ? true : false;
        balancesStore = getValue.balances;
        txStore = getValue.txs;
        networksStore = getValue.networks;
        settingsStore = getValue.settings;
        pendingTxStore = getValue.pendingTxs;
        dappsStore = getValue.dapps;
        /********************************************************************
         *  Setup for testing
         ********************************************************************/
        //Expose Ethereum Controller on window so it can be accesses durring testing
        if (navigator.webdriver == true && firstRun) {
            window.walletEthereum = Ethereum
            window.deleteCoin = coinStoreDelete
        }
    }
)

/*******************************************************************
 * Sync information in the store with the background page everytime new information is saved.
 * This also will sync data when the svelte stores save to chrome.local.storage
 ********************************************************************/
chrome.storage.onChanged.addListener(function(changes) {
    for (let key in changes) {
        if (key === 'vault') vault = changes[key].newValue;
        if (key === 'settings') settingsStore = changes[key].newValue;
        if (key === 'dapps') dappsStore = changes[key].newValue;
        if (key === 'networks') networksStore = changes[key].newValue;
        if (key === 'txs') {
            txStore = changes[key].newValue;
            savingTransactions = false;
        }
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

const addCharAtEnd = (string, char) => {
    if (string.charAt(string.length-1) === char) return string
    return string + char
}

const addCharAtStart = (string, char) => {
    if (string.charAt(0) === char) return string
    return char + string
}

/***********************************************************************
 * Password Functions
 ***********************************************************************/
const validatePasswordFromHash = (testPassword) => {
    try{
        return decryptObject(testPassword, hash).valid
    } catch (e) {}
    return false
}

const validatePasswordFromVault = (testPassword) => {
    try{
        return  validateTypes.isObject(decryptObject(testPassword, vault))
    } catch (e) {}
    return false
}

/***********************************************************************
 * Settings Store Functions
 ***********************************************************************/
const setDissmissFlag = (value) => {
    settingsStore.dismissWarning = value
    chrome.storage.local.set({"settings": settingsStore});
}

/***********************************************************************
 * Wallet Locking Functions
 ***********************************************************************/
const setWalletIsLocked = (status) => {
    walletIsLocked = status;
    if (walletIsLocked) {
        wipeCoinsStorage()
        current = ""
    }
    else setCoinsStorage()
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
 * BalancesStore Updating TAU balances
 ***********************************************************************/
const balancesStoreUpdateOne = (vk, networkInfo) => {
    if (!updatingBalances){
        updatingBalances = true;
        balancesStoreUpdateVk(vk, networkInfo)
        .then((res) => {
            if (!updatingBalances && res){
                chrome.storage.local.set({"balances": balancesStore}, () =>{
                    updatingBalances = false;
                });
            }
        })
    }
}

const balancesStoreUpdateAll = (networkInfo) => {
    if (typeof coinStore !== 'undefined'){
        balancesStore = {};
        const coinsToProcess = coinStore.length; 
        if (coinsToProcess > 0){
            let coinsProcessed = 0;
            updatingBalances = true;
            coinStore.forEach((coin) => {
                const watchOnly = coin.sk === "watchOnly"
                balancesStoreUpdateVk(coin.vk, networkInfo, watchOnly)
                .then(() => {
                    coinsProcessed = coinsProcessed + 1
                    if (coinsProcessed >= coinsToProcess){
                        chrome.storage.local.set({"balances": balancesStore}, () =>{
                            updatingBalances = false;
                        });
                    }
                })
            })
        }else{
            updatingBalances = true;
            chrome.storage.local.set({"balances": balancesStore}, () =>{
                updatingBalances = false;
            });
        }
    }
}

const balancesStoreUpdateVk = async (vk, networkInfo, watchOnly) => {
    let network;
    if (networkInfo){
        network = new Lamden.Network(networkInfo)
    } else {
        network = new Lamden.Network(getCurrentNetwork())
    }
    if (!balancesStore[network.url]) balancesStore[network.url] = {}
    if (!balancesStore[network.url][vk]) balancesStore[network.url][vk] = {}
    if (!balancesStore[network.url][vk].balance) balancesStore[network.url][vk] = {balance: 0, watchOnly}
    balancesStore[network.url][vk].watchOnly = watchOnly
    const currentBalance = balancesStore[network.url][vk].balance
    let newBalance = await network.API.getCurrencyBalance(vk)
    if (parseFloat(parseFloat(newBalance).toFixed(8)) != parseFloat(parseFloat(currentBalance).toFixed(8))){
        balancesStore[network.url][vk].balance = newBalance
        return true;
    }else{
        return false
    }
}

/***********************************************************************
 * CoinStore/Wallet Functions
 ***********************************************************************/
const getWallet = (vk) => {
	return coinStore.find(coin => coin.vk === vk)
}

const getSanatizedWallets = () => {
    let network = new Lamden.Network(getCurrentNetwork())
    return coinStore.map(coin => {
        if (!validateTypes.isObjectWithKeys(balancesStore[network.url][coin.vk])) return null
        if (balancesStore[network.url][coin.vk].watchOnly) return null
        return {
            vk: coin.vk,
            nickname: coin.nickname,
            balance: balancesStore[network.url][coin.vk].balance
        }
    }).filter(coin => coin)
}

const coinStoreAddNewLamdenCoin = (nickname) => {
    const keyPair = Lamden.wallet.new_wallet()
    const coinInfo = {
        'network': 'lamden',
        'name': "Lamden",
        nickname,
        'symbol': "TAU",
        'vk': keyPair.vk,
        'sk': keyPair.sk
    }
    let result = coinStoreAddCoin(coinInfo)
    result.vk = coinInfo.vk 
    try{
        return result
    }finally{
        refreshCoinStore();
    }
}
const coinStoreAddOne = (coinInfo) => {
    let result = coinStoreAddCoin(coinInfo)
    try{
        return result
    }finally{
        if (result.added) refreshCoinStore();
    }
}

const coinStoreAddMany = (coins) => {
    if (!validateTypes.isArray(coins)) return {error: `Error processing keyStore. Expected Array of coins but got <${typeof coins}> instead.`}
    let coinAdded = false
    coins.forEach(coin => {
        coin.result = coinStoreAddCoin(coin)
        if (coinStoreAddCoin(coin).added) coinAdded = true
    })
    try{
        return coins
    }finally{
        if (coinAdded) refreshCoinStore();
    }
}

const updateWatchedCoin = (coinFound, coinInfo) => {
    if (coinInfo.sk === 'watchOnly') return false
    if (coinFound.sk === 'watchOnly'){
        coinFound.sk = encryptString(coinInfo.sk)
        return true
    }
    return false
}   

const coinStoreAddCoin = (coinInfo) => {
    let coinFound = getWallet(coinInfo.vk)
    if (coinFound){
        if(updateWatchedCoin(coinFound, coinInfo)) return {added: true, reason: `Updated the private key for '${coinFound.nickname}'`}
        else return {added: false, reason: `Keypair already exists as '${coinFound.nickname}'`}
    }else{
        try{
            if (coinInfo.sk !== 'watchOnly') coinInfo.sk = encryptString(coinInfo.sk)
            coinStore.push(coinInfo)
            return {added: true, reason: `Added ${coinInfo.nickname} to your wallet`}
        }catch (e){
            return {added: false, reason: e.message}
        }
    }
}

const coinStoreDelete = (coinInfo) => {
    const before = coinStore.length
    coinStore.forEach((coin, index) => {
        if (coin.vk === coinInfo.vk) coinStore.splice(index, 1);
    })
    if (coinStore.length < before){
        refreshCoinStore();
        TxStoreDeleteAll(coinInfo.vk)
        return true
    }else{
        return false
    }
}
const vaultCreated = () => {
    return validateTypes.isStringWithValue(vault)
}

const createIntialVault = () => {
    setVaultStorage();
    chrome.storage.local.remove("hash") 
}

const setVaultStorage = () => {
    //Only save the vault if there is a current password
    coinStore.forEach(coin => delete coin.result)
    if (validateTypes.isStringWithValue(current)){
        chrome.storage.local.set({"vault": encryptObject(current, {data: coinStore})})  
    }
}

const decryptVaultStorage = () => {
    try {
        let decryptedStore = decryptObject(current, vault)
        if (typeof decryptedStore.data === "undefined") throw new Error('Could not get vault data')
        coinStore = decryptedStore.data
    }catch (e){
        console.log(e.message)
    }
}

const setCoinsStorage = () => {
    let storeCopy = JSON.parse(JSON.stringify(coinStore))
    storeCopy.forEach(coin => delete coin.sk)
    chrome.storage.local.set({"coins": storeCopy});
}

const wipeCoinsStorage = () => {
    chrome.storage.local.set({"coins": []});
}

const refreshCoinStore = () => {
    setVaultStorage();
    setCoinsStorage();
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
    const foundNetwork = networksStore.lamden.find(network => network.type === networkType.toLowerCase())
    if (!foundNetwork) return false;
    return foundNetwork;
}

const getAllNetworks = () => {
    return [...networksStore.user, ...networksStore.lamden]
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
const sendTx = (txBuilder, sk, sentFrom = false) => {
    lastSentDate = new Date()
    //Get current nonce from the masternode
    txBuilder.getNonce()
    .then(() => {
        //If no nonce exists in the cache for this vk then set what was recieved from the masternode as the baseline
        if (!nonceCache[txBuilder.sender]) {
            nonceCache[txBuilder.sender] = {current: txBuilder.nonce, modifier: 0}
        } else {
            //If the nonce received from the masternode is less than or equal to the nonce that we have in the cache then we need
            //to increment the nonce
            if (txBuilder.nonce <= nonceCache[txBuilder.sender].current + nonceCache[txBuilder.sender].modifier){
                if (nonceCache[txBuilder.sender].modifier >= 14){
                    //Any vk can only have 15 pending transactions in a block
                    //if we have modified the nonce 14 times for this vk then wait to send another tx for this nonce
                    
                    if (typeof txBuilder.retry === 'undefined') txBuilder.retry = 0
                    txBuilder.retry = txBuilder.retry + 1
                    //check if already tried to resend this
                    if (txBuilder.retry > nonceRetryTimes){
                        if (sentFrom){
                            sendMessageToTab(sentFrom, 'txStatus', {txData: txBuilder.getAllInfo(), errors:[
                                'Unable to send transactions. Too many transactions pending in block.'
                            ]})
                        }
                        return
                    }else{
                        //Try and send again after waiting
                        setTimeout(() => {
                            //Resend it after waiting
                            sendTx(txBuilder, sk, sentFrom)
                        }, nonceRetryWaitTime);
                        //Exit method
                        return
                    }
                }else{
                    //Increment nonce
                    nonceCache[txBuilder.sender].modifier = nonceCache[txBuilder.sender].modifier + 1
                    //Set the nonce for the transaction
                    txBuilder.nonce = nonceCache[txBuilder.sender].current + nonceCache[txBuilder.sender].modifier
                }
            }else{
                //If the nonce we got from the masternode is greater than what is in the cache then set it as the new nonce baseline
                nonceCache[txBuilder.sender] =  {current: txBuilder.nonce, modifier: 0}
            }
        }
        //Send transaction
        txBuilder.send(decryptString(sk), () => {
            txBuilder.sentFrom = sentFrom;
            processSendResponse(txBuilder);
            if (sentFrom) sendMessageToTab(sentFrom, 'txStatus', txBuilder.getAllInfo())
        })
    })
}

const sendCurrencyTransaction = (senderVk, to, amount, networkInfo) => {
    let wallet = getWallet(senderVk)
    const txInfo = {
        senderVk: wallet.vk,
        contractName: "currency",
        methodName: "transfer",
        kwargs: {
            "to": to,
            "amount": parseFloat(amount)
        },
        stampLimit: 10000
    }
    
    let txBuilder = new Lamden.TransactionBuilder(networkInfo, txInfo)
    sendTx(txBuilder, wallet.sk)
}

const processSendResponse = (txBuilder) => {
    const result = txBuilder.txSendResult;
    if (result.hash){
        let txData = txBuilder.getAllInfo();
        txData.sentFrom = txBuilder.sentFrom;
        pendingTxStore.push(txData);
    }else{
        addToTxSaveList(txBuilder)
    }
}

const addToTxSaveList = (txBuilder) => {
    txSaveList.push(txBuilder)
}

const processTxSaveList = () =>{
    if (!savingTransactions){
        savingTransactions = true;
        const transactionsToSave = txSaveList.length; 
        let transactionsSaved = 0; 
        txSaveList.forEach(tx => {
            saveToTxStore(tx)
            transactionsSaved = transactionsSaved + 1
            if (transactionsSaved >= transactionsToSave){
                txSaveList = txSaveList.slice(transactionsToSave)
                chrome.storage.local.set({"txs": txStore}, () => {
                    
                });
            }
        })
    }
}

const saveToTxStore = (txBuilder) => {
    const netKey = txBuilder.url;
    const vk = txBuilder.sender;

    //create keys if they don't exist
    if (!txStore[netKey]) txStore[netKey] = {}
    if (!txStore[netKey][vk]) txStore[netKey][vk] = [];

    let txData = {
        hash: txBuilder.txHash,
        nonce: txBuilder.nonce,
        txInfo: txBuilder.getTxInfo(),
        resultInfo: txBuilder.getResultInfo(),
        timestamp: txBuilder.txBlockResult.timestamp || txBuilder.txSendResult.timestamp,
        network: txBuilder.url
    }
    txStore[netKey][vk].push(txData);
}

const checkPendingTransactions = () => {
    if (!checkingTransactions){
        checkingTransactions = true;
        chrome.storage.local.set({"pendingTxs": pendingTxStore}, () => {
            const transactionsToCheck = pendingTxStore.length;
            let transactionsChecked = 0;
            pendingTxStore.forEach(async (tx) => {
                const txBuilder = new Lamden.TransactionBuilder(tx.networkInfo, tx.txInfo, tx)
                await txBuilder.checkForTransactionResult()
                .then(() => {
                    transactionsChecked = transactionsChecked + 1
                    sendMessageToTab(tx.sentFrom, 'txStatus', txBuilder.getAllInfo())
                    const dappInfo = getDappInfoByVK(txBuilder.sender)
                    if (dappInfo) addStampsUsedToDapp(dappInfo.url, txBuilder)
                    addToTxSaveList(txBuilder)
                    if (transactionsChecked >= transactionsToCheck){
                        pendingTxStore = pendingTxStore.slice(transactionsToCheck)
                        chrome.storage.local.set({"pendingTxs": pendingTxStore}, () => {
                            checkingTransactions = false;
                        });
                    }
                })
            })
        });
    }
}

const TxStoreDeleteAll = (vk) => {
    getAllNetworks().forEach(network => {
        const networkObj = new Lamden.Network(network)
        if (typeof txStore[networkObj.url] !== 'undefined'){
            if (typeof txStore[networkObj.url][vk] !== 'undefined') txStore[networkObj.url][vk] = []
        }
    })
    chrome.storage.local.set({"txs": txStore});
}

/***********************************************************************
 * dApp Approavl and Handling Functions
 ***********************************************************************/
const validateConnectionMessage = (data) => {
    const formats = ['number', 'string']
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
    if (!validateTypes.isStringWithValue(messageData.logo)) {
        errors.push("'logo' <string> required to process connect request")
    }
    if (typeof messageData.background !== 'undefined') {
        if (!validateTypes.isStringWithValue(messageData.background)) {
            errors.push("'background' <string> was provided but invalid.")
        }
    }
    if (typeof messageData.reapprove !== 'undefined'){
        if (!validateTypes.isBoolean(messageData.reapprove)) {
            errors.push(`'reapprove' <boolean> can not be ${typeof messageData.reapprove}`)
        }else{
            if (typeof messageData.newKeypair !== 'undefined'){
                if (!validateTypes.isBoolean(messageData.newKeypair)) {
                    errors.push(`'newKeypair' <boolean> can not be ${typeof messageData.newKeypair}`)
                }
            }else{
                messageData.newKeypair = false;
            }
        }
    }else{
        messageData.reapprove = false;
        messageData.newKeypair = false;
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
    if (typeof messageData.charms !== 'undefined') {
        if (validateTypes.isArrayWithValues(messageData.charms)){
            messageData.charms.forEach((charm, index) => {
                if (!validateTypes.isObject(charm)) errors.push(`'charm[${index}]' is not an object`)
                else{
                    if (!validateTypes.isStringWithValue(charm.name)) errors.push(`'charm[${index}]' no 'name' property defiend`)
                    if (!validateTypes.isStringWithValue(charm.variableName)) errors.push(`'charm[${index}]' no 'variableName' property defiend`)
                    if (typeof charm.formatAs !== 'undefined') {
                        if (validateTypes.isStringWithValue(charm.formatAs)){
                            if (!formats.includes(charm.formatAs.toLowerCase())) {
                                errors.push(`'charm[${index}]' formatAs value '${charm.formatAs}' is invalid. Only acceptable values are ${formats}.`)
                            }
                        }else{
                            errors.push(`'charm[${index}]' formatAs value '${charm.formatAs}' is invalid. Only acceptable values are ${formats}.`)
                        }
                    }
                }
            })
        }else{
            errors.push("If provided, the 'charms' property must be an <array>.")
        }
    }
    if (errors.length > 0) {
        return {'errors': errors}
    }
    return messageData
}

const sendResponse_WalletInfo = (dappInfo, sendResponse) => {
    let installedStatus = {
        version: settingsStore.version,
        installed: true,
        setup: !firstRun,
        locked: walletIsLocked,
        wallets: []
    }
    if (installedStatus.locked === false){
        installedStatus.wallets = [dappInfo.vk]
        let approvals = {}
        Object.keys(dappInfo).forEach(key => {
            if(LamdenNetworkTypes.includes(key)) approvals[key] = {
                contractName: dappInfo[key].contractName
            }
        })
        installedStatus.approvals = approvals
    }
    sendResponse(installedStatus)
}

const promptApproveDapp = async (sender, messageData) => {
    let exists = await contractExists(messageData.networkType, messageData.contractName)
    if (!exists) {
        const errors = [`contractName: '${messageData.contractName}' does not exists on '${messageData.networkType}' network.`]
        sendMessageToTab(sender.origin, 'sendErrorsToTab', {errors})
    }else{
        const keypair = Lamden.wallet.new_wallet()
        const windowId = hashStringValue(keypair.vk)
        messageData.network = getCurrentNetwork()
        messageData.accounts = getSanatizedWallets()
        txToConfirm[windowId] = {
            type: 'ApproveConnection',
            messageData,
            url: sender.origin
        };
        chrome.windows.create({
            url: `/confirm.html#${windowId}`, width: 500, height: 700, type: 'popup',
        });
    }
}

const promptApproveTransaction = async (sender, messageData) => {
    const keypair = Lamden.wallet.new_wallet()
    const windowId = hashStringValue(keypair.vk)
    txToConfirm[windowId] = {
        type: 'ApproveTransaction',
        messageData,
        url: sender.origin
    };

    chrome.windows.create({
        url: `/confirm.html#${windowId}`, width: 500, height: 700, type: 'popup',
    });
}
const promptCurrencyApproval = async (sender, messageData) => {
    console.log(messageData)
    const keypair = Lamden.wallet.new_wallet()
    const windowId = hashStringValue(keypair.vk)
    txToConfirm[windowId] = {
        type: 'CurrencyApproval',
        messageData,
        url: sender.origin
    };

    chrome.windows.create({
        url: `/confirm.html#${windowId}`, width: 500, height: 700, type: 'popup',
    });
}

const approveDapp = (sender, approveInfo) => {
    const confirmData = txToConfirm[getSenderHash(sender)]
    if (!walletIsLocked){
        const dappInfo = getDappInfo(confirmData.url)
        const messageData = confirmData.messageData
        let newWallet;
        if ((dappInfo && messageData.newKeypair) || !dappInfo){
            newWallet = coinStoreAddNewLamdenCoin(messageData.appName).vk
        }else{
            newWallet = dappInfo.vk
        }
        if (newWallet){
            DappStoreAddNew(confirmData.url, newWallet, messageData, approveInfo.trustedApp)
            let network = new Lamden.Network(confirmData.messageData.network)
            if (approveInfo.fundingInfo){
                sendCurrencyTransaction( approveInfo.fundingInfo.account.vk, newWallet, approveInfo.fundingInfo.amount, network)
            }
            sendMessageToTab(confirmData.url, 'sendWalletInfo')
        }else{
            delete txToConfirm[getSenderHash(sender)]
            throw new Error('Unable to encrypt private key while approving dapp')
        }
    }else{
        const errors = ['Tried to approve app but wallet was locked']
        sendMessageToTab(confirmData.url, 'sendErrorsToTab', {errors})
    }
    delete txToConfirm[getSenderHash(sender)]
}

const rejectDapp = (sender) => {
    const confirmData = txToConfirm[getSenderHash(sender)]
    sendMessageToTab(confirmData.url, 'sendErrorsToTab', {errors: ['User rejected connection request']})
    delete txToConfirm[getSenderHash(sender)]
}

const rejectTx = (sender) => {
    const confirmData = txToConfirm[getSenderHash(sender)]
    const { txInfo }  = confirmData.messageData.txData
    sendMessageToTab(confirmData.url, 'txStatus', {status: 'Transaction Cancelled', errors: ['User closed Popup window'], rejected: JSON.stringify(txInfo) })
    delete txToConfirm[getSenderHash(sender)]
}

const approveTransaction = (sender) => {
    const confirmData = txToConfirm[getSenderHash(sender)]
    if (!walletIsLocked){
        const txData = confirmData.messageData.txData;
        const wallet = confirmData.messageData.wallet;
        const txBuilder = new Lamden.TransactionBuilder(txData.networkInfo, txData.txInfo, txData)
        sendTx(txBuilder, wallet.sk, confirmData.url)    
    }else{
        const errors = ['Tried to send transaction app but wallet was locked']
        sendMessageToTab(confirmData.url, 'sendErrorsToTab', {errors})
    }
    delete txToConfirm[getSenderHash(sender)]
}

const DappStoreAddNew = (appUrl, vk, messageData, trustedApp) => {
    //remvove trailing slash from url
    if (!dappsStore[appUrl]) dappsStore[appUrl] = {}
    if (!dappsStore[appUrl][messageData.networkType]) dappsStore[appUrl][messageData.networkType] = {}
    dappsStore[appUrl][messageData.networkType].contractName = messageData.contractName
    dappsStore[appUrl][messageData.networkType].trustedApp = trustedApp;
    //Remove slashes at start of icon paths
    if (validateTypes.isArrayWithValues(messageData.charms)){
        messageData.charms.forEach(charm => {
            charm.iconPath = addCharAtStart(charm.iconPath, '/')
        })
        dappsStore[appUrl][messageData.networkType].charms = messageData.charms
    }
    dappsStore[appUrl].appName = messageData.appName
    dappsStore[appUrl].logo = addCharAtStart(messageData.logo, '/')
    if (validateTypes.isStringWithValue(messageData.background)){
        dappsStore[appUrl].background = addCharAtStart(messageData.background, '/')
    }
    dappsStore[appUrl].url = appUrl
    dappsStore[appUrl].vk = vk
    chrome.storage.local.set({"dapps": dappsStore});
}

const DappStoreDelete = (vk) => {
    let dappInfo = getDappInfoByVK(vk)
    if (dappInfo) {
        delete dappsStore[dappInfo.url]
        chrome.storage.local.set({"dapps": dappsStore});
    }
}

const DappStoreRevoke = (data) => {
    try{
        data.networks.forEach(networkType => {
            delete dappsStore[data.dappInfo.url][networkType]
        })
        chrome.storage.local.set({"dapps": dappsStore});
    }catch(e){
        return false
    }
    return true
}

const DappStoreReassign = (data) => {
    const { dappInfo, newVk } = data;
    try{
        dappsStore[dappInfo.url].vk = newVk
        chrome.storage.local.set({"dapps": dappsStore});
    }catch(e){
        return false
    }
    return true
}

const addStampsUsedToDapp = (appUrl, txBuilder) => {
    try {
        dappsStore[appUrl][txBuilder.type].stampsUsed = dappsStore[appUrl][txBuilder.type].stampsUsed + txBuilder.resultInfo.stampsUsed
        chrome.storage.local.set({"dapps": dappsStore});
    }catch(e){}
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

const dappVkInWallet = (vk) => {
    const coin = coinStore.find(coin => vk === coin.vk)
    if (!coin) return false
    return true   
}

const getDappInfoByVK = (vk) => {
    let dapp = Object.keys(dappsStore).find(f => dappsStore[f].vk === vk )
    if (dapp) return dappsStore[dapp]
    return false
}

const fromConfirm = (url) => {
    return url.split('#')[0] === `${window.location.origin}/confirm.html`
}

const getSenderHash = (sender) => {
    return sender.url.split('#')[1]
}

const sendTxErrorResponse = (status, errors, rejected, sendResponse) => {
    sendResponse({data:{status, errors, rejected}});
}

//Send a message to the tab that the App currently open in
const sendMessageToApp = (type, data) => {
    const appTab = `${window.location.origin}/${appRoute}`
    chrome.windows.getAll({populate:true},function(windows){
        windows.forEach((window) => {
            window.tabs.forEach((tab) => {
                var urlObj = new URL(tab.url)
                if (appTab === urlObj.href){
                    chrome.tabs.sendMessage(tab.id, {type, data});  
                }
            });
        });
    });
}

//Send a message to a dApp open in tab
const sendMessageToTab = (url, type, data, route) => {
    chrome.windows.getAll({populate:true},function(windows){
        windows.forEach((window) => {
            window.tabs.forEach((tab) => {
                var urlObj = new URL(tab.url)
                if (url === urlObj.origin){
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
                    var urlObj = new URL(tab.url)
                    if (urlObj.origin === dapp){
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
    const isFromAuthorizedDapp = fromAuthorizedDapp(sender.origin); 
    const dappInfo = isFromAuthorizedDapp ? getDappInfo(sender.origin) : undefined;
    const isFromApp = fromApp(sender.url);
    const isFromConfirm = fromConfirm(sender.url);


    //Error on Stale dApp Approval (dApp was approved by the vk no longer exists in the uesr's wallet for whatever reason)
    if (isFromAuthorizedDapp && !dappVkInWallet(dappInfo.vk) && !walletIsLocked){
        let staleWallet = false;
        //Don't error if this is a reconnect attempt to rectify this issue
        try{
            if (message.type !== 'lamdenWalletConnect') throw new Error('Stale Wallet')
            let messageData = JSON.parse(message.data)
            if (!messageData.reapprove || !messageData.newKeypair) throw new Error('Stale Wallet')
        }catch (e){
            staleWallet = true;
        }
        if (staleWallet) {
            sendResponse({errors:[
                "Your dApp was previously approved but no matching vk is currently found in the wallet. " +  
                 `Prompt the user to restore their keypair for vk '${dappInfo.vk}', ` +
                 "or add 'reapprove = true, newKeypair = true' to your approve request to have a new keypair generated."
            ]})
            return
        }
    }

   /*************************************************
    ** AUTHORIZATION MESSAGES
    **************************************************/
    //Process connection messages to have the user authorize an app
    if (message.type === 'lamdenWalletConnect') {
        //Reject if wallet is locked as we won't have the user's password stored to encrypt the new keypair
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
            try{
                //If this dApp is already approved then let it know that so we don't bother the user again
                if (dappInfo[connectionMessage.networkType].contractName === connectionMessage.contractName){
                    //Ignore if this is a reapprove request
                    if (!connectionMessage.reapprove) {
                        sendResponse({errors:[
                            `App is already authorized to use ${connectionMessage.contractName} on ${connectionMessage.networkType}`
                        ]})
                        return
                    }
                }
            }catch (e){}

            promptApproveDapp(sender, connectionMessage)
            return
        }
    }

    //Reject any messages not from the App itself of from the autorized Dapp List.
    if (!isFromAuthorizedDapp && !isFromApp && !isFromConfirm){
        sendResponse({errors:[
            `You must be an authorized dApp to send this message type. Send 'lamdenWalletConnect' event first to authorize.`
        ]})
    }else{
        /*************************************************
         ** MESSAGES FROM THE LAMDEN WALLET APP 
        **************************************************/
        if (isFromApp){
            //Create password on initial "firstRun" setup
            if(message.type === 'createPassword'){
                try{
                    current = message.data
                    //walletIsLocked = false;
                    setVaultStorage()
                    firstRun = false;
                    sendResponse(true)
                    setWalletIsLocked(false)
                } catch (e){sendResponse(false)}
            }
            //Check if the wallet has been setup yet
            if(message.type === 'isFirstRun'){
                sendResponse(firstRun)
            }
            //Unlock the wallet
            if (message.type === 'unlockWallet') {
                //Validate the password is correct first
                if (vaultCreated()){
                    if (validatePasswordFromVault(message.data)){
                        current = message.data
                    }
                }else{
                    if(validatePasswordFromHash(message.data)){
                        current = message.data
                        createIntialVault()
                    }
                }
                if (validateTypes.isStringWithValue(current)){
                    decryptVaultStorage()
                    setWalletIsLocked(false)
                }
                sendResponse(walletIsLocked)
            }
            //Check the password is correct
            if (message.type === 'validatePassword') sendResponse(validatePasswordFromVault(message.data))
            //Respond to request checking if the wallet is locked
            if (message.type === 'walletIsLocked') sendResponse(walletIsLocked)
            //Lock the wallet
            if (message.type === 'lockWallet') {
                setWalletIsLocked(true); 
                sendResponse('ok')
            }
            //encrypt a passed in string with the user's hashed password (should be an sk)
            if (message.type === 'encryptSk') sendResponse(encryptString(message.data))

            //Only Allow access to these messages processors if the wallet is Unlocked
            if (!walletIsLocked){
                //decrypt a passed in string using the user's hashed password (should be an sk)
                if (message.type === 'decryptSk') sendResponse(decryptString(message.data))
                //Create a keystore file that is encrypted with a new password, decrypting all sk's first
                if (message.type === 'backupCoinstore') sendResponse(createKeystore(message.data))
                //Decrypt all keys, for use when user wants to view their secret keys in the UI
                if (message.type === 'decryptStore') {
                    var userInput = prompt("Enter your Lamden Wallet Password", "");
                    if (hashStringValue(userInput) === current) sendResponse(decryptedKeys())
                    else sendResponse({error: "Incorrect Password"})
                }
                //Add a Lamnden Coin to the coinStore
                if (message.type === 'coinStoreAddNewLamden') sendResponse(coinStoreAddNewLamdenCoin(message.data))
                //Add a coin just for watching
                if (message.type === 'walletAddOne') {sendResponse(coinStoreAddOne(message.data))}
                //Updated the sk of a previously only watched coin
                if (message.type === 'updateWatchedCoin') sendResponse(coinStoreAddOne(message.data))
                //Process a keystore file
                if (message.type === "walletAddMany") sendResponse(coinStoreAddMany(message.data))
                //Delete a coin/wallet from the coinStore
                if (message.type === 'coinStoreDelete') sendResponse(coinStoreDelete(message.data))
                //Call the currentNetwork API to refresh all balances in the coinStore
                if (message.type === 'balancesStoreUpdateAll') sendResponse(balancesStoreUpdateAll(message.data))
                //Call the currentNetwork API to refresh the balance of 1 coin/wallet in the coinStore
                if (message.type === 'balancesStoreUpdateOne') sendResponse(balancesStoreUpdateOne(message.data))
                //Create and Send a transaction to the currentNetwork Masternode
                if (message.type === 'sendLamdenTransaction'){
                    //Validate that a physical person is sending this transaction
                    let userConfirm = confirm('Send Transaction?')
                    if (userConfirm){
                        let txInfo = message.data;
                        let wallet = getWallet(txInfo.senderVk);
                        if (!wallet) sendResponse({status: `Error: Did not find Sender Key (${txInfo.senderVk}) in Lamden Wallet`});
                        try{
                            txInfo.uid = encryptString(wallet.vk, 'tracking-id')
                            let txBuilder = new Lamden.TransactionBuilder(getCurrentNetwork(), txInfo)
                            sendResponse({status: "Transaction Sent, Awaiting Response"})
                            sendTx(txBuilder, wallet.sk, sender.origin)
                        }catch (err){
                            sendResponse({status: `Error: Failed to create Tx - ${err}`})
                        }
                    }else{
                        sendResponse({status: `Transaction cancelled by user`})
                    }
                }
                if (message.type === 'setTrusted'){
                    const data = message.data
                    try{
                        delete dappsStore[data.dappUrl][data.networkType].stampPreApproval
                        delete dappsStore[data.dappUrl][data.networkType].stampsUsed
                        dappsStore[data.dappUrl][data.networkType].trustedApp = message.data.trusted
                        chrome.storage.local.set({"dapps": dappsStore});
                        sendResponse(true)
                    }catch (e){
                        sendResponse(false)
                    }
                }
                if (message.type === 'revokeDappAccess') sendResponse(DappStoreRevoke(message.data))
                if (message.type === 'reassignDappAccess') {
                    let userConfirm = confirm(`Associate this wallet with ${message.data.dappInfo.appName}?`)
                    if (userConfirm) sendResponse(DappStoreReassign(message.data))
                    else sendResponse('canceled')
                }
                    
                if (message.type === 'connectToMetamask') {
                    sendResponse('ok')
                    Ethereum.requestAccount().then(async address => {
                        let metaMaskInfo = {address}
                        if (!validateTypes.isStringWithValue(address.error)){
                            metaMaskInfo.chainInfo = await Ethereum.getChainInfo()
                            metaMaskInfo.tokenBalance = await Ethereum.balanceOfTAU(address)
                        }
                        sendMessageToApp('metamaskConnected', metaMaskInfo)
                    })
                }
                if (message.type === 'sendTokenApproval'){
                    sendResponse('ok')
                    const {address, amount } = message.data;
                    Ethereum.sendControllerApproval(address, amount).then(async res => {
                        sendMessageToApp('tokenApprovalSent', res)
                    })   
                }
                if (message.type === 'checkEthTxStatus'){
                    sendResponse('ok')
                    const { hash } = message.data;
                    Ethereum.checkTxStatus(hash).then(async res => {
                        sendMessageToApp('ethTxStatus', res)
                    })   
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
                try {
                    sendResponse(txToConfirm[confirmHash])
                } catch (e){}
                sendResponse(false)
            }

            if (message.type === 'approveDapp'){
                approveDapp(sender, message.data)
            }

            if (message.type === 'denyPopup'){
                if (message.data === 'ApproveConnection') rejectDapp(sender)
                if (message.data === 'ApproveTransaction') rejectTx(sender)
            }

            if (message.type === 'approveTransaction'){
                approveTransaction(sender)
            }
        }

        /*************************************************
         ** MESSAGES FROM AUTHORIZED DAPPs
        **************************************************/
        if (isFromAuthorizedDapp){
            if (!dappVkInWallet(dappInfo.vk) && !walletIsLocked){
                let errorMsg = [
                    "Your dApp was previously approved but no matching vk is currently found in the wallet. " +  
                     `Prompt the user to restore their keypair for vk '${dappInfo.vk}', ` +
                     "or add 'reapprove = true, newKeypair = true' to your approve request to have a new keypair generated."
                ]
                if (message.type === 'dAppSendLamdenTransaction'){
                    sendTxErrorResponse('Unable to process transaction', errorMsg, message.data, sendResponse)
                }else{
                    sendResponse({errors: errorMsg})
                }

            }else{
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
                        let approvalRequest = false;
                        
                        try{
                            //Make sure the txInfo was a JSON string (for security)
                            txInfo = JSON.parse(message.data)
                        } catch (err) {
                            sendTxErrorResponse(errorStatus, ['Failed to Parse JSON object', err.message], rejectedTx, sendResponse)
                            return
                        }

                        //Validate networkType was provided
                        if (!validateTypes.isStringWithValue(txInfo.networkType)) {
                            sendTxErrorResponse(errorStatus, ['networkType <string> required but not provided'], rejectedTx, sendResponse);
                            return
                        }
                        
                        //Get the Lamden Network Object for the network types specified in the txInfo request 
                        const network = getLamdenNetwork(txInfo.networkType.toLowerCase())
                        if (!network) {
                            errors = [`'networkType' <string> '${txInfo.networkType}' is not a valid network type. Valid types are ${LamdenNetworkTypes}.`]
                            sendTxErrorResponse(errorStatus, errors, rejectedTx, sendResponse);
                            return
                        }

                        //Reject transaction attempt if network type has not been approved
                        if (!dappInfo[txInfo.networkType.toLowerCase()]) {
                            errors = [`Transactions on '${txInfo.networkType}' have not been approved for ${dappInfo.url}.`]
                            sendTxErrorResponse(errorStatus, errors, rejectedTx, sendResponse)
                            return
                        }
                        
                        try{
                            //Find the wallet in the coinStore that is assocated with this dapp (was created specifically for this dApp during authorization)
                            const wallet = getWallet(dappInfo.vk);
                            //Create a unique ID for this transaction for reference later if needed
                            txInfo.uid = encryptString(wallet.vk, 'tracking-id')
                            //Set senderVk to the one assocated with this dapp
                            txInfo.senderVk = wallet.vk;
                            //Allow approval requests to be submitted without hardcoding the approved smart contract
                            if (txInfo.contractName === "currency" && txInfo.methodName === "approve"){
                                approvalRequest = true;
                            }else{
                                //Set the contract name to the one approved by the user for the dApp
                                txInfo.contractName = dappInfo[txInfo.networkType].contractName
                            }
                            //Create a Lamden Transaction
                            const txBuilder = new Lamden.TransactionBuilder(network, txInfo)
                            //Send dummp response so message tunnel doesn't error
                            sendResponse("ok")
                            const info = (({ appName, url, logo  }) => ({ appName, url, logo }))(dappInfo);
                            const txData = txBuilder.getAllInfo()
                            if (approvalRequest) {
                                promptCurrencyApproval(sender, {txData, wallet, dappInfo: info})
                            }else {
                                if (dappInfo[txBuilder.type].trustedApp || dappInfo[txBuilder.type].stampPreApproval > 0){
                                    sendTx(txBuilder, wallet.sk, dappInfo.url)
                                }else{
                                    promptApproveTransaction(sender, {txData, wallet, dappInfo: info, network})
                                }
                            }

                        }catch (err){
                            sendTxErrorResponse(errorStatus, ['Unable to Build Lamden Transaction', err.message], rejectedTx, sendResponse);
                        }
                    }
                }
            }
        }
    }
});


// Timer to check pending transacations
let timerId = setTimeout(async function resolvePendingTxs() {
    let nextRun = 500;
    if (txSaveList.length === 'undefined') txSaveList = []
    if (typeof pendingTxStore.length === 'undefined'){
        nextRun = 2000;
        pendingTxStore = []
        chrome.storage.local.set({"pendingTxs": pendingTxStore})
    } else {
        if (Object.keys(nonceCache).length > 0){
            if ((new Date().getTime() - new Date(lastSentDate).getTime() > 10000) && !checkingTransactions ){
                nonceCache = {}
            }
        }
        if (!checkingTransactions && pendingTxStore.length > 0){
            checkPendingTransactions()
        }
        if (!savingTransactions && txSaveList.length > 0){
            processTxSaveList()
        }
    } 
    timerId = setTimeout(resolvePendingTxs, nextRun);
}, 1000);