<script>
    import { getContext, onMount, afterUpdate } from 'svelte';

	//Stores
    import { currentNetwork } from '../../js/stores/stores.js';
    
	//Components
    import { NavStatus }  from '../Router.svelte'

    //Context
    const { switchPage } = getContext('app_functions');

    let status = 'checking'

    onMount(() => {
        ping()
    })

    afterUpdate(() => {
        ping()
    })

    const ping = async () => {
        status = await $currentNetwork.ping() ? 'online' : 'offline'
    }

</script>

<style>
.box{
    justify-content: center;
    align-items: flex-end;
    padding: 0 61px 0 30px;
}
</style>

<div class="box text-body2 flex-column">
    <div>{`Current Network`}</div>
    <div class="text-primary-dark clickable" on:click={() => switchPage('DevToolsMain')}>{$currentNetwork.name}</div>
    <NavStatus {status} />
</div>