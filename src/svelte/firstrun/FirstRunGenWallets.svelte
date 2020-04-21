<script>
    import { onMount, getContext } from 'svelte';
    
    //Stores
    import { CoinStore, steps, NetworksStore, SettingsStore } from '../../js/stores/stores.js';

    //Components
	import { Components }  from '../Router.svelte'
    const { Loading } = Components;
    
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
                createStartingWallet(resolve);
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

    const dispatchState = (step) => {
        dispatch('toggleStep', step);
    }

    const createStartingWallet = (resolve) => {
        chrome.runtime.sendMessage({type: 'coinStoreAddNewLamden', data: 'My Lamden Address'}, (newCoinVK) => {
            if (newCoinVK){
                console.log(newCoinVK)
                SettingsStore.setLastCoinAddedDate();
                // Mint coins on mockchain for new wallet
                let mockchain = NetworksStore.getPublicMockchain()
                mockchain.API.mintTestNetCoins(newCoinVK, 100000)
            }else{
                message = 'Critical Failure: Could not encrypt key for intial wallet'
            }
            resolve()
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

