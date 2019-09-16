<script>
	//Stores
    import { CoinStore, Hash, defaultOjects } from '../../js/stores.js';
    
	//Utils
    import { API } from '../../js/api.js';
    import { pubFromPriv, keysFromNew, validateAddress } from '../../js/crypto/wallets.js';
    import { checkPassword, encryptStrHash, decryptStrHash } from '../../js/utils.js';

    //Props
    export let closeModal;
   
    let supportedCoins = getSupportedCoins();
    let supportedTokens = getSupportedTokens();
    let coinList = [];
    let selected;
    let tokenNetworks = [{ name: 'Ethereum', network: 'ethereum', symbol: "ETH" }, { name: 'Ethereum TestNet (kovan)', network: 'ethereum', symbol: "ETH-TESTNET" }]
    let customERC20 = {name:'ERC20 Token', symbol:'Custom', testnet:false, network: 'ethereum'};
    let lamden = {name:'Lamden', symbol:'TAU', testnet:true, network: 'lamden'};
    let keyInputs = { privateKeyInput: '', publicKeyInput: ''};
    let keyAttributes = {publicKey: '', nickname: '' };
    let password = '';
    let error = '';
    let addType = 1;
    let customToken = { view: false, name: "", contractAddress: "", details: {}};
    
    function getSupportedCoins(){
        return API('GET', 'networks-list');
    }

    function getSupportedTokens(){
        return API('GET', 'networks-list', 'ETH/tokens');
    }

    function getTokenDetails(obj){
        
        return API('GET', 'token-details', `${selected.symbol}/${customToken.contractAddress}`)
                .then(result => {
                    error = "";
                    if (result.message) {error = result.message; obj.setCustomValidity(result.message); return }
                    customToken.details = result;
                    if (customToken.name !== ""){
                        customToken.details.name = customToken.name;
                    }
                })
                .catch(e => error = e);
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
        coinList.map(function(token){
            if (token.name === 'test-ethereum') token.name ='Ethereum TestNet (kovan)';
            return token;
        });
        coinList = [...coinList, {name:'Ethereum Network ERC20', title: true}, customERC20, ...tokens]
        return coinList;
    }

    function handleSubmit(form){
        error = '';
        if (selected === 'temp'){
            customToken.view ? error = 'no network selected' : error = 'no coin selected';
        }else{
            if (form.checkValidity()){
                if (addType === 1) {
                    createAndSaveKeys();
                } else {
                    saveKeys();
                }
            }
        }
    }

    function validatePassword(obj){
        obj.setCustomValidity('');
        if (!checkPassword(password, $Hash)) {
            obj.setCustomValidity("Incorrect Password");
        }
    }

    async function validateTokenContract(obj){
        obj.setCustomValidity('');
        await getTokenDetails(obj);
    }

    function reValidateTextarea(obj){
        keyInputs.privateKeyInput = "";
        keyInputs.publicKeyInput = ""
    }

    function validateTextarea(obj){
        if (selected !== 'temp'){
            obj.setCustomValidity('');
            try{
                if (addType === 2) keyAttributes.publicKey = pubFromPriv(selected.network, selected.symbol, keyInputs.privateKeyInput);
                if (addType === 3) {
                    validateAddress(selected.network, keyInputs.publicKeyInput);
                    keyAttributes.publicKey = keyInputs.publicKeyInput;
                }
            } catch (e) {
                console.log(e)
                obj.setCustomValidity(e);
            }
        }
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
        if ($CoinStore[selected.network][selected.symbol].pubkeys[keyAttributes.publicKey]) {
            if (!customToken.view) error = `This wallet address already exists for ${name}`;
        }else{
            //if not then add it
            let newPubkey = JSON.parse(JSON.stringify($defaultOjects.pubkey))
            !customToken.view ? newPubkey.nickname = keyAttributes.nickname : newPubkey.nickname = "";
            newPubkey.vk = keyAttributes.publicKey;
            newPubkey.sk = addType === 3 ? 'watchOnly' : encryptStrHash(password, keyInputs.privateKeyInput);
            $CoinStore[selected.network][selected.symbol].pubkeys[keyAttributes.publicKey] = newPubkey;
            if (customToken.view){
                if (!$CoinStore[selected.network][selected.symbol].pubkeys[keyAttributes.publicKey].tokens){
                    $CoinStore[selected.network][selected.symbol].pubkeys[keyAttributes.publicKey].tokens = {};
                }
                $CoinStore[selected.network][selected.symbol].pubkeys[keyAttributes.publicKey].tokens[customToken.details.symbol] = customToken.details;
                $CoinStore[selected.network][selected.symbol].pubkeys[keyAttributes.publicKey].tokens[customToken.details.symbol].nickname = keyAttributes.nickname;
            }
            CoinStore.updateBalances($CoinStore);
            closeModal();
        }
    }

    function createAndSaveKeys(){
        let keyPair = {};
        try {
            keyPair = keysFromNew(selected.network, selected.symbol);
            keyAttributes.publicKey = keyPair.vk;
            keyInputs.privateKeyInput = keyPair.sk;
            saveKeys();
        } catch (e){
            console.log(e)
            error = e;
        }
    }

    function toggleTokenScreen(){
        selected = "temp";
        customToken.view = !customToken.view;
    }
</script>

<style>
    .dropdownTitle{
        font-weight: bold;
        font-size: 15px;
        color: purple;
    }

    .networkCapitialize {
        text-transform: capitalize;   
    }

</style>

<p style="color: red;">{error}</p>
 <form on:submit|preventDefault={() => handleSubmit(this) } target="_self">
    {#if !customToken.view}
        <div>
            <h1>Add Coins</h1>
            <p>This will add a cryptocurrency coin to your wallet.</p>
            <div>
                <label>Select a Coin</label><br>
                <div>
                    {#await Promise.all([supportedCoins, supportedTokens])}
                        <select id='ddCoins' bind:value={selected}>
                            <option value={'temp'}>...fetching supported coins...</option>
                        </select>
                        
                    {:then data}
                        <select id='ddCoins' bind:value={selected} required>
                            <option value='temp'>choose...</option>
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
                    {:catch error}
                        <p style="color: red">API server unavailable</p>
                    {/await}
                </div>
            </div>
            <a href="javascript:void(0)" on:click={ () => toggleTokenScreen() }>custom token</a>
        </div>
    {/if}
    {#if customToken.view}
        <div>
            <h1>Custom Token</h1>
            <p>This will add a custom token to your wallet.</p>
            <div>
                <select id='ddTokenNetworks' bind:value={selected} required>
                    <option value='temp'>choose...</option>
                    {#each tokenNetworks as tokenNetwork}
                        <option value={tokenNetwork} class="networkCapitialize">
                            { tokenNetwork.name }
                        </option>
                    {/each}
                </select>
            </div>
            {#if selected !== "temp"}
                <div>
                    <label> Token Contract</label><br>
                    <input  bind:value={ customToken.contractAddress }
                            required
                            on:change={() => validateTokenContract(this)}
                            />
                </div>
                <div>
                    <label>Token Name (optional)</label><br>
                    <input bind:value={ customToken.name } />
                </div>
            {/if}
        </div>
    {/if}
    <div>
        <p>Action</p>
        <span>
            <label>
                <input type=radio bind:group={addType} value={1}>
                Create Key
            </label>

            <label>
                <input type=radio bind:group={addType} value={2}>
                Add Existing
            </label>

            <label>
                <input type=radio bind:group={addType} value={3}>
                Track Coin
            </label>
        </span>
    </div>

    {#if addType === 2}
        <div>
            <textarea bind:value={keyInputs.privateKeyInput} 
                    id="privateKeyInput"
                    placeholder={"Enter Private Key"}
                    on:change={ () => validateTextarea(this) }
                    on:show={ reValidateTextarea(this) }
                    rows="2"
                    required  />
        </div>
    {/if}

    {#if addType === 3}
        <div>
            <textarea bind:value={keyInputs.publicKeyInput}
                    id="publicKeyInput"
                    placeholder={"Enter Public Key"}
                    on:change={ () => validateTextarea(this) }
                    on:show={ reValidateTextarea(this) }
                    rows="2"
                    required  />
        </div>
    {/if}

    <div>
        <label>Key Nickname</label><br>
        <input bind:value={keyAttributes.nickname} required  />
    </div>

    {#if addType !== 3}
        <div>
            <label>Wallet Password</label><br>
            <input bind:value={password}
                    on:change={() => validatePassword(this)}
                    type="password"
                    required  />
        </div>
    {/if}

    <input type="submit" value="Save Keys">
</form>
<button on:click='{ () => toggleTokenScreen() }'>Back</button>