const validators = require('types-validate-assert')
const { validateTypes } = validators

export const messagesHandler = (masterController) => {
    const fromApp = (url) => {
        return url === `${window.location.origin}/app.html`
    }
    const fromConfirm = (url) => {
        return url.split('#')[0] === `${window.location.origin}/confirm.html`
    }
    /*****************************************************************************
    * In App/Dapp message handling
    * This routine is a 'sender' filter for chrome extention message API to seperate messages from the App itself
    * from outside webpages.  This isolates the sensitive information stored in the background page to the App and autorized Dapps.
    *****************************************************************************/
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        const sendErrors = (errors) => sendResponse({errors})

        if (chrome.runtime.lastError) return;

        const isFromAuthorizedDapp = masterController.fromAuthorizedDapp(sender.origin); 
        const dappInfo = isFromAuthorizedDapp ? masterController.dapps.getDappInfoByURL(sender.origin) : undefined;
        const isFromApp = fromApp(sender.url);
        const isFromConfirm = fromConfirm(sender.url);
        const walletIsLocked = masterController.accounts.walletIsLocked();

    /*************************************************
        ** AUTHORIZATION MESSAGES
        **************************************************/
        //Process connection messages to have the user authorize an app
        if (message.type === 'lamdenWalletConnect') {
            //Reject if wallet is locked as we won't have the user's password stored to encrypt the new keypair
            if (walletIsLocked){
                sendErrors(["Wallet is Locked"])
                return
            }
            //Make sure the connection request is valid before processing; return erros to dApp
            const connectionMessage = masterController.dapps.validateConnectionMessage(message.data)
            if (validateTypes.hasKeys(connectionMessage, ['errors'])){
                sendErrors(connectionMessage.errors)
                return
            }else{
                try{
                    //If this dApp is already approved get send the wallet info
                    if (dappInfo[connectionMessage.networkType].contractName === connectionMessage.contractName){
                        //if the connection info is a greater version than the one that exists
                        let version = dappInfo[connectionMessage.networkType].version || "0.0.1"
                        if (connectionMessage.version > version){
                            masterController.dapps.updateDapp(dappInfo, connectionMessage)
                        }
                        sendResponse(masterController.getWalletInfo(dappInfo));
                        return
                    }else{
                        let version = dappInfo[connectionMessage.networkType].version || "0.0.1"
                        if (connectionMessage.version > version){
                            masterController.promptApproveDapp(sender, connectionMessage, true, dappInfo)
                            
                        }
                        return
                    }
                }catch (e){
                    console.log(e)
                }
                masterController.promptApproveDapp(sender, connectionMessage)
                return
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
                if(message.type === 'createPassword') sendResponse(masterController.createPassword(message.data))
                //Check if the wallet has been setup yet
                if(message.type === 'isFirstRun')sendResponse(masterController.accounts.firstRun())
                //Unlock the wallet
                if (message.type === 'unlockWallet') sendResponse(masterController.unlock(message.data))
                //Check the password is correct
                if (message.type === 'validatePassword') sendResponse(masterController.accounts.validatePassword(message.data))
                //Respond to request checking if the wallet is locked
                if (message.type === 'walletIsLocked') sendResponse(masterController.accounts.walletIsLocked())
                //Lock the wallet
                if (message.type === 'lockWallet') sendResponse(masterController.lock())
                //Only Allow access to these messages processors if the wallet is Unlocked
                if (!walletIsLocked){
                    //Create a keystore file that is encrypted with a new password, decrypting all sk's first
                    if (message.type === 'backupCoinstore') sendResponse(masterController.accounts.createKeystore(message.data))
                    //Decrypt all keys, for use when user wants to view their secret keys in the UI
                    if (message.type === 'decryptStore') sendResponse(masterController.accounts.decryptKeys(message.data))
                    //Add a Lamnden Coin to the coinStore
                    if (message.type === 'accountsAddNewLamden') sendResponse(masterController.accounts.addNewLamdenAccount(message.data))
                    //Add a coin just for watching
                    if (message.type === 'accountsAddOne') sendResponse(masterController.accounts.addOne(message.data))
                    //Updated the sk of a previously only watched coin
                    if (message.type === 'updateWatchedCoin') sendResponse(masterController.accounts.addOne(message.data))
                    //Process a keystore file
                    if (message.type === "accountsAddMany") {
                        masterController.accounts.addMany(message.data, sendResponse)
                        return true
                    }
                    //Delete a coin/wallet from the coinStore
                    if (message.type === 'coinStoreDelete') sendResponse(masterController.deleteAccount(message.data))
                    //Change the name of a Coin
                    if (message.type === 'changeCoinNickname') sendResponse(masterController.accounts.changeAccountNickname(message.data))
                    //Call the currentNetwork API to refresh all balances in the coinStore
                    if (message.type === 'balancesStoreUpdateAll') sendResponse(masterController.updateAllBalances())
                    // Call to update both the token and account balances
                    if (message.type === 'updateAccountAndTokenBalances') sendResponse(masterController.updateAccountAndTokenBalances())
                    // Call update balances and handle sockets when network switches
                    if (message.type === 'handleSwitchNetwork') sendResponse(masterController.handleSwitchNetwork(message.data))
                    // Call join all the balance/token update sockets and refresh balances
                    if (message.type === 'joinSocket') sendResponse(masterController.balances.joinSocket(message.data))
                    // Call join all the balance/token update sockets and refresh balances
                    if (message.type === 'joinSockets') sendResponse(masterController.joinSockets())
                    //Call the currentNetwork API to refresh the balance of 1 coin/wallet in the coinStore
                    if (message.type === 'balancesStoreUpdateOne') sendResponse(masterController.updateOneBalance(message.data))
                    //Call the currentNetwork API to refresh the balance of 1 coin/wallet in the coinStore
                    if (message.type === 'deleteOneBalance') sendResponse(masterController.balances.deleteOneBalance(message.data))
                    //Delele all balances cache for a given network
                    if (message.type === 'balancesStoreClearNetwork') sendResponse(masterController.clearNetworkBalances())
                    //Delele balances cache for all networks
                    if (message.type === 'balancesStoreClearAllNetworks') sendResponse(masterController.balances.clearAllNetworks())
                    //Create and Send a transaction to the currentNetwork Masternode
                    if (message.type === 'sendLamdenTransaction') sendResponse(masterController.initiateAppTxSend(message.data, sender))
                    //Set a dApp as Trusted to enable auto transactions
                    if (message.type === 'setTrusted') sendResponse(masterController.dapps.setTrusted(message.data))
                    //Remove a connection approval from a dApp, the dApp will have to reapprove
                    if (message.type === 'revokeDappAccess') sendResponse(masterController.dapps.revokeAccess(message.data))
                    //Link a dapp to a new account
                    if (message.type === 'reassignDappAccess') sendResponse(masterController.dapps.reassignLink(message.data))
                    //Reorder Account List
                    if (message.type === 'accountsReorderUp') {
                        masterController.accounts.reorderUp(message.data, sendResponse)
                    }
                    if (message.type === 'accountsReorderDown') {
                        masterController.accounts.reorderDown(message.data, sendResponse)
                    }
                    //Token Messages
                    if (message.type === 'tokensReorderUp') {
                        masterController.tokens.reorderUp(message.data, sendResponse)
                    }
                    if (message.type === 'tokensReorderDown') {
                        masterController.tokens.reorderDown(message.data, sendResponse)
                    }
                    if (message.type === 'addToken') {
                        masterController.tokens.addToken(message.data, sendResponse)
                        return true;
                    }
                    if (message.type === 'updateToken') {
                        masterController.tokens.updateToken(message.data, sendResponse)
                        return true;
                    }
                    if (message.type === 'deleteTokenOne') {
                        masterController.tokens.deleteTokenOne(message.data, sendResponse)
                        return true;
                    }
                    if (message.type === 'deleteTokenAll') {
                        masterController.tokens.deleteTokenAll(sendResponse)
                        return true;
                    }
                    if (message.type === 'validateTokenContract') {
                        masterController.tokens.validateTokenContract(message.data, sendResponse)
                        return true;
                    }
                    if (message.type === 'getTokenMeta') {
                        masterController.tokens.getTokenMeta(message.data, sendResponse)
                        return true;
                    }
                    if (message.type === 'tokenExists') {
                        masterController.tokens.tokenExists(message.data, sendResponse)
                        return true;
                    }
                    if (message.type === 'refreshTokenBalances') {
                        masterController.tokens.refreshTokenBalances()
                        return true;
                    }
                    if (message.type === 'refreshOneTokenBalances') {
                        masterController.tokens.refreshOneTokenBalances(message.data)
                        return true;
                    }
                    // Call leave all token sockets for a network
                    if (message.type === 'leaveTokenSockets') {
                        sendResponse(masterController.leaveTokenSockets(message.data))
                    }
                    // Call leave all token sockets for a network
                    if (message.type === 'joinTokenSocket') {
                        sendResponse(masterController.joinTokenSocket(message.data))
                    }

                    // State Queries
                    if (message.type === 'state_currentStamps') {
                        masterController.state.getCurrentStamps(sendResponse)
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
                if (message.type === 'getConfirmInfo') sendResponse(masterController.dapps.getConfirmInfo(confirmHash))

                if (message.type === 'approveDapp') masterController.dapps.approveDapp(sender, message.data)

                if (message.type === 'denyPopup'){
                    if (message.data === 'ApproveConnection') masterController.dapps.rejectDapp(sender)
                    if (message.data === 'ApproveTransaction' || message.data === 'CurrencyApproval') masterController.dapps.rejectTx(sender)
                }

                if (message.type === 'approveTransaction') masterController.dapps.approveTransaction(sender)
            }

            /*************************************************
            ** MESSAGES FROM AUTHORIZED DAPPs
            **************************************************/
            if (isFromAuthorizedDapp){
                //Send specifics about the wallet that the dApp may need to handle
                if (message.type === 'getWalletInfo') sendResponse(masterController.getWalletInfo(dappInfo));
                //Process a transaction request sent from the dApp; same as from the Lamden Wallet App with two differences
                if (message.type === 'dAppSendLamdenTransaction') {
                    masterController.initiateDAppTxSend(sender, message.data, dappInfo, sendResponse)
                }
                //Process an account change request sent from the dApp;
                if (message.type === 'changeLinkAccount') {
                    masterController.promptChangeAccount(sender, dappInfo)
                }
            }
        }
    });
}