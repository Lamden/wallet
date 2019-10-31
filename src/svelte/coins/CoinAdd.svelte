<script>
	//Stores
    import { CoinStore, HashStore } from '../../js/stores/stores.js';

    //Components
    import { SupportedCoinsDropDown }  from '../../js/router.js'
    
	//Utils
    import { API } from '../../js/api.js';
    import { pubFromPriv, keysFromNew, validateAddress } from '../../js/crypto/wallets.js';
    import { checkPassword, encryptStrHash, decryptStrHash, stripCoinRef } from '../../js/utils.js';

    //Props
    export let closeModal;

    //DOM NODES
    let formObj, passwordField, tokenContractField, publicKeyField, privateKeyField;
 
    let selected;
    let tokenNetworks = [{ name: 'Ethereum', network: 'ethereum', network_symbol: "ETH", is_token: true, }, { name: 'Ethereum TestNet (kovan)', network: 'ethereum', network_symbol: "ETH-TESTNET", is_token: true, }]
    let keyInputs = { privateKeyInput: '', publicKeyInput: ''};
    let keyAttributes = {publicKey: '', privateKey: '', nickname: '' };
    let password = '';
    let error = '';
    let addType = 1;
    let customToken = { view: false, contractAddress: "", details: {}};

    function handleSelection(evt, type){
        selected = stripCoinRef(evt.detail.selected);
        console.log(selected)
    }

    function getTokenDetails(node){
        node = node || null;
        let address = customToken.view ? customToken.contractAddress : selected.token_address;
        return API('GET', 'token-details', `${selected.network_symbol}/${address}`, {})
            .then(result => {
                console.log(result)
                error = "";
                if (result.message){
                    if (customToken.view) node.setCustomValidity(result.message);
                    error = 'Token Contract is invalid';
                    return;
                }
                customToken.details = result;
            })
            .catch(e => { 
                error = 'Token Contract is invalid'; 
                node.setCustomValidity('Token Contract is invalid'); 
            });
    }

    async function handleSubmit(){
        error = '';
        if (selected === 'temp'){
            customToken.view ? error = 'no network selected' : error = 'no coin selected';
        }else{
            if (formObj.checkValidity()){
                if (selected.is_token && !customToken.view) {
                    console.log('getting details')
                    await getTokenDetails()
                };
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
        if ( !HashStore.validatePassword(password) ) {
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
        if (selected.is_token){
            if( $CoinStore.filter(f => f.network === selected.network &&
                                        f.token_address === selected.token_address &&
                                        f.vk === keyAttributes.publicKey).length > 0){
                error = "Coin already exists in wallet"
                return;
            }
        } else {
            if ($CoinStore.filter(f =>  f.network === selected.network &&
                                        f.symbol === selected.symbol &&
                                        f.vk === keyAttributes.publicKey).length > 0){
                error = "Coin already exists in wallet"
                return;
            }
        } 

        CoinStore.update(coinstore => {
            selected = {...selected, ...customToken.details}
            let coinInfo = {
                'is_token': false,
                'network': selected.network,
                'network_symbol': selected.network_symbol,
                'name': selected.name,
                'nickname' : keyAttributes.nickname,
                'symbol': selected.symbol,
                'vk': keyAttributes.publicKey,
                'sk': addType === 3 ? 'watchOnly' : encryptStrHash(password, keyAttributes.privateKey),
            }
            coinInfo.is_token = selected.is_token;
            if (coinInfo.is_token){
                coinInfo.logo = selected.logo_url;
                coinInfo.is_token = true;
                coinInfo.symbol = selected.symbol;
                coinInfo.name = selected.name;
                coinInfo.decimals = selected.decimals;
                coinInfo.token_symbol = selected.symbol;
                coinInfo.token_address = selected.token_address;
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
    .networkCapitialize {
        text-transform: capitalize;   
    }

</style>

<p style="color: red;">{error}</p>
 <form on:submit|preventDefault={() => handleSubmit() } target="_self" bind:this={formObj}>
    {#if !customToken.view}
        <div>
            <h1>Add Coins</h1>
            <p>This will add a cryptocurrency coin to your wallet.</p>
            <div>
                <label>Select a Coin</label><br>
                <div>
                    <SupportedCoinsDropDown 
                        id="receiveDD" 
                        on:selected={(evt) => handleSelection(evt, 'receive')} 
                        required={true} />
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