<script>
    import { onMount, getContext } from 'svelte';

    //Stores
    import { SettingsStore, steps, CoinStore } from '../../js/stores/stores.js';

    //Components
	import { Components }  from '../Router.svelte'
    const { Loading } = Components;

    //Context
    const { done } = getContext('functions');

    //Props
    const { joinCoinService } = getContext('app_functions');
    export let restore = false;

    $: message = 'Finishing Up';

    onMount(() => {
        if (!restore) {
            steps.set({current:0, stepList:[]});
        }else{
            steps.update(current => {
                current.currentStep = 5;
                return current
            });
        }

        new Promise(function(resolve, reject) {
            setTimeout(() => {
                message = 'Done!'
                resolve();
            }, 1000);
        })
        .then(() => {
            chrome.runtime.sendMessage({type: 'refreshTokenBalances'})

            let accounts = $CoinStore ? $CoinStore : []
            accounts.forEach((i) => {
                joinCoinService(i.vk) 
            })

            setTimeout(() => {
                done()
            }, 1000);            
        })
    });
</script>

<style>
.firstrun-finishing{
    display: flex;
    flex-grow: 1;
    justify-content: center;
}

</style>

<div class="firstrun-finishing">
    <Loading {message} />
</div>

