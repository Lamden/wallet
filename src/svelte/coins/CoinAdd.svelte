<script>
	//Stores
    import { CoinStore, Hash } from '../../js/stores.js';
    
	//Utils
    import { API } from '../../js/api.js';
    import { pubFromPriv, keysFromNew, validateAddress } from '../../js/crypto/wallets.js';
    import { checkPassword, encryptStrHash, decryptStrHash } from '../../js/utils.js';

    //Props
    export let closeModal;

    //DOM NODES
    let passwordField;
    let tokenContractField;
    let publicKeyField;
    let privateKeyField;
    let form; 
   
    let supportedCoins = getSupportedCoins();
    let supportedTokens = getSupportedTokens();
    let coinList = [];
    let selected;
    let tokenNetworks = [{ name: 'Ethereum', network: 'ethereum', network_symbol: "ETH", token: true, }, { name: 'Ethereum TestNet (kovan)', network: 'ethereum', network_symbol: "ETH-TESTNET", token: true, }]
    let lamden = {name:'Lamden', symbol:'TAU', testnet: true, network: 'lamden'};
    let keyInputs = { privateKeyInput: '', publicKeyInput: ''};
    let keyAttributes = {publicKey: '', privateKey: '', nickname: '' };
    let password = '';
    let error = '';
    let addType = 1;
    let customToken = { view: false, contractAddress: "", details: {}};

    
    function getSupportedCoins(){
        return API('GET', 'networks-list');
    }

    function getSupportedTokens(){
        return API('GET', 'networks-list', 'ETH/tokens');
    }

    function getTokenDetails(node){
        node = node || null;
        let address = customToken.view ? customToken.contractAddress : selected.address;
        return API('GET', 'token-details', `${selected.network_symbol}/${address}`)
            .then(result => {
                error = "";
                if (result.message){
                    if (customToken.view) node.setCustomValidity(result.message);
                    error = result.message;
                    return;
                }
                customToken.details = result;
            })
            .catch(e => error = e);
    }

    function createCoinList(data){
        let coins = data[0];
        let tokens = data[1].tokens;
        tokens.map(function(token){
            token.token = true;
            token.network = 'ethereum';
            token.network_symbol = 'ETH'
            return token;
        });
        coinList = [...coins['bitcoin_networks'], ...coins['ethereum_networks'], ...tokens];
        coinList.map(function(token){
            if (token.name === 'test-ethereum') token.name ='Ethereum TestNet (kovan)';
            return token;
        });
        coinList = coinList.sort((a, b) => (a.symbol > b.symbol) ? 1 : -1)
        return coinList;
    }

    async function handleSubmit(){
        error = '';
        if (selected === 'temp'){
            customToken.view ? error = 'no network selected' : error = 'no coin selected';
        }else{
            if (form.checkValidity()){
                if (selected.token && !customToken.view) {await getTokenDetails()};
                if (addType === 1) {
                    createAndSaveKeys();
                } else {
                    saveKeys();
                }
                if (error.length === 0){
                    CoinStore.updateBalances($CoinStore);
                    closeModal();
                }
            }
        }
    }

    function validatePassword(){
        passwordField.setCustomValidity('');
        if (!checkPassword(password, $Hash)) {
            passwordField.setCustomValidity("Incorrect Password");
        }
    }

    async function validateTokenContract(){
        tokenContractField.setCustomValidity('');
        await getTokenDetails(tokenContractField);
    }

    function reValidateTextarea(){
        keyInputs.privateKeyInput = "";
        keyInputs.publicKeyInput = ""
    }

    function validateTextarea(node){
        if (selected !== 'temp'){
            node.setCustomValidity('');
            try{
                if (addType === 2) {
                    keyAttributes.publicKey = pubFromPriv(selected.network, selected.symbol, keyInputs.privateKeyInput);
                    keyAttributes.privateKey = keyInputs.privateKeyInput;
                }
                if (addType === 3) {
                    keyAttributes.publicKey = validateAddress(selected.network, keyInputs.publicKeyInput);
                }
            } catch (e) {
                console.log(e)
                node.setCustomValidity(e);
            }
        }
    }

    function saveKeys(){
        if (selected.token &&
            $CoinStore.filter(f =>  f.network === selected.network &&
                                    f.token_address === customToken.details.token_address &&
                                    f.vk === keyAttributes.publicKey).length > 0)
                                {
                                    error = "Coin already exists in wallet"
                                    return;
                                } 

        if ($CoinStore.filter(f =>  f.network === selected.network &&
                                    f.symbol === selected.symbol &&
                                    f.vk === keyAttributes.publicKey).length > 0)
                                {
                                    error = "Coin already exists in wallet"
                                    return;
                                }

        CoinStore.update(coinstore => {
            let coinInfo = {
                'network': selected.network,
                'name': selected.name,
                'nickname' : keyAttributes.nickname,
                'symbol': selected.symbol,
                'vk': keyAttributes.publicKey,
                'sk': addType === 3 ? 'watchOnly' : encryptStrHash(password, keyAttributes.privateKey),
            }
            if (selected.token){
                coinInfo.is_token = true;
                coinInfo.symbol = customToken.details.symbol;
                coinInfo.network_symbol = selected.network_symbol;
                coinInfo.name = customToken.details.name;
                coinInfo.decimals = customToken.details.decimals;
                coinInfo.token_address = customToken.details.token_address;
            }
            if (coinInfo.vk === "") {
                error = "vk blank"
            }else{
                coinstore.push(coinInfo);
            }
            
            return coinstore;
        });
    }

    function createAndSaveKeys(){
        let keyPair = {};
        try {
            keyPair = keysFromNew(selected.network, selected.symbol);
            keyAttributes.publicKey = keyPair.vk;
            keyAttributes.privateKey = keyPair.sk;
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
 <form on:submit|preventDefault={() => handleSubmit(this) } target="_self" bind:this={form}>
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
                            bind:this={tokenContractField}
                            required
                            on:change={() => validateTokenContract()}
                            />
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
                    bind:this={privateKeyField}
                    on:change={ () => validateTextarea(privateKeyField) }
                    on:show={ reValidateTextarea() }
                    rows="2"
                    required  />
        </div>
    {/if}

    {#if addType === 3}
        <div>
            <textarea bind:value={keyInputs.publicKeyInput}
                    id="publicKeyInput"
                    placeholder={"Enter Public Key"}
                    bind:this={publicKeyField}
                    on:change={ () => validateTextarea(publicKeyField) }
                    on:show={ reValidateTextarea() }
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
            <input  bind:value={password}
                    bind:this={passwordField}
                    on:change={() => validatePassword()}
                    type="password"
                    required  />
        </div>
    {/if}

    <input type="submit" value="Save Keys">
</form>
<button on:click='{ () => toggleTokenScreen() }'>Back</button>