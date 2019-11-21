<script>
    import { onMount, setContext } from 'svelte';
    
	//Stores
    import { CoinStore, HashStore, coinMeta } from '../../js/stores/stores.js';
    
	//Utils
    import { pubFromPriv, keysFromNew, validateAddress } from '../../js/crypto/wallets.js';
    import { checkPassword, encryptStrHash, decryptStrHash, stripCoinRef } from '../../js/utils.js';

    //Props
    export let closeModal;

    //DOM NODES
    let formObj, passwordField, publicKeyField, privateKeyField;
    
    let selected;

    let keyInputs = { privateKeyInput: '', publicKeyInput: ''};
    let keyAttributes = {publicKey: '', privateKey: '', nickname: '' };
    let password = '';
    let error = '';
    let addType = 1;


    onMount(() => {
        selected = coinMeta.LamdenTau;
        console.log(selected)
	});

    async function handleSubmit(){
        error = '';
        if (formObj.checkValidity()){
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

    function validatePassword(){
        passwordField.setCustomValidity('');
        if ( !HashStore.validatePassword(password) ) {
            passwordField.setCustomValidity("Incorrect Password");
        }
    }

    function reValidateTextarea(){
        keyInputs.privateKeyInput = "";
        keyInputs.publicKeyInput = ""
    }

    function validateTextarea(node){
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

    function saveKeys(){
        if ($CoinStore.filter(f =>  f.network === selected.network &&
                                    f.symbol === selected.symbol &&
                                    f.vk === keyAttributes.publicKey).length > 0){
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

</script>

<p style="color: red;">{error}</p>
 <form on:submit|preventDefault={() => handleSubmit() } target="_self" bind:this={formObj}>
    <div>
        <h1>Add Wallet</h1>
        <p>This will add a Lamden wallet.</p>
    </div>

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
                Track Wallet
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