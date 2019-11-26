<script>
    import { onMount, createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    //Stores
    import { SettingsStore, loggedIn, steps } from '../../js/stores/stores.js';

    //Components
	import { Components }  from '../../js/router.js'
    const { Loading } = Components;

    $: message = 'Finishing Up';

    onMount(() => {
        steps.update(current => {
            current.currentStep = 4;
            return current
        });

        new Promise(function(resolve, reject) {
            setTimeout(() => {
                steps.update(current => {
                    current.currentStep = 5;
                    return current
                });
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
.page{
    display: flex;
    flex-grow: 1;
    justify-content: center;
    align-items: center;
}

</style>

<div class="page">
    <Loading {message} />
</div>

