export const dappController = (utils, actions) => {
    const validateTypes = utils.validateTypes
    
    const getTxToConfirm = async () => {
        let res = await chrome.storage.session.get({"txToConfirm":{}})
        return res.txToConfirm
    }

    const updateTxToConfirm = async (data) => {
       await chrome.storage.session.set({"txToConfirm": data})
    }

    const getDappStore = async () => {
        let res = await chrome.storage.local.get({"dapps":{}})
        return res.dapps
    }

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
        if (!validateTypes.isStringWithValue(messageData.version)) {
            errors.push("'version' <string> required to process connect request")
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

        // default network name legacy
        if (!messageData.networkName) {
            messageData.networkName = "legacy"
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
    
    const approveDapp = async (sender, approveInfo) => {
        let txToConfirm = await getTxToConfirm()
        const confirmData = txToConfirm[getSenderHash(sender)]
        if (confirmData.messageData.reapprove) {
            await reapproveDapp(confirmData.messageData)
            utils.sendMessageToTab(confirmData.url, 'sendWalletInfo')
            delete txToConfirm[getSenderHash(sender)]
            await updateTxToConfirm(txToConfirm)
            return
        }

        if (! await actions.walletIsLocked()){
            const dappInfo = getDappInfoByURL(confirmData.url)
            const messageData = confirmData.messageData
            let accountVk;
            if (approveInfo.accountInfo){
                // link to exist account 
                accountVk = approveInfo.accountInfo.vk
            } else {
                if (!dappInfo){
                    accountVk = await actions.addNewLamdenAccount(messageData.appName).vk
                }else{
                    accountVk = dappInfo.vk
                }
            }
            if (accountVk){
                await addNew(confirmData.url, accountVk, messageData, approveInfo.trustedApp)
                let network = utils.networks.getNetwork(confirmData.messageData.network)
                if (approveInfo.fundingInfo){
                    await actions.sendCurrencyTransaction( approveInfo.fundingInfo.account.vk, accountVk, approveInfo.fundingInfo.amount, network)
                }
                utils.sendMessageToTab(confirmData.url, 'sendWalletInfo')
            }else{
                delete txToConfirm[getSenderHash(sender)]
                await updateTxToConfirm(txToConfirm)
                throw new Error('Unable to encrypt private key while approving dapp')
            }
        }else{
            const errors = ['Tried to approve app but Lamden Vault was locked']
            utils.sendMessageToTab(confirmData.url, 'sendErrorsToTab', {errors})
        }
        delete txToConfirm[getSenderHash(sender)]
        await updateTxToConfirm(txToConfirm)
    }

    const reapproveDapp = async (messageData) => {
        await updateDapp(messageData.oldConnection, messageData)
        await updateSmartContract(messageData.oldConnection, messageData)
    }
    
    const rejectDapp = async (sender) => {
        let txToConfirm = await getTxToConfirm()
        const confirmData = txToConfirm[getSenderHash(sender)]
        utils.sendMessageToTab(confirmData.url, 'sendErrorsToTab', {errors: ['User rejected connection request']})
        delete txToConfirm[getSenderHash(sender)]
        await updateTxToConfirm(txToConfirm)
    }
    
    const rejectTx = async (sender) => {
        let txToConfirm = await getTxToConfirm()
        const confirmData = txToConfirm[getSenderHash(sender)]
        const { txData }  = confirmData.messageData
        utils.sendMessageToTab(confirmData.url, 'txStatus', {status: 'Transaction Cancelled', errors: ['User closed Popup window'], rejected: JSON.stringify(txData) })
        delete txToConfirm[getSenderHash(sender)]
        await updateTxToConfirm(txToConfirm)
    }
    
    const approveTransaction = async (sender) => {
        let txToConfirm = await getTxToConfirm()
        const confirmData = txToConfirm[getSenderHash(sender)]
        if (! await actions.walletIsLocked()){
            const txData = confirmData.messageData.txData;
            const txBuilder = new utils.Lamden.TransactionBuilder(txData.networkInfo, txData.txInfo, txData)
            await actions.sendLamdenTx(txBuilder, confirmData.url)    
        }else{
            const errors = ['Tried to send transaction app but Lamden Vault was locked']
            utils.sendMessageToTab(confirmData.url, 'sendErrorsToTab', {errors})
        }
        delete txToConfirm[getSenderHash(sender)]
        await updateTxToConfirm(txToConfirm)
    }
    
    const addNew = async (appUrl, vk, messageData, trustedApp) => {
        let dappsStore = await getDappStore()

        let symbol = `${messageData.networkName}|${messageData.networkType}`
        //remvove trailing slash from url
        if (!dappsStore[appUrl]) dappsStore[appUrl] = {}
        if (!dappsStore[appUrl][symbol]) dappsStore[appUrl][symbol] = {}
        dappsStore[appUrl][symbol].contractName = messageData.contractName
        dappsStore[appUrl][symbol].trustedApp = trustedApp;
        dappsStore[appUrl][symbol].networkName = messageData.networkName;
        dappsStore[appUrl][symbol].networkType = messageData.networkType;
        dappsStore[appUrl][symbol].version = messageData.version;
        //Remove slashes at start of icon paths
        if (utils.validateTypes.isArrayWithValues(messageData.charms)){
            messageData.charms.forEach(charm => {
                charm.iconPath = utils.addCharAtStart(charm.iconPath, '/')
            })
            dappsStore[appUrl][symbol].charms = messageData.charms
        }
        dappsStore[appUrl].appName = messageData.appName
        dappsStore[appUrl].logo = utils.addCharAtStart(messageData.logo, '/')
        if (utils.validateTypes.isStringWithValue(messageData.background)){
            dappsStore[appUrl].background = utils.addCharAtStart(messageData.background, '/')
        }
        dappsStore[appUrl].url = appUrl
        dappsStore[appUrl].vk = vk
        await chrome.storage.local.set({"dapps": dappsStore});
    }

    const updateDapp = async (dappInfo, connectionInfo) => {
        let dappsStore = await getDappStore()
        let symbol = `${connectionInfo.networkName}|${connectionInfo.networkType}`

        dappsStore[dappInfo.url].appName = connectionInfo.appName
        if (utils.validateTypes.isStringWithValue(connectionInfo.background)){
            dappsStore[dappInfo.url].background = utils.addCharAtStart(connectionInfo.background, '/')
        }else{
            delete dappsStore[dappInfo.url].background
        }
        dappsStore[dappInfo.url].logo = utils.addCharAtStart(connectionInfo.logo, '/')
        dappsStore[dappInfo.url][symbol].version = connectionInfo.version
        dappsStore[dappInfo.url][symbol].networkName = connectionInfo.networkName
        if (typeof connectionInfo.charms !== 'undefined') {
            dappsStore[dappInfo.url][symbol].charms = connectionInfo.charms
        }else{
            delete dappsStore[dappInfo.url][symbol
            ].charms
        }
        await chrome.storage.local.set({"dapps": dappsStore});
    }

    const updateSmartContract = async (dappInfo, connectionInfo) => {
        let dappsStore = await getDappStore()
        let symbol = `${connectionInfo.networkName}|${connectionInfo.networkType}`
        dappsStore[dappInfo.url][symbol].contractName = connectionInfo.contractName
        await chrome.storage.local.set({"dapps": dappsStore});
    }
    
    const deleteDapp = async (vk) => {
        let dappsStore = await getDappStore()
        let dappInfo = await getDappInfoByVK(vk)
        if (dappInfo) {
            delete dappsStore[dappInfo.url]
            await chrome.storage.local.set({"dapps": dappsStore});
        }
    }
    
    const revokeAccess = async (data) => {
        let dappsStore = await getDappStore()
        try{
            data.networks.forEach(networkType => {
                delete dappsStore[data.dappInfo.url][networkType]
            })
            let allnetworks = await utils.networks.getAll()
            let hasConnection = false
            allnetworks.forEach(network => {
                if (dappsStore[data.dappInfo.url][network.type]) hasConnection = true
            })
            if (!hasConnection) delete dappsStore[data.dappInfo.url]
            await chrome.storage.local.set({"dapps": dappsStore});
        }catch(e){
            return false
        }
        return true
    }

    // const purgeDappConnections = async () => {
    //     let changed = false
    //     let allnetworks = await utils.networks.getAll()

    //     Object.keys(dappsStore).forEach(dappURL => {

    //         let hasConnection = false
    //         allnetworks.forEach(network => {
    //             if (dappsStore[dappURL][network.type]) hasConnection = true
    //         })
    //         if (!hasConnection) {
    //             delete dappsStore[dappURL]
    //             changed = true
    //         }
    //     })

    //     if (changed) chrome.storage.local.set({"dapps": dappsStore});
    // }
    
    const reassignLink = async (data) => {
        let dappsStore = await getDappStore()
        const { dappInfo, newVk } = data;
        try{
            dappsStore[dappInfo.url].vk = newVk
            await chrome.storage.local.set({"dapps": dappsStore});
            sendMessageToDapp(dappInfo.url, 'sendWalletInfo')
        }catch(e){
            return false
        }
        return true
    }

    const getDappInfoByURL = async (url) => {
        let dappsStore = await getDappStore()
        if (!dappsStore[url]) return false
        return dappsStore[url]
    }

    const dappExists = async (url) => {
        if (! await getDappInfoByURL(url)) return false
        return true
    }

    const getDappInfoByVK = async (vk) => {
        let dappsStore = await getDappStore()
        let dapp = Object.keys(dappsStore).find(f => dappsStore[f].vk === vk )
        if (dapp) return dappsStore[dapp]
        return false
    }

    const setTrusted = async (data) => {
        let dappsStore = await getDappStore()
        let symbol = `${data.networkName}|${data.networkType}`
        try{
            delete dappsStore[data.dappUrl][symbol].stampPreApproval
            delete dappsStore[data.dappUrl][symbol].stampsUsed
            dappsStore[data.dappUrl][symbol].trustedApp = data.trusted
            await chrome.storage.local.set({"dapps": dappsStore});
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

    const sendMessageToAllDapps = async (type, data) => {
        let dappsStore = await getDappStore()
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

    const getConfirmInfo = async (confirmHash) => {
        let txToConfirm = await getTxToConfirm()
        try {
            return txToConfirm[confirmHash]
        } catch (e){console.log(e)}
        return false
    }

    const setTxToConfirm = async (windowID, data) => {
        let txToConfirm = await getTxToConfirm()
        txToConfirm[windowID] = data
        await updateTxToConfirm(txToConfirm)
    }


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