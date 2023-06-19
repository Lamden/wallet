import { masterController as controller } from './masterController.js'
const validators = require('types-validate-assert')
const { validateTypes } = validators

const fromApp = (url) => {
    return url === chrome.runtime.getURL('app.html')
}
const fromConfirm = (url) => {
    return url.split('#')[0] === chrome.runtime.getURL('confirm.html')
}


export const messagesHandler = () => {
    let masterController = controller()
    /*****************************************************************************
    * In App/Dapp message handling
    * This routine is a 'sender' filter for chrome extention message API to seperate messages from the App itself
    * from outside webpages.  This isolates the sensitive information stored in the background page to the App and autorized Dapps.
    *****************************************************************************/
    const msgHandle = async (message, sender, sendResponse) => {
        // console.log({message, sender, sendResponse})
        const sendErrors = (errors) => sendResponse({errors})

        if (chrome.runtime.lastError) return true;

        const isFromAuthorizedDapp = await masterController.fromAuthorizedDapp(sender.origin); 
        const dappInfo = isFromAuthorizedDapp ? await masterController.dapps.getDappInfoByURL(sender.origin) : undefined;
        const isFromApp = fromApp(sender.url);
        const isFromConfirm = fromConfirm(sender.url);
        const walletIsLocked = await masterController.accounts.walletIsLocked();

    /*************************************************
        ** AUTHORIZATION MESSAGES
        **************************************************/
        //Process connection messages to have the user authorize an app
        if (message.type === 'lamdenWalletConnect') {
            //Reject if wallet is locked as we won't have the user's password stored to encrypt the new keypair
            if (walletIsLocked){
                sendErrors(["Lamden Vault is Locked"])
                return true
            }
            //Make sure the connection request is valid before processing; return erros to dApp
            const connectionMessage = masterController.dapps.validateConnectionMessage(message.data)
            if (validateTypes.hasKeys(connectionMessage, ['errors'])){
                sendErrors(connectionMessage.errors)
                return true
            }else if(dappInfo){
                try{
                    let symbol = `${connectionMessage.networkName}|${connectionMessage.networkType}`
                    if (dappInfo[symbol]) {
                        //If this dApp is already approved get send the wallet info
                        if (dappInfo[symbol].contractName === connectionMessage.contractName){
                            //if the connection info is a greater version than the one that exists
                            let version = dappInfo[symbol].version || "0.0.1"
                            if (connectionMessage.version > version){
                                await masterController.dapps.updateDapp(dappInfo, connectionMessage)
                            }
                            let dinfo = await masterController.dapps.getDappInfoByURL(sender.origin)
                            sendResponse(await masterController.getWalletInfo(dinfo));
                            return true
                        }else{
                            let version = dappInfo[symbol].version || "0.0.1"
                            if (connectionMessage.version > version){
                                await masterController.promptApproveDapp(sender, connectionMessage, true, dappInfo)
                            }
                            return true
                        }
                    } else {
                        await masterController.promptApproveDapp(sender, connectionMessage)
                        return true
                    }
                }catch (e){
                    console.log(e)
                }
                await masterController.promptApproveDapp(sender, connectionMessage)
                return true
            } else {
                await masterController.promptApproveDapp(sender, connectionMessage)
                return true
            }
        }

        //Reject any messages not from the App itself of from the autorized Dapp List.
        if (!isFromAuthorizedDapp && !isFromApp && !isFromConfirm){
            sendErrors([
                `You must be an authorized dApp to send this message type. Send 'lamdenWalletConnect' event first to authorize.`
            ])
        }else{
            /*************************************************
            ** MESSAGES FROM THE LAMDEN WALLET APP 
            **************************************************/
            if (isFromApp){
                //Create password on initial "firstRun" setup
                if(message.type === 'createPassword') {
                    sendResponse(await masterController.createPassword(message.data))
                    return true;
                }
                //Change password
                if(message.type === 'changePassword') {
                    sendResponse(await masterController.changePassword(message.data))
                    return true;
                }

                // Reapir vault
                if (message.type === 'repairVault') {
                    sendResponse(await masterController.accounts.repairVault(message.data)) 
                    return true;
                }
                //Check if the wallet has been setup yet
                if(message.type === 'isFirstRun') {
                    sendResponse(await masterController.accounts.firstRun())
                    return true;
                }
                //Unlock the wallet
                if (message.type === 'unlockWallet') {
                    sendResponse(await masterController.unlock(message.data))
                    return true;
                }
                //Check the password is correct
                if (message.type === 'validatePassword') {
                    sendResponse(await masterController.accounts.validatePassword(message.data))
                    return true;
                }
                //Respond to request checking if the wallet is locked
                if (message.type === 'walletIsLocked') {
                    sendResponse(await masterController.accounts.walletIsLocked())
                    return true;
                }
                //Lock the wallet
                if (message.type === 'lockWallet') {
                    sendResponse(await masterController.lock())
                    return true;
                }
                //Only Allow access to these messages processors if the wallet is Unlocked
                if (!walletIsLocked){
                    // Add a vault account
                    if (message.type === 'addVaultAccount') {
                        sendResponse(await masterController.accounts.addVaultAccount(message.data))
                        return true;
                    }
                    // Set mnemonic phrase and remove the all previous accounts and related dapp
                    if (message.type === 'setMnemonic') {
                        sendResponse(await masterController.setMnemonic(message.data))
                        return true;
                    }
                    // Get   mnemonic phrase
                    if (message.type === 'getMnemonic') {
                        sendResponse(await masterController.accounts.getMnemonic())
                        return true;
                    }
                    // Check if the vault is created
                    if (message.type === 'isVaultCreated') {
                        sendResponse(await masterController.accounts.isVaultCreated())
                        return true;
                    }
                    // vertify the password and view private key
                    if (message.type === 'viewPrivateKey') {
                        sendResponse(await masterController.viewPrivateKey(message.data))
                        return true;
                    }
                    //Create a keystore file that is encrypted with a new password, decrypting all sk's first
                    if (message.type === 'backupCoinstore') {
                        sendResponse(await masterController.accounts.createKeystore(message.data))
                        return true;
                    }
                    //Decrypt all keys, for use when user wants to view their secret keys in the UI
                    if (message.type === 'decryptStore') {
                        sendResponse(await masterController.accounts.decryptKeys(message.data))
                        return true;
                    }
                    //Add a Lamnden Coin to the coinStore
                    if (message.type === 'accountsAddNewLamden') {
                        sendResponse(await masterController.accounts.addNewLamdenAccount(message.data))
                        return true;
                    }
                    //Add a coin just for watching
                    if (message.type === 'accountsAddOne') {
                        sendResponse(await masterController.accounts.addOne(message.data))
                        return true;
                    }
                    //Updated the sk of a previously only watched coin
                    if (message.type === 'updateWatchedCoin') {
                        sendResponse(await masterController.accounts.addOne(message.data))
                        return true;
                    }
                    //Process a keystore file
                    if (message.type === "accountsAddMany") {
                        await masterController.accounts.addMany(message.data, sendResponse)
                        return true
                    }
                    //Delete a coin/wallet from the coinStore
                    if (message.type === 'coinStoreDelete') {
                        sendResponse(await masterController.deleteAccount(message.data))
                        return true;
                    }
                    //Change the name of a Coin
                    if (message.type === 'changeCoinNickname') {
                        sendResponse(await masterController.accounts.changeAccountNickname(message.data))
                        return true;
                    }
                    //Call the currentNetwork API to refresh all balances in the coinStore
                    if (message.type === 'balancesStoreUpdateAll') {
                        sendResponse(await masterController.updateAllBalances())
                        return true;
                    }
                    // Call to update both the token and account balances
                    if (message.type === 'updateAccountAndTokenBalances') {
                        sendResponse(await masterController.updateAccountAndTokenBalances())
                        return true;
                    }
                    // Call update balances and handle sockets when network switches
                    if (message.type === 'handleSwitchNetwork') {
                        sendResponse(await masterController.handleSwitchNetwork(message.data))
                        return true;
                    }
                    
                    //Call the currentNetwork API to refresh the balance of 1 coin/wallet in the coinStore
                    if (message.type === 'balancesStoreUpdateOne') {
                        sendResponse(await masterController.updateOneBalance(message.data))
                        return true;
                    }
                    //Call the currentNetwork API to refresh the balance of 1 coin/wallet in the coinStore
                    if (message.type === 'deleteOneBalance') {
                        sendResponse(await masterController.balances.deleteOneBalance(message.data))
                        return true;
                    }
                    //Delele all balances cache for a given network
                    if (message.type === 'balancesStoreClearNetwork') {
                        sendResponse(await masterController.clearNetworkBalances())
                        return true;
                    }
                    //Delele balances cache for all networks
                    if (message.type === 'balancesStoreClearAllNetworks') {
                        sendResponse(await masterController.balances.clearAllNetworks())
                        return true;
                    }
                    //Create and Send a transaction to the currentNetwork Masternode
                    if (message.type === 'sendLamdenTransaction') {
                        sendResponse(await masterController.initiateAppTxSend(message.data, sender))
                        return true;
                    }
                    //Retry to fetch tx result
                    if (message.type === 'retryFetchTransactionResult') {
                        sendResponse(masterController.retryFetchSendResult(message.data))
                        return true;
                    }
                    //Set a dApp as Trusted to enable auto transactions
                    if (message.type === 'setTrusted') {
                        sendResponse(await masterController.dapps.setTrusted(message.data))
                        return true;
                    }
                    //Remove a connection approval from a dApp, the dApp will have to reapprove
                    if (message.type === 'revokeDappAccess') {
                        sendResponse(await masterController.dapps.revokeAccess(message.data))
                        return true;
                    }
                    //Link a dapp to a new account
                    if (message.type === 'reassignDappAccess') {
                        sendResponse(await masterController.dapps.reassignLink(message.data))
                        return true;
                    }
                    //Reorder Account List
                    if (message.type === 'accountsReorderUp') {
                        await masterController.accounts.reorderUp(message.data, sendResponse)
                        return true;
                    }
                    if (message.type === 'accountsReorderDown') {
                        await masterController.accounts.reorderDown(message.data, sendResponse)
                        return true;
                    }
                    //Token Messages
                    if (message.type === 'tokensReorderUp') {
                        await masterController.tokens.reorderUp(message.data, sendResponse)
                        return true
                    }
                    if (message.type === 'tokensReorderDown') {
                        await masterController.tokens.reorderDown(message.data, sendResponse)
                        return true
                    }
                    if (message.type === 'addToken') {
                        await masterController.tokens.addToken(message.data, sendResponse)
                        return true;
                    }
                    if (message.type === 'updateToken') {
                        await masterController.tokens.updateToken(message.data, sendResponse)
                        return true;
                    }
                    if (message.type === 'deleteTokenOne') {
                        await masterController.tokens.deleteTokenOne(message.data, sendResponse)
                        return true;
                    }
                    if (message.type === 'deleteTokenAll') {
                        await masterController.tokens.deleteTokenAll(sendResponse)
                        return true;
                    }
                    if (message.type === 'validateTokenContract') {
                        await masterController.tokens.validateTokenContract(message.data, sendResponse)
                        return true;
                    }
                    if (message.type === 'getTokenMeta') {
                        await masterController.tokens.getTokenMeta(message.data, sendResponse)
                        return true;
                    }
                    if (message.type === 'tokenExists') {
                        await masterController.tokens.tokenExists(message.data, sendResponse)
                        return true;
                    }
                    if (message.type === 'refreshTokenBalances') {
                        await masterController.tokens.refreshTokenBalances()
                        return true;
                    }
                    if (message.type === 'refreshOneTokenBalances') {
                        await masterController.tokens.refreshOneTokenBalances(message.data)
                        return true;
                    }
                    
                    // State Queries
                    if (message.type === 'state_currentStamps') {
                        await masterController.state.getCurrentStamps(sendResponse)
                        return true
                    }

                    // Update nodes
                    if (message.type === 'updateNodes') {
                        await masterController.nodes.updateNodes()
                        return true
                    }

                    // Add node
                    if (message.type === 'addUnregisterNode') {
                        await masterController.nodes.addUnregisterNode(message.data, sendResponse)
                        return true
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
                if (message.type === 'getConfirmInfo') sendResponse(await masterController.dapps.getConfirmInfo(confirmHash))

                if (message.type === 'approveDapp') await masterController.dapps.approveDapp(sender, message.data)

                if (message.type === 'denyPopup'){
                    if (message.data === 'ApproveConnection') await masterController.dapps.rejectDapp(sender)
                    if (message.data === 'ApproveTransaction' || message.data === 'CurrencyApproval')await masterController.dapps.rejectTx(sender)
                }

                if (message.type === 'approveTransaction') await masterController.dapps.approveTransaction(sender)
                if (message.type === 'updateStampLimit') sendResponse(await masterController.dapps.updateStampLimit(confirmHash, message.data))
                return true
            }

            /*************************************************
            ** MESSAGES FROM AUTHORIZED DAPPs
            **************************************************/
            if (isFromAuthorizedDapp){
                //Send specifics about the wallet that the dApp may need to handle
                if (message.type === 'getWalletInfo') sendResponse(await masterController.getWalletInfo(dappInfo));
                //Process a transaction request sent from the dApp; same as from the Lamden Wallet App with two differences
                if (message.type === 'dAppSendLamdenTransaction') {
                    await masterController.initiateDAppTxSend(sender, message.data, dappInfo, sendResponse)
                }
                //Process a transaction request sent from the dApp; same as from the Lamden Wallet App with two differences
                if (message.type === 'auth') {
                    await masterController.accounts.auth(message.data, dappInfo, sendResponse)
                }
                return true
            }
        }
    }

    const onInstalledHandle = async (details) => {
        if (details.reason === "install") {
            await masterController.utils.networks.purgeNetworksStorage()
        }
        if (details.reason === "update"){
            let currVer = chrome.runtime.getManifest().version;
            let prevVer = details.previousVersion
            if (currVer > prevVer){
                await masterController.utils.networks.purgeNetworksStorage()

                await  masterController.dapps.purgeDappNetworkKeys()
                if (prevVer <= "0.12.0"){
                    await masterController.dapps.initiateTrustedApp()
                }
            }
        }
    } 

    return {msgHandle, onInstalledHandle}
}
