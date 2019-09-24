<script>
	//Stores
    import { CoinStore, Hash, getCoinReference } from '../../js/stores.js';

    // Utils
    import { API } from '../../js/api.js';
    import { checkPassword, encryptStrHash } from '../../js/utils.js';

    //DOM Nodes
    let formObj ,passwordField;

    let error = '';
    let password = '';
    let ApiResponse;



    function handleSubmit(obj){
         error = '';
        if (obj.checkValidity()){
            
        }
    }

    function getContractDetails(){
        let data = {'value': 0, 'secret_hash': ''}
        let path = `${'network_symbol'}/${'sender_address' }/${'recipient_address'}`
        ApiResponse =  API('POST', 'participate', path, data)
            .then(result => {console.log(result); return result})
            .then(result => { storeParticipateSwap(result); return result })
    }

    function storeParticipateSwap(result){
        let coin = {'network':sending.coin.network, 'symbol': sending.coin.symbol , 'vk': sending.myVk, 'is_token': false}
        result.state = 'participate';
        CoinStore.storeInitalSwap(coin, result);
    }

    function validatePassword(){
        passwordField.setCustomValidity('');
        if (!checkPassword(password, $Hash)) {
            passwordField.setCustomValidity("Incorrect Password");
        }
    }

</script>
{error}
<h1> Participate in a Swap</h1>

<form on:submit|preventDefault={() => handleSubmit(formObj) } bind:this={formObj} target="_self">

        <input type="submit" value="Create Swap" required>
</form>

{#if ApiResponse }
    {#await ApiResponse}
        ... Paticipating in Swap ...
    {:then data}
        'done'
    {:catch e}
        {e}
    {/await}
{/if}