<script>
    import { onMount, getContext } from 'svelte';
    
    //Stores
    import { CoinStore, steps, currentNetwork, NetworksStore, SettingsStore } from '../../js/stores/stores.js';

    //Components
	import { Components }  from '../Router.svelte'
    const { Loading } = Components;

	//Utils
    import { keysFromNew } from '../../js/crypto/wallets.js';
    
    //Context
    const { changeStep } = getContext('functions');
    
    let message = 'Creating Keys';

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
                //Add coin to coinstore
                CoinStore.addCoin(newCoin)
                SettingsStore.setLastCoinAddedDate();
                
                // Mint coins on mockchain for new wallet
                let mockchain = NetworksStore.getPublicMockchain()
                mockchain.API.mintTestNetCoins(newCoin.vk, 100000)
            }else{
                message = 'Critical Failure: Could not encrypt key for intial wallet'
            }
        })
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

