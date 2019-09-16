<script>
    import { beforeUpdate, getContext } from 'svelte';
    
    //Stores
    import { CoinStore, Hash, defaultOjects } from '../../js/stores.js';

    //Utils
    import { decryptFile, encryptStrHash, checkPassword } from '../../js/utils.js';

    const { switchPage } = getContext('switchPage');
    let file;
    let fileContent = "";
    let error = "";
    let password = "";
    let keyStorePassword = "";
    let keyStore;
    let selectAll = false;

    function openPicker(){
        error = ""
        let element = document.getElementById('filePicker');
        element.click();
    }

    function handleFileEvent(ev){
        error = ""
        fileContent = "";
        password = ""
        file = undefined;
        keyStore = undefined;

        ev.preventDefault();

        if (ev.target.files) {
            file = ev.target.files[0];
        } else if (ev.dataTransfer.items) {
            ev.dataTransfer.items[0].kind === 'file' ? file = ev.dataTransfer.items[0].getAsFile() : null;
        } else if (ev.dataTransfer.files) {
            file = ev.dataTransfer.files;
        }

        if (file) {
            validateKeyStore(file);
        } else {
            error = "Not a vaild file"
        }
    }

    function validateKeyStore(file){
        const reader = new FileReader();      
        reader.onload = function (e) {
            let output = e.target.result;
            let keystoreObj = {};
            
            try{
                keystoreObj = JSON.parse(output);
            } catch (e) {
                error = "not a valid keystore"
                return
            }
            if (!keystoreObj.ct || !keystoreObj.iv || !keystoreObj.s){
                error = "not a valid keystore"
                return
            }
            fileContent = output;
        };
        reader.readAsText(file);
    }

    function handleKeyStoreSubmit(form){
        if (form.checkValidity()){
            keyStore = decryptFile(keyStorePassword, fileContent);
        }
    }

    function validateKeyStorePassword(obj){
        try{
            decryptFile(keyStorePassword, fileContent);
            obj.setCustomValidity('');
        } catch (e) {
            obj.setCustomValidity("Incorrect Password");
        }
    }

    function handleKeysSubmit(form){
        if (form.checkValidity()){
            addKeys();
        }
    }

    function validateWalletPassword(obj){
        if (!checkPassword(password, $Hash)) {
            obj.setCustomValidity("Incorrect Password");
        } else {
            obj.setCustomValidity('');
        }
    }

    function addKeys(){
        for (const keyPair of keyStore.keyList){
            if (keyPair.checked){
                //Create network object if it doesn't already exist
                !$CoinStore[keyPair.network] ? $CoinStore[keyPair.network] = {} : null;

                // Create a new Coin if one doesn't exist for the network
                if (!$CoinStore[keyPair.network][keyPair.symbol]) {
                    let newCoin = JSON.parse(JSON.stringify($defaultOjects.coin))
                    newCoin.name = keyPair.name;
                    newCoin.symbol = keyPair.symbol;
                    $CoinStore[keyPair.network][keyPair.symbol] = newCoin;
                }

                //Add key if the pubkey doesn't already exists in the coin's pubkeys store
                if (!$CoinStore[keyPair.network][keyPair.symbol]['pubkeys'][keyPair.vk]) {
                    let newPubkey = JSON.parse(JSON.stringify($defaultOjects.pubkey))
                    newPubkey.nickname = keyPair.nickname;
                    newPubkey.vk = keyPair.vk;
                    newPubkey.sk = keyPair.sk !== 'watchOnly' ? encryptStrHash(password, keyPair.sk) : keyPair.sk;
                    $CoinStore[keyPair.network][keyPair.symbol]['pubkeys'][keyPair.vk] = newPubkey;
                }
            }
        }
        alert('restore completed')
        switchPage('CoinsMain')

    }

    function selectAllKeys(ev){
        if (ev.target.checked){
            for (const i in keyStore.keyList){
                keyStore.keyList[i].checked = true;
            }
        }
    }
</script>

<style>
    #filePicker{
        display: none;
    }

    #dropZone{
        width: 100%;
        height: 100%;
    }

    .greenText{
        color: green;
    }
</style>

<div id="dropZone" 
     on:dragover={(ev) => ev.preventDefault()} 
     on:drop={(ev) => handleFileEvent(ev)}
    >
    <h1>Restore Private Keys</h1>
    <p>To restore your wallet, please upload the file we provided you and choose a new password.</p>

    <span>
        Drag and Drop a Keystore file here or 
        <a href="javascript:void(0)" on:click={() => openPicker()}>click to chose a file</a>
    </span>
    <p class="error">{error}</p>
    <input  id="filePicker" type="file" accept=".keystore" on:change={(ev) => handleFileEvent(ev)}>

    {#if fileContent !== "" || keyStore}
        <strong class="greenText">KeyStore File Vaild</strong><br>
        <strong>last modified date:</strong> {file.lastModifiedDate}
    {/if}

    {#if fileContent !== "" && !keyStore }
        <form on:submit|preventDefault={() => handleKeyStoreSubmit(this) } target="_self">
            <div>
                <label>Keystore Password</label><br>
                <input bind:value={keyStorePassword}
                        on:change={() => validateKeyStorePassword(this)}
                        type="password"
                        required  />
            </div>
            <input type="submit" value="Restore Keys">
        </form>
    {/if}
    
    {#if keyStore}
        <strong>keystore version:</strong> {keyStore.version}<br>
        
        <form on:submit|preventDefault={() => addKeys() } target="_self">

        </form>

        <form on:submit|preventDefault={() => handleKeysSubmit(this) } target="_self">
            <span>
                <label>Choose keys to restore</label>
                <input type="checkbox" bind:checked={selectAll} on:change={(ev) => selectAllKeys(ev)}>
                Select All Keys
            </span>
            
            {#each keyStore.keyList as key, i}
                <div>
                    <input type="checkbox" bind:checked={keyStore.keyList[i].checked}>
                    {`${key.name}(${key.symbol})  ${key.vk.substring(1, 10)}... `}
                </div>
            {/each}
            {#if !checkPassword(keyStorePassword, $Hash)}
                <label>Wallet Password</label><br>
                <input bind:value={password}
                        on:change={() => validateWalletPassword(this)}
                        type="password"
                        required  />
            {/if}
            <input type="submit" value="Restore Keys">
        </form>
    {/if}
</div>






