<script>
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    //Stores
    import { loggedIn, HashStore, SettingsStore, currentPage } from '../../js/stores/stores.js';

    //Components
	import { Components }  from '../../js/router.js'
    const { Button } = Components;

    //Props
    export let switchPage;

    function dispatchState(step) {
        dispatch('toggleStep', step);
    }

    function accept(){
        SettingsStore.update(current => {
            current.currentPage = {name: 'CoinsMain', data: {}};
            current.firstRun = false;
            return current
        })
        loggedIn.set(true);
    }

    function startOver(){
        HashStore.set({ 'encode' : undefined });
        dispatchState(0);
    }

</script>

<style>
.page{
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    width: 280px;
    padding: 16px 24px 0 24px;
}

.heading{
    margin-bottom: 16px;
}

.text-box{
   height: 144px;
   margin-bottom: 20px;
}
</style>

<div class="page">
    <h6 class="heading">Remember</h6>
    <div class="text-box text-body1">
        Your password, private keys, and locking your wallet are important to keeping your cryptocurrency safe.
    </div>

    <Button style={'button__solid'}
        height={'36px'}
        styles={'margin-bottom: 16px;'}
        name="I understand" 
        click={() => accept()} />
    <Button style={'button__solid button__purple'}
        height={'36px'}
        styles={'margin-bottom: 16px;'}
        name="go back" 
        click={() => startOver()} />
</div>

