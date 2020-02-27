<script>
    import { onMount, getContext } from 'svelte';

    //Stores
    import { SettingsStore, steps } from '../../js/stores/stores.js';

    //Components
	import { Components }  from '../Router.svelte'
    const { Loading } = Components;

    //Context
    const { done } = getContext('functions');

    //Props
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
            console.log(steps)
        }

        new Promise(function(resolve, reject) {
            setTimeout(() => {
                if (!restore) {
                    steps.update(current => {
                        current.currentStep = 5;
                        return current
                    });
                }
                message = 'Done!'
                resolve();
            }, 1000);
        })
        .then(res => {
            setTimeout(() => {
                SettingsStore.changePage({name: 'LockScreen'})
                done()
            }, 500);            
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

