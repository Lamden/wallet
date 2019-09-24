<script>
    import { getContext} from 'svelte';

	//Stores
    import { CoinStore, Hash, getCoinReference } from '../../js/stores.js';
    
    //Components
    import { SupportedCoinsDropDown, MyCoinsDropDown }  from '../../js/router.js'

    // Utils
    import { API } from '../../js/api.js';
    import { checkPassword, encryptStrHash, decryptStrHash, stripCoinRef } from '../../js/utils.js';
    import { validateAddress, signTx } from '../../js/crypto/wallets.js';

    //Context
    const { switchPage } = getContext('switchPage');

    //DOM Nodes
    let formObj, sendingValueField, receivingValueField, sendingWalletField1, sendingWalletField2, receivingWalletField ,passwordField;

    console.log("MOCKED DATA FOR TESTING")

    let error = '';
    let password = 'Summer0!0101';
    let ApiResponse;
    let status = {current: '', pending: ''};

    let coinETH = {"name": "Ethereum TestNet (kovan)", "network": "ethereum" , "symbol" : "ETH-TESTNET", "testnet" : true, 'is_token': false};
    let sending = { coin: {}, 
                    value:0.0001, 
                    theirVk: "mqkaog8wXk9juy7XcyjGhBwHX13ECyaz38",};
    let receiving = { coin: coinETH, 
                      value:0.002, 
                      myVk: "0x5b85bF11009e02267dD78B4502ffF3c2FE88EB31",};
    $: coinsSelected = typeof sending.coin.network !== "undefined" && typeof receiving.coin.network !== "undefined";

    let initialInfo = {};
    let publishTxSuccess = false;
    let checkerInterval = 10;
    let checkerTimeout = checkerInterval * 60;

    function handleSelection(evt, type){
        if (type === 'send') {sending.coin = stripCoinRef(evt.detail.selected); console.log(sending)}
        if (type === 'receive') receiving.coin = stripCoinRef(evt.detail.selected);
    }

    function handleSubmit(obj){
         error = '';
        if (obj.checkValidity()){
            if (sending.coin.is_token){
                getApproveTokenTxDetails();
            }else{
                getSwapContractTxDetails();
            }

            
        }
    }

    function getApproveTokenTxDetails(){
        status.pending = 'Retriving TX details to Approve Token Transfer';
        status.current = 'Recieved Token Approval TX Details!';
        let data = {'value': sending.value}
        let path = `${sending.coin.network_symbol}/${sending.coin.vk}/${sending.coin.token_address}`
        ApiResponse =  API('POST', 'approve-token', path, data)
            .then(result => { console.log(result); return result; })
            .then(result => { sendApproveTokenTx(result);; return result; })
            .catch (e => { console.log(e); error = e; })
    }

    function sendApproveTokenTx(approveTxInfo){
        if (approveTxInfo.message) {error = swapInfo.message; return;}
        status.current = 'Signing Approve Transaction';
        let signed_transaction = "";
        try{
            signed_transaction = signTx(approveTxInfo.transaction, decryptStrHash(password, sending.coin.sk), sending.coin.network, sending.coin.network_symbol);
            status.current = 'Transaction Signed!';
        }catch (e) {
            console.log(e)
            error = e;
        }
        status.pending = `Sending Transaction to Approve Token Transfer of ${sending.value} ${sending.coin.symbol}`;
        status.current = 'Approve Token Transaction Sent!';
        var data = {'raw_transaction': signed_transaction}
        publishTxSuccess = false;
        /*
        API('POST', 'publish-transaction', sending.coin.network_symbol, data)
            .then(result => { 
                console.log(result);
                if (result.message) {error = result.message; return;}
                initialInfoObject.approveToken = approveTxInfo;
                initialInfoObject.approveToken.txResult = result;
                waitUntilTransactionExists(result.transaction_address, getSwapContractTxDetails());
            })
            */
    }

    function waitUntilTransactionExists(transaction, callback) {
        callback = callback || undefined;
        const checker = setInterval(
            (() => {
            if (publishTxSuccess) {
                clearInterval(checker);
                //callback();
                return;
            }
            checkTransaction(transaction);
            }), checkerInterval * 1000);

            setTimeout(() => {
                clearInterval(checker);
                if (!publishTxSuccess) {
                    error = 'Unable to find transaction in block.';
                }
            }, checkerTimeout * 1000);
    }

    function checkTransaction(transaction) {
        const network_symbol = sending.coin.is_token ? sending.coin.network_symbol : sending.coin.symbol;
        const path = `${network_symbol}/${transaction}`
        ApiResponse =  API('GET', 'check-transaction', path)
            .then((result) => {
                console.log(result);
                if (result.txid) {
                    publishTxSuccess = true;
            }})
    }

    function getSwapContractTxDetails(){
        status.pending = 'Retriving Swap Details from API';
        status.current = 'Recieved Swap Details!';
        let data = {'value': sending.value}
        let path = `${sending.coin.symbol}/${sending.coin.vk}/${sending.theirVk}`
        ApiResponse =  API('POST', 'atomic-swap', path, data)
            .then(result => { console.log(result); return result; })
            .then(result => { sendToSwapContract(result);; return result; })
            .catch (e => { console.log(e); error = e; })
    }

    function sendToSwapContract(swapInfo){
        if (swapInfo.message) {error = swapInfo.message; return;}
        status.pending = `Sending ${sending.value} ${sending.coin.symbol} to Lamden Swap Contract`;
        status.current = 'Tranasction Sent!';
        const network_symbol = sending.coin.is_token ? sending.coin.network_symbol : sending.coin.symbol;
        const raw_transaction =  sending.coin.network === 'ethereum'  ?  swapInfo.transaction : swapInfo.contract_transaction;

        let signed_transaction = "";
        try{
            signed_transaction = signTx(raw_transaction, decryptStrHash(password, sending.coin.sk), sending.coin.network, network_symbol);
        }catch (e) {
            console.log(e)
            error = e;
        }

        const data = {'raw_transaction': signed_transaction}
        API('POST', 'publish-transaction', network_symbol, data)
            .then(result => { 
                console.log(result); 
                waitUntilTransactionExists(result.transaction_address, finishInitial(result, swapInfo));
            })
    }

    function finishInitial(publishResult, swapInfo){
        initialInfo.swapContract = swapInfo;
        initialInfo.swapContract.txResult = publishResult;
        initialInfo.swapContract.secret = encryptStrHash(password, swapInfo.secret)
        initialInfo.sending = sending;
        initialInfo.receiving = receiving;
        initialInfo.created = new Date();
        CoinStore.storeSwapInfo(sending.coin, initialInfo, 'initial');
        switchPage('SwapsMain');
    }

    function validatePassword(){
        passwordField.setCustomValidity('');
        if (!checkPassword(password, $Hash)) {
            passwordField.setCustomValidity("Incorrect Password");
        }
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
    {error}
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

                {#if sending.coin.symbol !== undefined}
                    <div>
                        <lable> {`My ${sending.coin.symbol} Wallet Address`} </lable>
                        <input type="text" 
                            bind:value={sending.coin.vk}
                            bind:this={sendingWalletField1}
                            disabled
                            required />
                        <br>
                        <lable> {`Their ${sending.coin.symbol} Wallet Address`} </lable>
                        <input type="text" 
                            bind:value={sending.theirVk}
                            bind:this={sendingWalletField2}
                            required />
                    </div>
                {/if}
            </div>
            <div>
                <lable>I want</lable>
                <SupportedCoinsDropDown id="receiveDD" 
                            on:selected={(evt) => handleSelection(evt, 'receive')} 
                            required={true} />

                <lable>Amount</lable>
                <input type="number" step="any" 
                    bind:value={receiving.value}
                    bind:this={receivingValueField}
                    required />

                {#if receiving.coin.symbol !== undefined}
                    <div>
                        <lable> {`My ${receiving.coin.symbol} Wallet Address`} </lable>
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

    {#if ApiResponse }
        {#await ApiResponse}
            <h3>{status.pending}</h3>
        {:then data}
            <h3>{status.current}</h3>
        {:catch}
            {error}
        {/await}
    {/if}
</div>