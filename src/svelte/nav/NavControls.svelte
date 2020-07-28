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
        let status = 'checking'
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
    min-width: fit-content;
    cursor: pointer;
}
</style>

<div id="nav-network-info" class="box text-body2 flex-column" on:click={() => switchPage('DevToolsMain')}>
    <div>{`Current Network`}</div>
    <div class="text-primary-dark">{$currentNetwork.name}</div>
    <NavStatus {status} />
</div>