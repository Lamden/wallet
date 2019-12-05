<script>
    import { onMount, getContext } from 'svelte';
    
    //Stores
    import { CoinStore, password, steps } from '../../js/stores/stores.js';

    //Components
	import { Components }  from '../../js/router.js'
    const { Loading } = Components;

	//Utils
    import { keysFromNew } from '../../js/crypto/wallets.js';
    import { encryptStrHash, encryptObject } from '../../js/utils.js';
    
    //Context
    const { changeStep } = getContext('functions');
    
    //Props
    export let switchPage;

    onMount(() => {
        steps.update(current => {
            current.currentStep = 3;
            return current
        });

        new Promise(function(resolve, reject) {
            setTimeout(() => {
                createStartingWallets();
                resolve();
            }, 3000);
        })
        .then(res => {
            changeStep(5)
        })
    });

    function dispatchState(step) {
        dispatch('toggleStep', step);
    }

    function createStartingWallets(){
        let keyPair = keysFromNew('lamden', 'TAU');
        CoinStore.update(current => {
            let coinInfo = {
                'network': 'lamden',
                'name': 'Lamden',
                'nickname' : 'My TAU Address',
                'symbol': 'TAU',
                'vk': keyPair.vk,
                'sk': encryptStrHash($password, keyPair.sk),
            }
            current.push(coinInfo);
            return current;
        })
    }

</script>

<style>
.firstrun-genwallets{
    display: flex;
    flex-grow: 1;
    justify-content: center;
    padding-top: 359px;
}

</style>

<div class="firstrun-genwallets">
    <Loading message={'Creating Keys'} />
</div>

