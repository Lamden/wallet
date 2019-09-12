<script>
	//Stores
    import { CoinStore, Hash, defaultOjects } from '../../js/stores.js';
    
	//Utils
    import { API } from '../../js/api.js';
    import { pubFromPriv, keysFromNew } from '../../js/crypto/wallets.js';
    import { checkPassword, encryptStrHash, decryptStrHash } from '../../js/utils.js';

    //Props
    export let closeModal;
   
    let supportedCoins = getSupportedCoins();
    let supportedTokens = getSupportedTokens();
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

    function getSupportedTokens(){
        return API('GET', 'networks-list', 'ETH/tokens')
    }

    function createCoinList(data){
        let coins = data[0];
        let tokens = data[1].tokens;
        coinList = [{name:'Lamden Network', title: true}, lamden];
        coinList = [...coinList, {name:'Bitcoin Network', title: true}, ...coins['bitcoin_networks']];
        coinList = [...coinList, {name:'Ethereum Network', title: true}, ...coins['ethereum_networks']];
        tokens.map(function(token){
            token.network = 'ethereum';
            return token;
        });
        coinList = [...coinList, {name:'Ethereum Network ERC20', title: true}, customERC20, ...tokens]
        return coinList;
    }

    function handleSubmit(form){
        error = '';
        if (!selected.symbol){
            error = 'no coin selected';
            return
        }
        if (form.checkValidity()){
            showKeyBox ? saveKeys() : createAndSaveKeys();
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
            publicKey = pubFromPriv(selected.network, selected.symbol, privateKey);
        } catch (e) {
            obj.setCustomValidity(e);
            return
        }
        obj.setCustomValidity('');
    }

    function saveKeys(){
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
            CoinStore.updateBalances($CoinStore);
            closeModal();
        }
    }

    function createAndSaveKeys(){
        let keyPair = {};
        try {
            keyPair = keysFromNew(selected.network, selected.symbol);
            publicKey = keyPair.vk;
            privateKey = keyPair.sk;
            saveKeys();
        } catch (e){
            console.log(e)
            error = e;
        }
    }
</script>

<style>
    .dropdownTitle{
        font-weight: bold;
        font-size: 15px;
        color: purple;
    }

</style>

<p style="color: red;">{error}</p>
<h1>Add Coins</h1>
<p>This will add a cryptocurrency coin to your wallet.</p>
<div>
    Select a Coin
    {#await Promise.all([supportedCoins, supportedTokens])}
        <select id='ddCoins' bind:value={selected}>
            <option value={'temp'}>...fetching supported coins...</option>
        </select>
        
    {:then data}
        <div>
        
            <form on:submit|preventDefault={() => handleSubmit(this) } target="_self">
                <div>
                    <select id='ddCoins' bind:value={selected} required>
                        {#each createCoinList(data) as coin}
                            {#if !coin.title}
                                <option value={coin} class="dropdownItem">{`(${coin.symbol}) ${coin.name}`}</option>
                            {:else}
                                {#if coin.name !== "Lamden Network"}
                                     <option />
                                {/if}
                                <option disabled value={coin} class="dropdownTitle"><b>{coin.name}</b></option>
                            {/if}
                            
                        {/each}
                    </select>
                </div>
                <div>
                    <input type="checkbox" bind:checked={showKeyBox} /> I have a private key
                    {#if showKeyBox}
                        <textarea bind:value={privateKey}
                                placeholder={"Enter Private Key"}
                                on:change={() => validateTextarea(this)}
                                wrap="hard"
                                rows="3"
                                required  />
                    {/if}
                </div>
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