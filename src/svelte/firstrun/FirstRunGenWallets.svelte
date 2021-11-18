<script>
    import whitelabel from '../../../whitelabel.json'

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
        chrome.runtime.sendMessage({type: 'accountsAddNewLamden', data: `My ${whitelabel.companyName} Account`}, (result) => {
            if (result.error){
                message = result.error
            }else{
                if (result.added){
                SettingsStore.setLastCoinAddedDate();
                SettingsStore.setLastCoinAddedType("normal")
                resolve()
                }
                message = result.reason
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

