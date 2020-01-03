<script>
    import { onMount, getContext } from 'svelte';

    //Stores
    import { CoinStore, password } from '../../js/stores/stores.js';

    //Components
	import { Components }  from '../../js/router.js'
    const { Loading, ErrorBox } = Components;

    //Utils
    import { encryptStrHash } from '../../js/utils.js';

    //Context
    const { setKeys, changeStep, nextPage } = getContext('functions');

    //Props
    export let keys;
    export let restore = false;

    onMount(() => {
        new Promise(function(resolve) {
            setTimeout(() => {
                addKeys(resolve);
            }, 2000);
        })
        .then(res => {
            setKeys(keys);
            nextPage();
        })
    });

    function addKeys(resolve){
        CoinStore.update(coinstore => {
            keys.keyList.map( key => {
                if (!CoinStore.getCoin(key)){
                    if (key.checked) {
                        key.sk = encryptStrHash($password, key.sk)
                        coinstore.push(key);
                        key.added = true;
                    }
                }else{
                    key.error = "Key Already exists"
                }
            }) 
            return coinstore;
        });
        resolve();
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

