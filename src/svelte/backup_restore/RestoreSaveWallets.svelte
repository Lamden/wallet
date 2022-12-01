<script>
    import { onMount, getContext } from 'svelte';

    //Stores
    import { CoinStore, SettingsStore } from '../../js/stores/stores.js';

    //Components
	import { Components }  from '../Router.svelte'
    const { Loading, ErrorBox } = Components;

    //Utils
    import { encryptStrHash, decryptStrHash, hashStringValue } from '../../js/utils.js';

    //Context
    const { setKeys, changeStep, nextPage } = getContext('functions');

    //Props
    export let keys;
    let done = false;
    let errorMsg = ""
    let completedKeys = 0;
    let count = 0;
    let timeoutCount = 15;

    onMount(() => {
        new Promise(function(resolve) {
            addKeys();
            let timerId = setTimeout(function checkProcessing() {
                if (done){
                    clearTimeout(timerId);
                    resolve()
                }else{
                    count = count + 1;
                    if (count < timeoutCount) timerId = setTimeout(checkProcessing, 1000);
                    else {
                        clearTimeout(timerId);
                        keys.error = "Unknown Error: Timed out waiting for accounts to be added."
                        resolve()
                    }
                }
            }, 1000);
        })
        .then(res => {
            setKeys(keys)
            nextPage();  
        })
    });

    const addKeys = (resolve) => {
        let checkedKeys = keys.keyList.filter(key => key.checked)
        chrome.runtime.sendMessage({type: 'accountsAddMany', data: checkedKeys}, (result) => {
            if (!result.error) {
                keys.keyList = result
                // SettingsStore.setLastCoinAddedDate();
                // SettingsStore.setLastCoinAddedType("normal")
                chrome.runtime.sendMessage({type: 'updateAccountAndTokenBalances'})
            } else keys.error = result.error
            done = true;
        })

    }
</script>

<style>
.restore-savewallets{
    display: flex;
    flex-grow: 1;
    justify-content: center;    
}

</style>

<div class="restore-savewallets">
    <Loading message={'Saving Accounts to Lamden Vault'} />
</div>

