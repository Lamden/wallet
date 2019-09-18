<script>
    //Stores
    import { CoinStore, coinList, Hash, CURRENT_KS_VERSION } from '../../js/stores.js';

    //Utils
    import { copyToClipboard, checkPassword, decryptStrHash, encryptObject, decryptFile } from '../../js/utils.js';

    //Components
    import { BackupPW, BackupDownload }  from '../../js/router.js'

    let password;
    let passwordOkay;
    let keyList = [];
    let passwordHint = ""

    let keys = ""

    function handleSubmit(form){
        if (form.checkValidity()){
            passwordOkay = true;
            createKeyList();
        } else {
            alert('no')
        }
    }

    function validatePassword(obj){
        if (!checkPassword(password, $Hash)) {
            obj.setCustomValidity("Incorrect Wallet Password");
        } else {
            obj.setCustomValidity('');
        }
    }

    function download() {
        let currDateTime = new Date().toLocaleString();
        let filename = "Lamden_Vault_" + currDateTime + ".keystore";
        let file = JSON.stringify({
            data: encryptObject(password, {'version' : $CURRENT_KS_VERSION, keyList}),
            w: passwordHint,
        });

        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(file));
        element.setAttribute('download', filename);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }

    function createKeyList(){
        keyList = JSON.parse(JSON.stringify($CoinStore));
        keys = `!! KEEP THIS INFORMATION SECRET !!\n`
        keyList.map(function(keypair){
            keys = `${keys}\n${keypair.name}(${keypair.symbol}) - ${keypair.nickname}`;
            keys = `${keys}\nPUBLIC KEY:\n${keypair.vk}\nPRIVATE KEY:\n${decryptStrHash(password, keypair.sk)}\n`;
            return keypair;
        });
        if(keyList.length === 0) keys = "Key Storage Empty";
    }
</script>

<h1>Backup Wallet</h1>

{#if !passwordOkay}
<form on:submit|preventDefault={() => handleSubmit(this) } target="_self">
    <div>
        <label>Password</label><br>
        <input bind:value={password}
                on:change={() => validatePassword(this)}
                type="password"
                required  />
    </div>
    <input type="submit" value="Reveal Private Keys">
</form>
{/if}
{#if passwordOkay}
    <p>Backup your wallet incase anything would ever happen. Please remember not to share this information.</p>

    <lable>Your Private Keys</lable><br>
    <textarea bind:value={keys} readonly rows="20" wrap="hard"/>

    {#if keys !== 'You have no keys'}
        <span>
            <a href="javascript:void(0)" on:click={() => copyToClipboard(keys)}>copy to clipboard</a>
            <button on:click={() => download()}>Download Encrypted Backup</button>
        </span>
        <div>
            <label>Password Hint</label><br>
            <input type="text" bind:value={passwordHint} />
        </div>
    {/if}

    <p>We recommend you write down these private keys on paper as well as save them to a flash drive.</p>
{/if}
