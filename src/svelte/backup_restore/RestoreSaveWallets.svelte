<script>
    import { onMount, getContext } from 'svelte';

    //Stores
    import { CoinStore } from '../../js/stores/stores.js';

    //Components
	import { Components }  from '../Router.svelte'
    const { Loading, ErrorBox } = Components;

    //Utils
    import { encryptStrHash, decryptStrHash, hashStringValue } from '../../js/utils.js';

    //Context
    const { setKeys, changeStep, nextPage } = getContext('functions');

    //Props
    export let keys;
    export let restore = false;
    let completedKeys = 0;
    let count = 0;
    let timeoutCount = 15;

    onMount(() => {
        new Promise(function(resolve) {
            addKeys();
            let timerId = setTimeout(function checkProcessing() {
                if (completedKeys === keys.keyList.length){
                    clearTimeout(timerId);
                    resolve()
                }else{
                    count = count + 1;
                    if (count < timeoutCount) timerId = setTimeout(checkProcessing, 1000);
                    else {
                        clearTimeout(timerId);
                        resolve()
                    }
                }
            }, 1000);
        })
        .then(res => {
            setKeys(keys);
            nextPage();
        })
    });

    const addKeys = (resolve) => {
        keys.keyList.map( key => {
            if (key.checked) {
                chrome.runtime.sendMessage({type: 'encryptSk', data: key.sk}, (encryptedSk) => {
                    if (encryptedSk){
                        key.sk = encryptedSk
                        let response = CoinStore.addCoin(key)
                        if (typeof response.reason !== 'undefined'){
                            if (response.reason === "duplicate") key.error = "Coin already exists in wallet"
                            if (response.reason === "new") key.message = `Added ${key.nickname} to your wallet`
                            if (response.reason.includes('Private Key Updated')) key.message = `Updated wallet ${key.nickname} with private key info`
                        }else{
                            key.error = "Unable to add key to wallet due to unknown error"
                        }
                    }else{
                        key.error =  `Error encrypting key for ${key.name} - ${key.symbol}`
                    }
                    completedKeys = completedKeys + 1
                })
            }else{
                key.message =  "skipped"
                completedKeys = completedKeys + 1
            }
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
    <Loading message={'Saving Keys to Wallet'} />
</div>

