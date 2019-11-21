<script>
    import { getContext} from 'svelte';

	//Stores
    import { HashStore, CoinStore } from '../../js/stores/stores.js';
    
    //Utils
    import { checkPassword, copyToClipboard, decryptStrHash } from '../../js/utils.js';
    import { validateAddress, signTx } from '../../js/crypto/wallets.js';

    //Props
    export let coin;

    $: symbol = coin.symbol;
    $: balance = coin.balance ? coin.balance : 0;

    //DOM NODES
    let formObj1, formObj2, passwordField, addressField;

    //Context
    const { closeModal } = getContext('closeModal');

    let error, status = "";
    let value = 0;
    let reciever_address = '';
    let info_valid = false;
    let password = '';
    let txData = {};

    function displayError(e){
        console.log(e); 
        error = e;
    }

    function handleSubmit1(){
        error = '';
        if (formObj1.checkValidity()){
            createTransaction();
        }
    }

    async function handleSubmit2(){
        error = '';
        if (formObj2.checkValidity()){
            if ( await createSignedTx() ){
                await sendTx();
                
                //Check to make sure the transaction was published (does not mean confirmed)
                if ( await checkPublish() ) {
                    status = 'Redeem Transaction Sent!';
                    txData.txResult.sent = new Date();
                    finishTransaction();
                }
            }
        }
    }

    function createTransaction() {
        status = "Getting Transaction Details";
    }

    function createSignedTx(){
        status = "Signing Transaction";
        try{
            txData.txInfo.signed_transaction = signTx(txData.txInfo.unsigned_raw_tx, decryptStrHash(password, coin.sk), coin.network, coin.symbol);
            status = "Transaction Signed!";
            return true;
        }catch (e) {
            displayError(e);
            return false;
        }
    }

    function sendTx(){
        status = "Publishing Transaction"
    }

    function checkPublish() {
        let transaction = txData.txResult.transaction;
        status = `Checking for Transaction on the Blockchain`;
    }

    function finishTransaction(){
            CoinStore.updateCoinTransaction(coin, txData);
            closeModal();
    }

    function addressValidation(obj){
        obj.setCustomValidity("");
        try{
            reciever_address = validateAddress(coin.network, reciever_address);
        } catch (e) {
            displayError(e);
            obj.setCustomValidity(e);
        }
        if (coin.vk === reciever_address){
            obj.setCustomValidity('cannot send to yourself');
        }
    }

    function validatePassword(obj){
        obj.setCustomValidity('');
        if (!checkPassword(password, $HashStore.encode)) {
            obj.setCustomValidity("Incorrect Password");
        }
    }
</script>

<style>
    div{
        display: grid;
    }
    
</style>

{#if error}{error}{:else}{status}{/if}

<h2> Send {coin.name} </h2>
{#if !info_valid}
    <form on:submit|preventDefault={() => handleSubmit1() } bind:this={formObj1} target="_self">
        <h3>Public Key</h3>
        <div>
            <span><small>{`${coin.name} - ${coin.nickname}`}</small></span>
            <span><small>{`${balance} (${symbol})`}</small></span>
        </div>
        <a class="copy-link" href="javascript:void(0)" on:click={ () => copyToClipboard(coin.vk) }>{coin.vk}</a>
        <small>click to copy public key to clipboard</small>

        <div>
            <lable>Amount</lable>
            <input type="text" bind:value={value} required/>
            <!-- <small>USD Value 0.0001</small> -->
        </div>
        <div>
            <lable>To Address</lable>
            <input type="text" 
                bind:value={reciever_address}
                bind:this={addressField}
                required 
                on:change={() => addressValidation(addressField)}/>
        </div>
        <div>
            <input type="submit" value="Get Transaction Information" required>
        </div>
    </form>
{/if}

{#if info_valid}
    <form on:submit|preventDefault={() => handleSubmit2() } bind:this={formObj2} target="_self">
        <div>
            <label>Wallet Password</label>
            <input bind:value={password}
                    bind:this={passwordField}
                    on:change={() => validatePassword(passwordField)}
                    type="password"
                    required  />
            <input type="submit" value="Publish Transaction" required>
        </div>
    </form>
{/if}


