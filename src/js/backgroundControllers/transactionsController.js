export const transactionsController = (utils, services, actions) => {
    let nonceCache = {}
    let nonceRetryWaitTime = 1000;
    let nonceRetryTimes = 5;
    // const validateTypes = utils.validateTypes

    const sendLamdenTx = async (txBuilder, sentFrom = false) => {
        //Get current nonce from the masternode
        await txBuilder.getNonce()
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
                            utils.sendMessageToTab(sentFrom, 'txStatus', {txData: txBuilder.getAllInfo(), errors:[
                                'Unable to send transactions. Too many transactions pending in block.'
                            ]})
                        }
                        return
                    }else{
                        // sleep
                        await new Promise((resolve) => setTimeout(resolve, nonceRetryWaitTime))
                        
                        await sendLamdenTx(txBuilder, sentFrom)
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
        try{
            await actions.signTx(txBuilder)
        }catch(e){
            console.log(e)
        }
        if (txBuilder.transactionSigned){  
            txBuilder.send(undefined, (res, err) => {
                if (err) throw new Error(err)
                txBuilder.sentFrom = sentFrom;
                processSendResponse(txBuilder);
                if (sentFrom) utils.sendMessageToTab(sentFrom, 'txStatus', txBuilder.getAllInfo())
            }) 
        } 
    
    }
    
    const sendCurrencyTransaction = async (senderVk, to, amount, networkInfo) => {
        let account = await actions.getAccountByVK(senderVk)
        const txInfo = {
            senderVk: account.vk,
            contractName: "currency",
            methodName: "transfer",
            kwargs: {
                "to": to,
                "amount": utils.Lamden.Encoder('float', amount)
            },
            stampLimit: 33
        }
        
        let txBuilder = new utils.Lamden.TransactionBuilder(networkInfo, txInfo)
        await sendLamdenTx(txBuilder)
    }
    
    const processSendResponse = (txBuilder) => {
        const result = txBuilder.txSendResult;
        if (result.hash){
            let txData = txBuilder.getAllInfo();
            txData.sentFrom = txBuilder.sentFrom;
            utils.sendMessageToTab(txData.sentFrom, 'txSent', txData)
        }
    }
    
    const processRetry = (txData) => {
        utils.sendMessageToTab(txData.sentFrom, 'txSent', txData)
    }

    // const checkPendingTransactions = async () => {
    //     if (!checkingTransactions){
    //         checkingTransactions = true;
    //         const transactionsToCheck = pendingTxStore.length;
    //         let transactionsChecked = 0;
    //         for (let i = 0; i < transactionsToCheck; i++){
    //             const tx = pendingTxStore[i]
    //             const txBuilder = new utils.Lamden.TransactionBuilder(tx.networkInfo, tx.txInfo, tx)
    //             await txBuilder.checkForTransactionResult()
    //             .then(() => {
    //                 transactionsChecked = transactionsChecked + 1
    //                 if (tx.sentFrom) utils.sendMessageToTab(tx.sentFrom, 'txStatus', txBuilder.getAllInfo())
    //                 if (transactionsChecked >= transactionsToCheck){ 
    //                     pendingTxStore = pendingTxStore.slice(transactionsToCheck)
    //                     chrome.storage.local.set({"pendingTxs": pendingTxStore}, () => {
    //                         checkingTransactions = false;
    //                     });
    //                 }
    //             })
    //         }
    //     }
    // }


    // // Timer to check pending transacations
    // setTimeout(async function resolvePendingTxs() {
    //     if (typeof pendingTxStore.length === 'undefined'){
    //         pendingTxStore = []
    //         chrome.storage.local.set({"pendingTxs": pendingTxStore})
    //     } else {
    //         if (Object.keys(nonceCache).length > 0){
    //             if ((new Date().getTime() - new Date(lastSentDate).getTime() > 10000) && !checkingTransactions ){
    //                 nonceCache = {}
    //             }
    //         }
    //         if (!checkingTransactions && pendingTxStore.length > 0){
    //             await checkPendingTransactions()
    //         }
    //     } 
    //     timerId = setTimeout(resolvePendingTxs, 100);
    // }, 1000);

    // const timerTask = () => {
    //     // Timer to check pending transacations
    //     let timerId = setInterval(async function resolvePendingTxs() {
    //         if (isBlockserviceProvided) {
    //             // If block service provided, then clear timer
    //             clearInterval(timerId)
    //         }
    //         if (typeof pendingTxStore.length === 'undefined'){
    //             pendingTxStore = []
    //             chrome.storage.local.set({"pendingTxs": pendingTxStore})
    //         } else {
    //             if (Object.keys(nonceCache).length > 0){
    //                 if ((new Date().getTime() - new Date(lastSentDate).getTime() > 10000) && !checkingTransactions ){
    //                     nonceCache = {}
    //                 }
    //             }
    //             if (!checkingTransactions && pendingTxStore.length > 0){
    //                 await checkPendingTransactions()
    //             }
    //         } 
    //     }, 1000);
    // }

    return {
        sendLamdenTx,
        sendCurrencyTransaction,
        processRetry,
    }
}