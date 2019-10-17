<script>
    import { getContext} from 'svelte';

	//Stores
    import { CoinStore, Hash, getCoinReference } from '../../js/stores.js';
    
    //Components
    import { SupportedCoinsDropDown, MyCoinsDropDown }  from '../../js/router.js'

    // Utils
    import { API, waitUntilTransactionExists, getSwapInfo, getTokenInfo, getApproveTokenTxDetails, sendSignedTx } from '../../js/api.js';
    import { checkPassword, encryptStrHash, decryptStrHash, stripCoinRef } from '../../js/utils.js';
    import { validateAddress, signTx } from '../../js/crypto/wallets.js';

    //Context
    const { switchPage } = getContext('switchPage');

    //DOM Nodes
    let formObj, sendingValueField, receivingValueField, sendingWalletField1, sendingWalletField2, receivingWalletField ,passwordField;

    const CLOVE_URL = 'https://clove.lamden.io';

    console.log("MOCKED DATA FOR TESTING")
    let error = '';
    let password = '';
    let ApiResponse;
    let status = '';

    let sending = { 
                    value:0.0021, 
                    theirVk: "0xcf3710B87358c68bF7cDabf4f40b91d2960F3a98",
                  };
    
    let receiving = { 
                    value:1, 
                    myVk: "0x5b85bF11009e02267dD78B4502ffF3c2FE88EB31",
                    };

    let sendingCoin = {};
    let receivingCoin = {};

    $: coinsSelected = typeof sendingCoin.network !== "undefined" && typeof receivingCoin.network !== "undefined";

    let swapInfo = {};
    let publishTxSuccess = false;
    let checkerInterval = 10;
    let checkerTimeout = checkerInterval * 60;

    function handleSelection(evt, type){
        console.log(evt.detail.selected)
        if (type === 'send') sendingCoin = stripCoinRef(evt.detail.selected);
        if (type === 'receive') receivingCoin = stripCoinRef(evt.detail.selected);
    }

    function validatePassword(){
        passwordField.setCustomValidity('');
        if (!checkPassword(password, $Hash)) {
            passwordField.setCustomValidity("Incorrect Password");
        }
    }

    async function handleSubmit(obj){
         error = '';
        if (obj.checkValidity()){
            if (sendingCoin.is_token){
                await approveTokenTxDetails()
                if (swapInfo.hasOwnProperty('approveTxInfo')){
                    await sign('approveTxInfo');
                    await sendApproveTx();
                }
                if (swapInfo.hasOwnProperty('approveTxResult')) await checkApproveTx();
            }

            if (error === ""){
                await initialTxDetails();

                if (swapInfo.hasOwnProperty('txInfo')){
                    await storeInitialInfo();
                    await sign('txInfo');
                    await sendTx('txInfo', swapInfo.sending.network_symbol );
                }

                if (swapInfo.hasOwnProperty('txResult')) checkTx();
            }
        }
    }

    async function approveTokenTxDetails(){
        status = 'Getting Approve Token Details...';
        let approveTxInfo = await getApproveTokenTxDetails(sendingCoin.network_symbol, sending.value, sendingCoin.vk, sendingCoin.token_address)
                                    .catch (e => { console.log(e); error = e; });
        if (!approveTxInfo) return;
        if (approveTxInfo.message) {error = approveTxInfo.message; return;}
        swapInfo.approveTxInfo = approveTxInfo;
        status = 'Approve Token Details Recieved!';
    }

    async function sendApproveTx(){
        status = 'Sending Approve Token Transaction...';
        let approveTxResult = await sendSignedTx( await signedTx(approveTxInfo) )            
                                        .catch (e => { console.log(e); error = e; });
        if (!approveTxResult) return;
        if (approveTxResult.message) {error = approveTxResult.message; return;}
        swapInfo.approveTxResult = approveTxResult;
        status = 'Approve Token Transaction Sent!';
    }

    async function checkApproveTx(){
        //Check to make sure the transaction was published (does not mean confirmed)
        let approveTxOkay = await checkPublish(approveTxResult.transaction_address);
        if (!approveTxOkay) return;
        swapInfo.approveTxResult.sent = new Date();
    }

    async function initialTxDetails(){
        status = 'Getting Intial Swap Transaction Details...';
        let txInfo = await getInitalTxDetails()
                            .catch (e => { console.log(e); error = e; });;
        if (!txInfo) return;
        if (txInfo.message) {error = txInfo.message; return;}
        swapInfo.txInfo = txInfo;
        status = 'Intial Swap Transaction Details Recieved!';
    }

    async function sendTx(txName){
        status = 'Sending Intial Swap Transaction...';
        let txResult = await sendSignedTx( swapInfo[txName].signed_transaction, swapInfo.sending.network_symbol )            
                            .catch (e => { console.log(e); error = e; });
        if (!txResult) return;
        if (txResult.message) {error = txResult.message; return;}
    }

    async function checkTx(){
        //Check to make sure the transaction was published (does not mean confirmed)
        let txOkay = await checkPublish(txResult.transaction_address);
        if (txOkay) {
            status = 'Intial Swap Transaction Sent!';
            swapInfo.txResult = txResult;
            swapInfo.txResult.sent = new Date();
            try{
                CoinStore.updateSwapInfo(swapInfo.sending, swapInfo.txInfo.secret_hash, 'txResult', swapInfo.txResult);
            } catch (e){
                console.log(e)
                error = e;
                return;
            }
            finishInitialSwap();
        }
    }


    function sign(txName){
        status = 'Signing Transaction';
        let txInfo = swapInfo[txName]
        const network_symbol = sendingCoin.is_token ? sendingCoin.network_symbol : sendingCoin.symbol;
        const unsigned_transaction =  sendingCoin.network === 'ethereum'  ?  txInfo.transaction : txInfo.contract_transaction;
        let signed_transaction = "";
        try{
            signed_transaction = signTx(unsigned_transaction, decryptStrHash(password, sendingCoin.sk), sendingCoin.network, network_symbol);
        }catch (e) {
            console.log(e)
            error = e;
        }
        swapInfo[txName].signed_transaction = signed_transaction;
        status = 'Transaction Signed!';
    }

    function getInitalTxDetails(){
        const data = {'value': sending.value}
        const network_symbol = sendingCoin.is_token ? sendingCoin.network_symbol : sendingCoin.symbol;
        let path = `${network_symbol}/${sendingCoin.vk}/${sending.theirVk}`
        if (sendingCoin.is_token) path = `${path}/${sendingCoin.token_address}`;
        return API('POST', 'atomic-swap', path, data)
            .catch (e => { console.log(e); error = e; })
    }

    function storeInitialInfo(){
        swapInfo.type = 'initial';
        swapInfo.txInfo.secret = encryptStrHash(password, swapInfo.txInfo.secret);
        swapInfo.sending = {...sending, ...sendingCoin };
        if (swapInfo.sending.address) delete swapInfo.sending.address;
        swapInfo.receiving = {...receiving, ...receivingCoin };
        if (swapInfo.receiving.address) delete swapInfo.receiving.address;
        swapInfo.created = new Date();
        CoinStore.storeSwapInfo(swapInfo.sending, swapInfo);
    }

    function finishInitialSwap(){
        try{
            CoinStore.updateSwapInfo(swapInfo.sending, swapInfo.txInfo.secret_hash, 'participateLink', participateLink());
            CoinStore.updateSwapInfo(swapInfo.sending, swapInfo.txInfo.secret_hash, 'participateInfo', participateInfo());
            switchPage('SwapsMain');
        } catch (e){
            console.log(e)
            error = e;
            return;
        }        
    }

    function participateInfo() {
        const linkContent = {
            contract: swapInfo.txInfo.contract_address || swapInfo.txInfo.contract,
            transactionAddress: swapInfo.txResult.transaction_address,
            initialCurrency: swapInfo.sending.symbol,
            participateAliceAddress: swapInfo.receiving.myVk,
            participateCurrency: swapInfo.receiving.symbol,
            participateValue: swapInfo.receiving.value,
        };
        if (sendingCoin.is_token){
            linkContent.initialCurrency = swapInfo.sending.network_symbol;
        };
        if (receivingCoin.is_token){
            linkContent.participateTokenAddress = swapInfo.receiving.token_address;
            linkContent.participateCurrency = swapInfo.receiving.network_symbol;
        };
        console.log(linkContent);
        return JSON.stringify(linkContent);
    }

    function participateLink() {
      return `${CLOVE_URL}/#/participate/wallet-addresses/${btoa(participateInfo())}`;
    }

    function checkPublish(transaction) {
            status = `Waiting for Tx to Publish`;
            const network_symbol = sendingCoin.is_token ? sendingCoin.network_symbol : sendingCoin.symbol;
            return waitUntilTransactionExists(network_symbol, transaction)
                .then(result => {
                    if (result) {status = "Transaction Published"; return true};
                    if (!result) status = "Could not find transaction in block";
                    return false;
                })
                .catch(e => error = e);
    }

</script>

<style>
input[type="text"] {
    width: 400px;
}

div{
    margin-bottom: 1rem;
}
</style>


<div>
    {#if error}<p class="error">{error}</p>{:else}{status}{/if}
    <h1> Create a Lamden Swap</h1>

    <form on:submit|preventDefault={() => handleSubmit(formObj) } bind:this={formObj} target="_self">
            <div>
                <lable>I have</lable>
                <MyCoinsDropDown id="sendingDD" 
                            on:selected={(evt) => handleSelection(evt, 'send')}
                            required={true} />

                <lable>Amount</lable>
                <input type="number" step="any"
                    bind:value={sending.value}
                    bind:this={sendingValueField}
                    required />

                {#if sendingCoin.symbol !== undefined}
                    <div>
                        <lable> {`My ${sendingCoin.symbol} Wallet Address`} </lable>
                        <input type="text" 
                            bind:value={sendingCoin.vk}
                            bind:this={sendingWalletField1}
                            disabled
                            required />
                        <br>
                        <lable> {`Their ${sendingCoin.symbol} Wallet Address`} </lable>
                        <input type="text" 
                            bind:value={sending.theirVk}
                            bind:this={sendingWalletField2}
                            required />
                    </div>
                {/if}
            </div>
            <div>
                <lable>I want</lable>
                <MyCoinsDropDown id="receiveDD" 
                            on:selected={(evt) => handleSelection(evt, 'receive')} 
                            required={true} />

                <lable>Amount</lable>
                <input type="number" step="any" 
                    bind:value={receiving.value}
                    bind:this={receivingValueField}
                    required />

                {#if receivingCoin.symbol !== undefined}
                    <div>
                        <lable> {`My ${receivingCoin.symbol} Wallet Address`} </lable>
                        <input type="text" 
                            bind:value={receiving.myVk}
                            bind:this={receivingWalletField}
                            required />
                    </div>
                {/if}
            </div>
            <div>
                <label>Wallet Password</label><br>
                <input  bind:value={password}
                        bind:this={passwordField}
                        on:change={() => validatePassword()}
                        type="password"
                        required  />
            </div>
            <input type="submit" value="Create Swap" required disabled={!coinsSelected}>
    </form>
</div>