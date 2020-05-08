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
                        keys.error = "Unknown Error: Timed out waiting for keys to be added."
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
        console.log(keys.keyList)
        let checkedKeys = keys.keyList.filter(key => key.checked)
        chrome.runtime.sendMessage({type: 'walletAddMany', data: checkedKeys}, (result) => {
            console.log(result)
            if (!result.error)keys.keyList = result
            else keys.error = result.error
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
    <Loading message={'Saving Keys to Wallet'} />
</div>

