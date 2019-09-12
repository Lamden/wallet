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
    let keys = "";

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
        let file = encryptObject(password, {'version' : $CURRENT_KS_VERSION, keyList});

        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(file));
        element.setAttribute('download', filename);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }

    function createKeyList(){
        for (const [netKey, network] of Object.entries($CoinStore) ){
            if (Object.entries(network).length > 0){
                let networkName = netKey.toUpperCase();
                let startString = `!! KEEP THIS INFORMATION SECRET !!\n`
                let addString = `\n${keys}\n**${networkName} NETWORK **\n`
                keys === "" ? keys = startString + addString  : keys = addString;

                for (const [coinKey, coin] of Object.entries(network)){
                    keys = `${keys}\n${coin.name} (${coinKey})\n`;
                    for (const [vkKey, keypair] of Object.entries(coin.pubkeys)){
                        let coinInfo = {};
                        coinInfo.network = netKey;
                        coinInfo.name = coin.name;
                        coinInfo.symbol = coinKey;
                        coinInfo.nickname = keypair.nickname;
                        coinInfo.vk = keypair.vk;
                        coinInfo.sk = decryptStrHash(password, keypair.sk);
                        keyList.push(coinInfo);
                        keys = `${keys}\n${coinInfo.nickname.toUpperCase()}\nPUBLIC KEY:\n${coinInfo.vk}\nPRIVATE KEY:\n${coinInfo.sk}\n`;
                    }
                }
            }
        }
        if(keyList.length === 0) "You don't have any keys in storage" 
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
    {/if}

    <p>We recommend you write down these private keys on paper as well as save them to a flash drive.</p>
{/if}
