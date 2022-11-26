export const dappController = (utils, funa, actions) => {
    let dappsStore = {};
    let txToConfirm = {};
    const validateTypes = utils.validateTypes
    
    chrome.storage.local.get({"dapps":{}},function(getValue) {dappsStore = getValue.dapps;})
    chrome.storage.onChanged.addListener(function(changes) {
        for (let key in changes) {
            if (key === 'dapps') dappsStore = changes[key].newValue;
        }
    });

    chrome.runtime.onInstalled.addListener(function(details) {
        if (details.reason === "install") {
            funa.fetchUpdates()
        }
        if (details.reason === "update"){
            let currVer = chrome.runtime.getManifest().version;
            let prevVer = details.previousVersion
            if (prevVer <= "0.12.0" && currVer > prevVer){
                initiateTrustedApp()
            }
            if (prevVer <= "1.8.0" && currVer > prevVer){
                purgeDappConnections()
            }
            funa.fetchUpdates()
        }
    });

    const getSenderHash = (sender) => {
        return sender.url.split('#')[1]
    }

    const validateConnectionMessage = (data) => {
        const formats = ['number', 'string']
        let errors = [];
        const messageData = utils.isJSON(data)
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
        if (validateTypes.isStringWithValue(messageData.networkType)){
            if (!utils.networks.isAcceptedNetwork(messageData.networkType)){
                errors.push(`'networkType' <string> '${messageData.networkType}' is not a valid network type.`)
            }
        }else{
            errors.push("'networkType' <string> required to process connect request")
        }

        if (!validateTypes.isStringWithValue(messageData.version)) {
            errors.push("'version' <string> required to process connect request")
        }

        // default network version 1
        if (!messageData.networkVersion) {
            messageData.networkVersion = 1
        }

        if (messageData.networkVersion !== 1 || messageData.networkVersion !== 2) {
            errors.push("'networkVersion' <int> must be 1 or 2")
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
    
    const approveDapp = (sender, approveInfo) => {
        const confirmData = txToConfirm[getSenderHash(sender)]
        if (confirmData.messageData.reapprove) {
            reapproveDapp(confirmData.messageData)
            utils.sendMessageToTab(confirmData.url, 'sendWalletInfo')
            delete txToConfirm[getSenderHash(sender)]
            return
        }

        if (!actions.walletIsLocked()){
            const dappInfo = getDappInfoByURL(confirmData.url)
            const messageData = confirmData.messageData
            let accountVk;
            if (approveInfo.accountInfo){
                // link to exist account 
                accountVk = approveInfo.accountInfo.vk
            } else {
                if (!dappInfo){
                    accountVk = actions.addNewLamdenAccount(messageData.appName).vk
                }else{
                    accountVk = dappInfo.vk
                }
            }
            if (accountVk){
                addNew(confirmData.url, accountVk, messageData, approveInfo.trustedApp)
                let network = utils.networks.getNetwork(confirmData.messageData.network)
                if (approveInfo.fundingInfo){
                    actions.sendCurrencyTransaction( approveInfo.fundingInfo.account.vk, accountVk, approveInfo.fundingInfo.amount, network)
                }
                utils.sendMessageToTab(confirmData.url, 'sendWalletInfo')
            }else{
                delete txToConfirm[getSenderHash(sender)]
                throw new Error('Unable to encrypt private key while approving dapp')
            }
        }else{
            const errors = ['Tried to approve app but Lamden Vault was locked']
            utils.sendMessageToTab(confirmData.url, 'sendErrorsToTab', {errors})
        }
        delete txToConfirm[getSenderHash(sender)]
    }

    const reapproveDapp = (messageData) => {
        updateDapp(messageData.oldConnection, messageData)
        updateSmartContract(messageData.oldConnection, messageData)
    }
    
    const rejectDapp = (sender) => {
        const confirmData = txToConfirm[getSenderHash(sender)]
        utils.sendMessageToTab(confirmData.url, 'sendErrorsToTab', {errors: ['User rejected connection request']})
        delete txToConfirm[getSenderHash(sender)]
    }
    
    const rejectTx = (sender) => {
        const confirmData = txToConfirm[getSenderHash(sender)]
        const { txData }  = confirmData.messageData
        utils.sendMessageToTab(confirmData.url, 'txStatus', {status: 'Transaction Cancelled', errors: ['User closed Popup window'], rejected: JSON.stringify(txData) })
        delete txToConfirm[getSenderHash(sender)]
    }
    
    const approveTransaction = (sender) => {
        const confirmData = txToConfirm[getSenderHash(sender)]
        if (!actions.walletIsLocked()){
            const txData = confirmData.messageData.txData;
            const txBuilder = new utils.Lamden.TransactionBuilder(txData.networkInfo, txData.txInfo, txData)
            actions.sendLamdenTx(txBuilder, confirmData.url)    
        }else{
            const errors = ['Tried to send transaction app but Lamden Vault was locked']
            utils.sendMessageToTab(confirmData.url, 'sendErrorsToTab', {errors})
        }
        delete txToConfirm[getSenderHash(sender)]
    }
    
    const addNew = (appUrl, vk, messageData, trustedApp) => {
        let syu = `${networkObj.name}|${networkObj.type}`
        //remvove trailing slash from url
        if (!dappsStore[appUrl]) dappsStore[appUrl] = {}
        if (!dappsStore[appUrl][messageData.networkType]) dappsStore[appUrl][messageData.networkType] = {}
        dappsStore[appUrl][messageData.networkType].contractName = messageData.contractName
        dappsStore[appUrl][messageData.networkType].trustedApp = trustedApp;
        dappsStore[appUrl][messageData.networkType].version = messageData.version;
        dappsStore[appUrl][messageData.networkType].networkVersion = messageData.networkVersion;
        //Remove slashes at start of icon paths
        if (utils.validateTypes.isArrayWithValues(messageData.charms)){
            messageData.charms.forEach(charm => {
                charm.iconPath = utils.addCharAtStart(charm.iconPath, '/')
            })
            dappsStore[appUrl][messageData.networkType].charms = messageData.charms
        }
        dappsStore[appUrl].appName = messageData.appName
        dappsStore[appUrl].logo = utils.addCharAtStart(messageData.logo, '/')
        if (utils.validateTypes.isStringWithValue(messageData.background)){
            dappsStore[appUrl].background = utils.addCharAtStart(messageData.background, '/')
        }
        dappsStore[appUrl].url = appUrl
        dappsStore[appUrl].vk = vk
        chrome.storage.local.set({"dapps": dappsStore});
    }

    const updateDapp = (dappInfo, connectionInfo, reapprove = false) => {
        dappsStore[dappInfo.url].appName = connectionInfo.appName
        if (utils.validateTypes.isStringWithValue(connectionInfo.background)){
            dappsStore[dappInfo.url].background = utils.addCharAtStart(connectionInfo.background, '/')
        }else{
            delete dappsStore[dappInfo.url].background
        }
        dappsStore[dappInfo.url].logo = utils.addCharAtStart(connectionInfo.logo, '/')
        dappsStore[dappInfo.url][connectionInfo.networkType].version = connectionInfo.version
        dappsStore[dappInfo.url][connectionInfo.networkType].networkVersion = connectionInfo.networkVersion
        if (typeof connectionInfo.charms !== 'undefined') {
            dappsStore[dappInfo.url][connectionInfo.networkType].charms = connectionInfo.charms
        }else{
            delete dappsStore[dappInfo.url][connectionInfo.networkType].charms
        }
        if (!reapprove) chrome.storage.local.set({"dapps": dappsStore});
    }

    const updateSmartContract = (dappInfo, connectionInfo) => {
        dappsStore[dappInfo.url][connectionInfo.networkType].contractName = connectionInfo.contractName
        chrome.storage.local.set({"dapps": dappsStore});
    }
    
    const deleteDapp = (vk) => {
        let dappInfo = getDappInfoByVK(vk)
        if (dappInfo) {
            delete dappsStore[dappInfo.url]
            chrome.storage.local.set({"dapps": dappsStore});
        }
    }
    
    const revokeAccess = (data) => {
        try{
            data.networks.forEach(networkType => {
                delete dappsStore[data.dappInfo.url][networkType]
            })
            let allnetworks = utils.networks.getAll()
            let hasConnection = false
            allnetworks.forEach(network => {
                if (dappsStore[data.dappInfo.url][network.type]) hasConnection = true
            })
            if (!hasConnection) delete dappsStore[data.dappInfo.url]
            chrome.storage.local.set({"dapps": dappsStore});
        }catch(e){
            return false
        }
        return true
    }

    const purgeDappConnections = () => {
        let changed = false
        let allnetworks = utils.networks.getAll()

        Object.keys(dappsStore).forEach(dappURL => {

            let hasConnection = false
            allnetworks.forEach(network => {
                if (dappsStore[dappURL][network.type]) hasConnection = true
            })
            if (!hasConnection) {
                delete dappsStore[dappURL]
                changed = true
            }
        })

        if (changed) chrome.storage.local.set({"dapps": dappsStore});
    }
    
    const reassignLink = (data) => {
        const { dappInfo, newVk } = data;
        try{
            dappsStore[dappInfo.url].vk = newVk
            chrome.storage.local.set({"dapps": dappsStore});
            sendMessageToDapp(dappInfo.url, 'sendWalletInfo')
        }catch(e){
            return false
        }
        return true
    }

    const getDappInfoByURL = (url) => {
        if (!dappsStore[url]) return false
        return dappsStore[url]
    }

    const dappExists = (url) => {
        if (!getDappInfoByURL(url)) return false
        return true
    }

    const getDappInfoByVK = (vk) => {
        let dapp = Object.keys(dappsStore).find(f => dappsStore[f].vk === vk )
        if (dapp) return dappsStore[dapp]
        return false
    }

    const initiateTrustedApp = () => {
        const networksList = ['mainnet', 'testnet']
        Object.keys(dappsStore).forEach(url => {
            networksList.forEach(network => {
                if (dappsStore[url][network]){
                    if (typeof dappsStore[url][network].stampPreApproval !== "undefined"){
                        if (parseFloat(dappsStore[url][network].stampPreApproval) > 0) dappsStore[url][network].trustedApp = true;
                        else dappsStore[url][network].trustedApp = false;
                    }else{
                        if (typeof dappsStore[url][network].trustedApp === "undefined") dappsStore[url][network].trustedApp = false;
                    }
                    delete dappsStore[url][network].stampPreApproval
                    delete dappsStore[url][network].stampsUsed
                }
            })
        })
        chrome.storage.local.set({"dapps": dappsStore});
    }

    const setTrusted = (data) => {
        try{
            delete dappsStore[data.dappUrl][data.networkType].stampPreApproval
            delete dappsStore[data.dappUrl][data.networkType].stampsUsed
            dappsStore[data.dappUrl][data.networkType].trustedApp = data.trusted
            chrome.storage.local.set({"dapps": dappsStore});
            return true
        }catch (e){
            return false
        }
    }

    const sendMessageToDapp = (dappUrl, type, data) => {
        chrome.windows.getAll({populate:true},function(windows){
            windows.forEach((window) => {
                window.tabs.forEach((tab) => {
                    let urlObj = new URL(tab.url)
                    if (urlObj.origin === dappUrl){
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
                        let urlObj = new URL(tab.url)
                        if (urlObj.origin === dapp){
                            chrome.tabs.sendMessage(tab.id, {type, data});  
                        }
                    })
                });
            });
        });
    }

    const getConfirmInfo = (confirmHash) => {
        try {
            return txToConfirm[confirmHash]
        } catch (e){}
        return false
    }

    const setTxToConfirm = (windowID, data) => txToConfirm[windowID] = data


    return {
        validateConnectionMessage,
        approveDapp, reapproveDapp,
        rejectDapp,
        rejectTx,
        approveTransaction,
        addNew,
        deleteDapp,
        revokeAccess,
        reassignLink,
        dappExists,
        getDappInfoByURL,
        getDappInfoByVK,
        sendMessageToAllDapps,
        getSenderHash,
        setTrusted,
        getConfirmInfo,
        setTxToConfirm,
        updateDapp
    }
}