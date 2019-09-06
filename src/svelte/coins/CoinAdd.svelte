<script>
	import { createEventDispatcher } from 'svelte';

	//Stores
    import { CoinStore, Hash, defaultOjects } from '../../js/stores.js';
    
	//Utils
    import { API } from '../../js/api.js';
    import { pub_from_priv } from '../../js/crypto/wallets.js';
    import { checkPassword, encryptStrHash, decryptStrHash } from '../../js/utils.js';

    //Props
    export let closeModal;

    const dispatch = createEventDispatcher();    
    let supportedCoins = getSupportedCoins();
    let coinList = [];
    let selected;
    let customERC20 = {name:'ERC20 Token', symbol:'Custom', testnet:false, network: 'ethereum'}
    let lamden = {name:'Lamden', symbol:'TAU', testnet:true, network: 'lamden'}
    let showKeyBox;
    let privateKey = '';
    let password = '';
    let publicKey = '';
    let nickname = '';
    let balance;
    let error = '';
    
    function getSupportedCoins(){
        return API('GET', 'networks-list')
    }

    function getBalance(){
        API('GET', 'get-balance', `${selected.symbol}/${publicKey}`)
            .then(data => balance = `${data.value} ${selected.symbol}`)
            .catch(e => console.log(e))
    }

    function createCoinList(data){
        coinList = []
        for (const networks in data){
            coinList = [...coinList,...data[networks]]
        }
        return [...coinList, customERC20, lamden];
    }

    function handleSubmit(form){
        if (!selected){
            error = 'no coin selected';
            return
        }
        if (form.checkValidity()){
            saveCoin();
        }
    }

    function validatePassword(obj){
        if (!checkPassword(password, $Hash)) {
            obj.setCustomValidity("Incorrect Password");
        } else {
            obj.setCustomValidity('');
        }
    }

    function validateTextarea(obj){
        try{
            publicKey = pub_from_priv(selected.network, selected.symbol, privateKey);
        } catch (e) {
            obj.setCustomValidity(e);
            return
        }
        obj.setCustomValidity('');
    }

    function saveCoin(){
        // Instantiate a new Coin if one doesn't exist for the network
        if (!$CoinStore[selected.network][selected.symbol]) {
            let newCoin = JSON.parse(JSON.stringify($defaultOjects.coin))
            newCoin.name = selected.name;
            newCoin.symbol = selected.symbol;
            $CoinStore[selected.network][selected.symbol] = newCoin;
        }

        //Check if the pubkey already exists in the coin
        if ($CoinStore[selected.network][selected.symbol]['pubkeys'][publicKey]) {
            error = `This wallet address already exists for ${name}`
        }else{
            //if not then add it
            let newPubkey = JSON.parse(JSON.stringify($defaultOjects.pubkey))
            newPubkey.nickname = nickname;
            newPubkey.vk = publicKey;
            newPubkey.sk = encryptStrHash(password, privateKey);
            $CoinStore[selected.network][selected.symbol]['pubkeys'][publicKey] = newPubkey;
            closeModal();
        }
    }
</script>

<style>
  input:required:invalid, input:focus:invalid {
    background-image: url(/img/validators/error.svg);
    fill: red;
    background-position: right top;
    background-repeat: no-repeat;
  }
  input:required:valid {
    background-image: url(/img/validators/check.svg);
    fill: green;
    background-position: right top;
    background-repeat: no-repeat;
  }
</style>

<p style="color: red;">{error}</p>
<h1>Add Coins</h1>
<p>This will add a cryptocurrency coin to your wallet.</p>
<div>
    Select a Coin
    {#await supportedCoins}
        <select id='ddCoins' bind:value={selected}>
            <option value={'temp'}>...fetching supported coins...</option>
        </select>
        
    {:then data}
        <div>
            <form on:submit|preventDefault={() => handleSubmit(this) } target="_self">
                <div>
                    <select id='ddCoins' bind:value={selected} required>
                        <option /> 
                        {#each createCoinList(data) as coin}
                            <option value={coin}>{ '(' + coin.symbol + ') ' + coin.name }</option>
                        {/each}
                    </select>
                    <input type="checkbox" bind:checked={showKeyBox} /> I have a private key
                </div>
                {#if showKeyBox}
                    <textarea bind:value={privateKey}
                            placeholder={"Enter Private Key"}
                            on:change={() => validateTextarea(this)}
                            wrap="hard"
                            rows="3"
                            required  />
                {/if}
                <div>
                    <label>Key Nickname</label><br>
                    <input bind:value={nickname} required  />
                </div>
                <div>
                    <label>Wallet Password</label><br>
                    <input bind:value={password}
                            on:change={() => validatePassword(this)}
                            type="password"
                            required  />
                </div>
                <input type="submit" value="Save Keys">
            </form>
        </div>
    {:catch error}
	    <p style="color: red">API server unavailable</p>
    {/await}

</div>