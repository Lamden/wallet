<script>
    import { getContext} from 'svelte';

	//Stores
    import { Hash, CoinStore } from '../../js/stores.js';
    
    //Utils
	import { API } from '../../js/api.js';
    import { checkPassword, copyToClipboard, decryptStrHash } from '../../js/utils.js';
    import { validateAddress, signTx } from '../../js/crypto/wallets.js';

    //Props
    export let coin;

    //DOM NODES
    let passwordField;
    let addressField;
    let formObj;

    //Context
    const { closeModal } = getContext('closeModal');

    const tx_info_items = ['sender_address', 'recipient_address', 'gasprice', 'gas_limit', 'nonce', 'value_text', 'unsigned_raw_tx'];

    let error = '';
    let value = 0.001;
    let reciever_address = 'mqkaog8wXk9juy7XcyjGhBwHX13ECyaz38';
    let info_valid = false;
    let signed_transaction = '';
    let password = 'Summer0!0101';
    let tx_data;

    function handleSubmit(obj){
        error = '';
        if (obj.checkValidity()){
            if (!info_valid) {info_valid = true; return}
            if (info_valid) {publish(); return}
        }
    }

    function createTransaction() {
        const network_symbol = coin.is_token ? coin.network_symbol : coin.symbol;
        let path = `${network_symbol}/${coin.vk}/${reciever_address}`
        if (coin.is_token) path = `${path}/${coin.token_address}`
		const data = {value}
        return API('POST', 'p2p-transaction', path, data)
            .then(result => {
                if (result.type === 'error') { info_valid = false; error = "Amount exeeds balance" }
                else {tx_data = result; return result}
            })
    }

    function publish(){
        const network_symbol = coin.is_token ? coin.network_symbol : coin.symbol;
        try{
            signed_transaction = signTx(tx_data.unsigned_raw_tx, decryptStrHash(password, coin.sk), coin.network, network_symbol);
        }catch (e) {
            console.log(e)
            error = e;
        }
        const data = {'raw_transaction': signed_transaction}
        API('POST', 'publish-transaction', network_symbol, data)
            .then(result => finishTransaction(result) )
    }

    function finishTransaction(result){
            result.value = tx_data.value;
            result.to = tx_data.recipient_address;
            result.gasprice = tx_data.gasprice;
            result.gas_limit = tx_data.gas_limit;
            result.nonce = tx_data.nonce;
            result.dateTime = new Date();
            result.status = 'sent';
            CoinStore.updateCoinTransaction(coin, result);
            closeModal();
    }

    function addressValidation(obj){
        obj.setCustomValidity("");
        try{
            reciever_address = validateAddress(coin.network, reciever_address);
        } catch (e) {
            console.log(e);
            obj.setCustomValidity(e);
        }
        if (coin.vk === reciever_address){
            obj.setCustomValidity('cannot send to yourself');
        }
    }

    function validatePassword(obj){
        obj.setCustomValidity('');
        if (!checkPassword(password, $Hash)) {
            obj.setCustomValidity("Incorrect Password");
        }
    }
</script>

<style>
    div{
        display: grid;
    }
    
</style>

<p class="error">{error}</p>
<h2> Send {coin.name} </h2>
<div>
    <h3>Public Key</h3>
    <span><small>{`${coin.name} - ${coin.nickname}`}</small></span>
    <span><small>{`${coin.balance} (${coin.symbol})`}</small></span>
</div>
<a class="copy-link" href="javascript:void(0)" on:click={ () => copyToClipboard(coin.vk) }>{coin.vk}</a>
<small>click to copy public key to clipboard</small>
<form on:submit|preventDefault={() => handleSubmit(formObj) } bind:this={formObj} target="_self">
    {#if !info_valid}
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
    {/if}

    {#if info_valid}
        {#await createTransaction()}
            ... Getting Transaction Information from Server ...
        {:then tx_info}
            <div>
                <lable>from</lable>
                <input readonly value={tx_info['sender_address']} />
                <lable>to</lable>
                <input readonly value={tx_info['recipient_address']} />
                <lable>amount</lable>
                <input readonly value={tx_info['value_text']} />
                {#if coin.network === 'ethereum'}
                    <lable>gas price</lable>
                    <input readonly value={tx_info['gasprice']} />
                    <lable>gas limit</lable>
                    <input readonly value={tx_info['gas_limit']} />
                    <lable>nonce</lable>
                    <input readonly value={tx_info['nonce']} />
                {/if}
                <lable>raw transaction</lable>
                <textarea readonly row='5' value={tx_info['unsigned_raw_tx']} />
            </div>
            <div>
                <label>Wallet Password</label>
                <input bind:value={password}
                        bind:this={passwordField}
                        on:change={() => validatePassword(passwordField)}
                        type="password"
                        required  />
                <input type="submit" value="Publish Transaction" required>
            </div>
        {:catch error}
            {error}
        {/await}
    {/if}
</form> 

