<script>
    import { onMount } from 'svelte';

    //Stores
    import { SettingsStore, loggedIn, steps } from '../../js/stores/stores.js';

    //Components
	import { Components }  from '../Router.svelte'
    const { Loading } = Components;

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
            }, 2000);
        })
        .then(res => {
            setTimeout(() => {
                accept()
            }, 500);            
        })
    });

    function accept(){
        SettingsStore.update(current => {
            current.currentPage = {name: 'CoinsMain', data: {}};
            current.firstRun = false;
            return current
        })
        loggedIn.set(true);
    }
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

