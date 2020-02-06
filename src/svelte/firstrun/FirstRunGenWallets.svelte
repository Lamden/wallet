<script>
    import { onMount, getContext } from 'svelte';
    
    //Stores
    import { CoinStore, password, steps, allNetworks, currentNetwork } from '../../js/stores/stores.js';

    //Components
	import { Components }  from '../Router.svelte'
    const { Loading } = Components;

	//Utils
    import { keysFromNew } from '../../js/crypto/wallets.js';
    import { encryptStrHash, encryptObject } from '../../js/utils.js';
    import { mintTestNetCoins } from '../../js/lamden/masternode-api.js';
    
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
            }, 1500);
        })
        .then(res => {
            steps.update(current => {
                current.currentStep = 4;
                return current
            });
        })
        .then(res => {
            setTimeout(() => {
                changeStep(5)
            }, 1500);
        })
    });

    function dispatchState(step) {
        dispatch('toggleStep', step);
    }

    function createStartingWallets(){
        let keyPair = keysFromNew('lamden', 'TAU');
        let newCoin = {
            'network': 'lamden',
            'name': 'Lamden',
            'nickname' : 'My TAU Address',
            'symbol': 'TAU',
            'vk': keyPair.vk,
            'sk': encryptStrHash($password, keyPair.sk)
        }
        CoinStore.addCoin(newCoin)
        mintTestCoins(newCoin)
    }

    async function mintTestCoins(coin){
        let mintOkay = await mintTestNetCoins($currentNetwork, coin.vk, 1000000);
        if (mintOkay) CoinStore.updateBalance(coin, 1000000)
    }



</script>

<style>
.firstrun-genwallets{
    display: flex;
    flex-grow: 1;
    justify-content: center;
}

</style>

<div class="firstrun-genwallets">
    <Loading message={'Creating Keys'} />
</div>

