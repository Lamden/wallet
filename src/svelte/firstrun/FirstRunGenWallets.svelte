<script>
    import { onMount, getContext } from 'svelte';
    
    //Stores
    import { CoinStore, steps, currentNetwork } from '../../js/stores/stores.js';

    //Components
	import { Components }  from '../Router.svelte'
    const { Loading } = Components;

	//Utils
    import { keysFromNew } from '../../js/crypto/wallets.js';
    
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
        chrome.runtime.sendMessage({type: 'encryptSk', data: keyPair.sk}, (encryptedSk) => {
            if (encryptedSk){
                let newCoin = {
                    'network': 'lamden',
                    'name': 'Lamden',
                    'nickname' : 'My TAU Address',
                    'symbol': 'TAU',
                    'vk': keyPair.vk,
                    'sk': encryptedSk
                }
                CoinStore.addCoin(newCoin)
                $currentNetwork.API.mintTestCoins(newCoin)
            }else{
                throw new Error('Critical Failure: Could not encrypt key for intial wallet')
            }
        })
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

