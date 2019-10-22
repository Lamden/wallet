<script>
    import { onMount, getContext } from 'svelte';

	//Stores
    import { SettingsStore, CoinStore, SwapStore, Hash, getCoinReference } from '../../js/stores.js';
    
    //Components
    import { SupportedCoinsDropDown, MyCoinsDropDown }  from '../../js/router.js'

    // Utils
    import { API, waitUntilTransactionExists, getSwapInfo, getTokenInfo, getApproveTokenTxDetails, sendSignedTx } from '../../js/api.js';
    import { checkPassword, encryptStrHash, decryptStrHash, stripCoinRef } from '../../js/utils.js';
    import { validateAddress, signTx } from '../../js/crypto/wallets.js';

    //Context
    const { switchPage } = getContext('switchPage');

    //DOM Nodes
    let formObj1, formObj2, sendingValueField, receivingValueField, sendingWalletField1, sendingWalletField2, receivingWalletField ,passwordField;

    let error, status = '';
    let password = '';

    let sending = { value: 0, theirVk: ""};
    let receiving = { value: 0 };
    let sendingCoin = {};
    let receivingCoin = {};

    $: coinsSelected = typeof sendingCoin.network !== "undefined" && typeof receivingCoin.network !== "undefined";
    let swapInfo = {};

    onMount(() => {
        if ($SettingsStore.currentPage.data.type === 'initial'){
            swapInfo = $SettingsStore.currentPage.data;
            $SettingsStore.currentPage.data = {};
        }else{
            swapInfo = {};
        }
    });

    function displayError(e){
        console.log(e); 
        error = e;
        throw new Error(e);
    }

    function handleSelection(evt, type){
        if (type === 'send') sendingCoin = stripCoinRef(evt.detail.selected);
        if (type === 'receive') receivingCoin = stripCoinRef(evt.detail.selected);
    }

    function validatePassword(){
        passwordField.setCustomValidity('');
        if (!checkPassword(password, $Hash)) {
            passwordField.setCustomValidity("Incorrect Password");
        }
    }

    function txConfirmed(txInfo){
        if(txInfo.sent) return true;
        return false;
    }

    async function handleSubmit1(){
         error = '';
        if (formObj1.checkValidity()){
            await createInitialInfo();
            if (swapInfo.sending.is_token){
                if (!swapInfo.hasOwnProperty('approveTxResult')){
                    swapInfo.approveTx = await approveTokenTxDetails( swapInfo.sending );

                    status = 'Signing Approve Token Transaction';
                    swapInfo.approveTx.signed_transaction = await sign( swapInfo.approveTx, swapInfo.sending );

                    status = 'Publishing Approve Token Transaction...';
                    swapInfo.approveTxResult = await sendTx( swapInfo.sending.network_symbol, swapInfo.approveTx.signed_transaction );

                    status = 'Checking for Confirmation of Approve Token Transaction...';
                    if ( await confirmSwapTransaction(swapInfo.approveTxResult, swapInfo.sending) ) {
                        status = 'Approve Token Transaction Confirmed!';
                        swapInfo.approveTxResult.sent = new Date();
                    }else{
                        displayError('Error: Cannot Approve Token Transaction.')
                        switchPage('SwapsMain');
                    }
                }
            }

            swapInfo.sendCoinsTx = await initialTxDetails( swapInfo.sending );
            
            await storeSwap(swapInfo, password);
            switchPage('SwapsMain');
        }
    }

    async function handleSubmit2(){
         error = '';
        if (formObj2.checkValidity()){
            if (!swapInfo.hasOwnProperty('sendCoinsTxResult')){
                status = 'Signing Send Coin Transaction';
                swapInfo.sendCoinsTx.signed_transaction = await sign( swapInfo.sendCoinsTx, swapInfo.sending );

                status = 'Publishing Send Coin Transaction...';
                swapInfo.sendCoinsTxResult = await sendTx( swapInfo.sending.network_symbol, swapInfo.sendCoinsTx.signed_transaction );
                
                await updateSwapStore( swapInfo );
                switchPage('SwapsMain');
            }
        }
    }

    function initialTxDetails(coin){
        status = 'Getting Intial Swap Transaction Details...';
        const data = { "value" : coin.value }
        let path = `${coin.network_symbol}/${coin.vk}/${coin.theirVk}`
        if (coin.is_token) path = `${path}/${coin.token_address}`;
        return API('POST', 'atomic-swap', path, data)
                .then(result => {
                    if (result.message) { displayError( result.message ); return; }
                    status = 'Intial Swap Transaction Details Recieved!';
                    return result;
                })
                .catch ( e => displayError(e) );
    }

    function createInitialInfo(){
        swapInfo.type = 'initial';
        swapInfo.sending = {...sending, ...sendingCoin };
        if (swapInfo.sending.address) delete swapInfo.sending.address;
        swapInfo.receiving = {...receiving, ...receivingCoin };
        if (swapInfo.receiving.address) delete swapInfo.receiving.address;
        swapInfo.created = new Date();
    }

    function approveTokenTxDetails(coin){
        status = 'Getting Approve Token Details...';
        return getApproveTokenTxDetails(coin.network_symbol, coin.value, coin.vk, coin.token_address)
                        .then(result => {
                            if (result.message) {displayError(result.message); return;}
                            status = 'Approve Token Details Recieved!';
                            return result;
                        })
                        .catch ( e => displayError(e) );
    }

    function sign(txInfo, coin){
        const unsigned_transaction =  coin.network === 'ethereum'  ?  txInfo.transaction : txInfo.contract_transaction;
        try{
            let signed_transaction = signTx(unsigned_transaction, decryptStrHash(password, coin.sk), coin.network, coin.network_symbol);
            status = 'Transaction Signed!';
            return signed_transaction;
        }catch (e) {
            displayError(e);
        }
    }

    function sendTx(network_symbol, signed_transaction){
        return sendSignedTx( signed_transaction, network_symbol )
                    .then(result => {
                        if (!result || result.message) displayError('Error Publishing Transaction');
                        return result;
                    })            
                    .catch ( e => displayError(e) );
    }

    function confirmSwapTransaction(txInfo, coin){
        return waitUntilTransactionExists(coin.network_symbol, txInfo.transaction_address)
            .then(result => {
                console.log(result)
                if (result) return true;
                return false
            })
            .catch(e => displayError(e) );
    }

    function storeSwap(swap, passwd){
        swap.secret_hash = swapInfo.sendCoinsTx.secret_hash;
        swap.sendCoinsTx.secret = encryptStrHash(passwd, swap.sendCoinsTx.secret);
        SwapStore.setSwap(swap);
    }

    function updateSwapStore(swap){
        try{
            SwapStore.updateSwapStore( swap );
        } catch (e){
            displayError(e);
            return;
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

{#if error}<p class="error">{error}</p>{:else}{status}{/if}
<div>
    {#if swapInfo.hasOwnProperty('sendCoinsTx')}
        <form on:submit|preventDefault={() => handleSubmit2() } bind:this={formObj2} target="_self">
            {#if swapInfo.sending.is_token && !swapInfo.hasOwnProperty('sendCoinsTxResult')}
                <h2> Send Approve Token Transaction </h2>
            {:else}
                <h2> Send Coins to Swap Contract </h2>
            {/if}
            <div>
                <label>Wallet Password</label><br>
                <input  bind:value={password}
                        bind:this={passwordField}
                        on:change={() => validatePassword()}
                        type="password"
                        required  />
            </div>
            <input type="submit" value="Sign Transaction and Send" required />
        </form>
    {:else}
        <form on:submit|preventDefault={() => handleSubmit1() } bind:this={formObj1} target="_self">
            <h2> Create a Lamden Swap</h2>
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
            </div>
            <div>
                <label>Wallet Password</label><br>
                <input  bind:value={password}
                        bind:this={passwordField}
                        on:change={() => validatePassword()}
                        type="password"
                        required  />
            </div>
            <input type="submit" value="Create Swap" required disabled={!coinsSelected} />
        </form>
    {/if}
</div>