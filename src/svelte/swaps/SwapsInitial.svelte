<script>
	//Stores
    import { CoinStore, Hash, getCoinReference } from '../../js/stores.js';
    
    //Components
    import { CoinDropDown }  from '../../js/router.js'

    // Utils
    import { API } from '../../js/api.js';
    import { checkPassword, encryptStrHash } from '../../js/utils.js';

    //DOM Nodes
    let formObj, sendingValueField, receivingValueField, sendingWalletField1, sendingWalletField2, receivingWalletField ,passwordField;

    console.log("MOCKED DATA FOR TESTING")

    let error = '';
    let password = '';
    let ApiResponse;

    let coinBTC = {"name": "test-bitcoin", "network": "bitcoin" , "symbol" : "BTC-TESTNET", "testnet" : true};
    let coinETH = {"name": "Ethereum TestNet (kovan)", "network": "ethereum" , "symbol" : "ETH-TESTNET", "testnet" : true};
    let sending = {coin: coinBTC, value:0.0001, myVk: "mkgHEXp1ru4rU1oTXgdgsgMCizqSVwJgZw", theirVk: "mqkaog8wXk9juy7XcyjGhBwHX13ECyaz38"};
    let receiving = {coin: coinETH, value:0.002, myVk: "0x5b85bF11009e02267dD78B4502ffF3c2FE88EB31", };
    let coinRef;

    function handleSubmit(obj){
         error = '';
        if (obj.checkValidity()){
            sendIntial();
        }
    }

    function handleSelection(evt, type){
        if (type === 'send') sending.coin = evt.detail.selected;
        if (type === 'receive') receiving.coin = evt.detail.selected;
    }

    function sendIntial(){
        let data = {'value': sending.value}
        let path = `${sending.coin.symbol}/${sending.myVk}/${sending.theirVk}`
        ApiResponse =  API('POST', 'atomic-swap', path, data)
            .then(result => {console.log(result); return result})
            .then(result => { storeInitalSwap(result); return result })
    }

    function storeInitalSwap(result){
        let coin = {'network':sending.coin.network, 'symbol': sending.coin.symbol , 'vk': sending.myVk, 'is_token': false}
        result.state = 'initial';
        result.secret = encryptStrHash(password, result.secret)
        result.sending = sending;
        result.receiving = receiving;
        result.created = new Date();
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
<h1> Here Now</h1>

<form on:submit|preventDefault={() => handleSubmit(formObj) } bind:this={formObj} target="_self">
        <div>
            <lable>I have</lable>
            <CoinDropDown id="sendingDD" 
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
                        bind:value={sending.myVk}
                        bind:this={sendingWalletField1}
                        required />
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
            <CoinDropDown id="receiveDD" 
                          on:selected={(evt) => handleSelection(evt, 'receive')} 
                          required={true} />

            <lable>Amount</lable>
            <input type="number" step="any" 
                bind:value={receiving.value}
                bind:this={receivingValueField}
                required />

            {#if sending.coin.symbol !== undefined}
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
        <input type="submit" value="Create Swap" required>
</form>

{#if ApiResponse }
    {#await ApiResponse}
        ... Creating Swap ...
    {:then data}
        'got it'
    {:catch e}
        {e}
    {/await}
{/if}