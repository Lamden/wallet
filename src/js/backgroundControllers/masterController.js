import whitelabel from '../../../whitelabel.json'

import { networkController } from './networkController.js'
import { dappController } from './dappController.js'
import { controllerUtils  } from './controllerUtils.js'
import { accountsController  } from './accountsController.js'
import { balancesController  } from './balancesController.js'
import { transactionsController } from './transactionsController.js'

export const masterController = () => {
    const utils = controllerUtils
    utils.networks = Object.freeze(networkController(utils));
    const accounts = Object.freeze(accountsController(utils));
    const balances = Object.freeze(balancesController(utils));
    const transactions = Object.freeze(transactionsController(utils, (() => {
        return {
            decryptString: accounts.decryptString,
            getAccountByVK: accounts.getAccountByVK,
            signTx: accounts.signTx
        }
    })()));
    const dapps = Object.freeze(dappController(utils, (() => {
        return {
            walletIsLocked: accounts.walletIsLocked,
            addNewLamdenAccount: accounts.addNewLamdenAccount,
            sendCurrencyTransaction: transactions.sendCurrencyTransaction,
            sendLamdenTx: transactions.sendLamdenTx,
            getAccountByVK: accounts.getAccountByVK
        }
    })()));

    const createPassword = (string) => {
        let created = accounts.createPassword(string);
        if (created) broadcastLockStatus(created);
        return created;
    }

    const unlock = (pwd) => {
        let unlocked = accounts.unlock(pwd);
        broadcastLockStatus(unlocked);
        return unlocked;
    }

    const lock = () => {
        accounts.lock()
        broadcastLockStatus(true)
        return true
    }
    const broadcastLockStatus = (status) => {
            utils.sendMessageToApp('walletIsLocked', status)
            dapps.sendMessageToAllDapps('sendWalletInfo')
    }
    const getWalletInfo = (dappInfo = undefined) => {
        let walletInfo = {
            walletVersion: chrome.runtime.getManifest().version,
            installed: true,
            setup: !accounts.firstRun(),
            locked: accounts.walletIsLocked(),
            wallets: []
        }
        if (walletInfo.locked === false){
            let approvals = {}
            Object.keys(dappInfo).forEach(key => {
                if(utils.networks.LamdenNetworkTypes.includes(key)) {
                    approvals[key] = dappInfo[key]
                    if (!approvals[key].version) approvals[key].version = "0.0.1"
                }
            })
            walletInfo.approvals = approvals
            if (Object.keys(approvals).length > 0) walletInfo.wallets = [dappInfo.vk]
        }
        return walletInfo
    }

    const updateAllBalances = () => {
        let accountsList = accounts.getSanatizedAccounts()
        if (typeof accountsList === 'undefined') return false
        balances.updateAll(accountsList, utils.networks.getCurrent())
        return true
    }

    const updateOneBalance = (account) => {
        balances.updateOne(account, utils.networks.getCurrent())
        return true
    }

    const clearNetworkBalances = () => {
        balances.clearNetwork(utils.networks.getCurrent())
    }

    const initiateAppTxSend = (txInfo, sender) => {
        //Validate that a physical person is sending this transaction
        let response = {status: ""};
        let userConfirm = confirm('Send Transaction?')
        if (userConfirm){
            try{
                txInfo.uid = utils.hashStringValue(new Date().toISOString());
                let txBuilder = new utils.Lamden.TransactionBuilder(utils.networks.getCurrent(), txInfo)
                transactions.sendLamdenTx(txBuilder, sender.origin)
                response.status = "Transaction Sent, Awaiting Response"
            }catch (err){
                console.log(err)
                response.status = `Error: Failed to create Tx - ${err}`
            }
        }else{
            response.status = "Transaction cancelled by user"
        }
        return response
    }

    // 1) For security if a contract name is provided that differes from the approved contract, automatic transactions will be ignored
    // 2) If no contract name is provided then the approved contract name will be provided 
    // 3) The Wallet sets/overwrites the "senderVK" in txInfo to the one created for the dApp upon authorization.
    // This means that a dApp can only send transactions that were approved by the user in the original connection request
    const initiateDAppTxSend = (sender, data, dappInfo, callback = undefined) => {
        const makeTxStatus = (status = `Unable to process transaction`, errors = undefined) => {
            let txStatus = {status, errors, data}
            if (callback) callback({data:{status, errors, data}})
            return txStatus
        }
        if (accounts.walletIsLocked()){
            return makeTxStatus(undefined, ['Wallet is Locked'])
        }else{
            let txInfo = {};
            let errors = []
            let approvalRequest = false;
            let forceTxApproval = false;
            
            try{
                //Make sure the txInfo was a JSON string (for security)
                txInfo = JSON.parse(data)
            } catch (err) {
                return makeTxStatus(undefined, ['Failed to Parse JSON object', err.message])
            }

            //Validate networkType was provided
            if (!utils.validateTypes.isStringWithValue(txInfo.networkType)) {
                return makeTxStatus(undefined, ['networkType <string> required but not provided']);
            }
            
            //Get the Lamden Network Object for the network types specified in the txInfo request 
            const network = utils.networks.getLamdenNetwork(txInfo.networkType.toLowerCase())
            if (!network) {
                errors = [`'networkType' <string> '${txInfo.networkType}' is not a valid network type. Valid types are ${utils.networks.LamdenNetworkTypes}.`]
                return makeTxStatus(undefined, errors);
            }

            //Reject transaction attempt if network type has not been approved
            if (!dappInfo[txInfo.networkType.toLowerCase()]) {
                errors = [`Transactions on '${txInfo.networkType}' have not been approved for ${dappInfo.url}.`]
                return makeTxStatus(undefined, errors)
            }
            
            try{
                console.log(JSON.stringify(txInfo))
                //Find the wallet in the coinStore that is assocated with this dapp (was created specifically for this dApp during authorization)
                const wallet = accounts.getAccountByVK(dappInfo.vk);
                //Create a unique ID for this transaction for reference later if needed
                if (!txInfo.uid) txInfo.uid = utils.hashStringValue(new Date().toISOString())
                //Set senderVk to the one assocated with this dapp
                txInfo.senderVk = wallet.vk;
                //Check if contractName was supplied
                if (typeof txInfo.contractName !== 'undefined'){
                    //Check if the contract name is currency, and that it's an approval transaction
                    if (txInfo.contractName === "currency" && txInfo.methodName === "approve"){
                        approvalRequest = true;
                        //Hardcode the approved contract name into the approval request
                        txInfo.kwargs.to = dappInfo[txInfo.networkType].contractName;
                    }else{
                        //Check if the provided contract Name differs from the approved one
                        // If so, then force the user to approve the transaction (ignoring auto tx settings)
                        if (txInfo.contractName !== dappInfo[txInfo.networkType].contractName){
                            console.log('forcing')
                            forceTxApproval = true
                        }
                    }
                }else{
                    //Set the contract name to the one approved by the user for the dApp
                    txInfo.contractName = dappInfo[txInfo.networkType].contractName
                }

                //Create a Lamden Transaction
                const txBuilder = new utils.Lamden.TransactionBuilder(network, txInfo)
                const info = (({ appName, url, logo  }) => ({ appName, url, logo }))(dappInfo);
                const txData = txBuilder.getAllInfo()
                if (approvalRequest) {
                    promptCurrencyApproval(sender, {txData, wallet, dappInfo: info})
                }else {
                    if (dappInfo[txBuilder.type].trustedApp && !forceTxApproval ){
                        transactions.sendLamdenTx(txBuilder, dappInfo.url)
                    }else{
                        promptApproveTransaction(sender, {txData, wallet, dappInfo: info, network})
                    }
                }
                return callback("ok")

            }catch (err){
                return makeTxStatus(undefined, [`Unable to Build ${whitelabel.companyName} Transaction`, err.message]);
            }
        }        
    }

    const promptApproveDapp = async (sender, messageData, reapprove = false, dappInfo = undefined) => {
        let exists = await utils.networks.contractExists(messageData.networkType, messageData.contractName)
        if (!exists) {
            const errors = [`contractName: '${messageData.contractName}' does not exists on '${messageData.networkType}' network.`]
            utils.sendMessageToTab(sender.origin, 'sendErrorsToTab', {errors})
        }else{
            const windowId = utils.createUID()
            messageData.network = utils.networks.getLamdenNetwork(messageData.networkType)
            messageData.accounts = balances.addBalances(accounts.getSanatizedAccounts(), messageData.network.networkKey)
            if (reapprove) {
                messageData.reapprove = reapprove
                messageData.oldConnection = dappInfo
            }
            
            dapps.setTxToConfirm(windowId, {
                type: 'ApproveConnection',
                messageData,
                url: sender.origin
            });
            createPopup(windowId)
        }
    }
    
    const promptApproveTransaction = async (sender, messageData) => {
        const windowId = utils.createUID()
        dapps.setTxToConfirm(windowId, {
            type: 'ApproveTransaction',
            messageData,
            url: sender.origin
        });
        createPopup(windowId)
    }
    const promptCurrencyApproval = async (sender, messageData) => {
        const windowId = utils.createUID()
        dapps.setTxToConfirm(windowId, {
            type: 'CurrencyApproval',
            messageData,
            url: sender.origin
        });
        createPopup(windowId)
    }

    const createPopup = (windowId) => {
        chrome.windows.create({
            url: `/confirm.html#${windowId}`, width: 500, height: 700, type: 'popup',
        });
    }

    const deleteAccount = (data) => {
        const { account, string } = data;
        if (accounts.checkPassword(string)){
            if (accounts.deleteOne(account)) {
                dapps.deleteDapp(account.vk)
                return true
            }
        }
        return false
    }

    return{
        "accounts" : {
            walletIsLocked: accounts.walletIsLocked,
            firstRun: accounts.firstRun,
            validatePassword: accounts.validatePassword,
            createKeystore: accounts.createKeystore,
            addNewLamdenAccount: accounts.addNewLamdenAccount,
            addOne: accounts.addOne,
            addMany: accounts.addMany,
            changeAccountNickname: accounts.changeAccountNickname,
            decryptKeys: accounts.decryptKeys
        },
        "dapps": {
            setTrusted: dapps.setTrusted,
            revokeAccess: dapps.revokeAccess,
            reassignLink: dapps.reassignLink,
            getConfirmInfo: dapps.getConfirmInfo,
            approveDapp: dapps.approveDapp,
            reapproveDapp: dapps.reapproveDapp,
            updateDapp: dapps.updateDapp,
            rejectDapp: dapps.rejectDapp,
            rejectTx: dapps.rejectTx,
            approveTransaction: dapps.approveTransaction,
            getDappInfoByURL: dapps.getDappInfoByURL,
            validateConnectionMessage: dapps.validateConnectionMessage
        },
        "transactions":{
            requestEthereumAccount: transactions.requestEthereumAccount,
            sendEthereumTokenApproval: transactions.sendEthereumTokenApproval,
            sendEthereumSwapTransaction: transactions.sendEthereumSwapTransaction,
            checkEthereumTxStatus: transactions.checkEthereumTxStatus
        },
        balances,
        utils,
        createPassword,
        deleteAccount,
        updateAllBalances,
        updateOneBalance,
        clearNetworkBalances,
        fromAuthorizedDapp: (url) => dapps.dappExists(url),
        unlock,
        lock,
        getWalletInfo,
        initiateAppTxSend,
        initiateDAppTxSend,
        promptApproveDapp
    }
}