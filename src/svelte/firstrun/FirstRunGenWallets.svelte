<script>
    import { onMount, createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    //Stores
    import { CoinStore, password, steps } from '../../js/stores/stores.js';

    //Components
	import { Components }  from '../../js/router.js'
    const { Loading } = Components;

	//Utils
    import { keysFromNew } from '../../js/crypto/wallets.js';
    import { encryptStrHash } from '../../js/utils.js';

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
            dispatchState(5)
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
.page{
    display: flex;
    flex-grow: 1;
    justify-content: center;
    align-items: center;
}

</style>

<div class="page">
    <Loading message={'Creating Keys'} />
</div>

