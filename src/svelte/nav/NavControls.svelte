<script>
    import { getContext, onMount, afterUpdate } from 'svelte';

	//Stores
    import { currentNetwork, NetworksStore } from '../../js/stores/stores.js';
    
	//Components
    import { NavStatus }  from '../Router.svelte'

    //Images
    import NetworkIcon from '../icons/NetworkIcon.svelte'
    import network from '../../img/menu_icons/icon_network-testnet.svg'

    //Context
    const { switchPage, themeToggle } = getContext('app_functions');

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

    const handleClick = () => {
        if (!$currentNetwork.type === 'custom') NetworksStore.setCurrentNetwork(NetworksStore.mainnetNetwork)
        else{
            if ($currentNetwork.type === 'mainnet') NetworksStore.setCurrentNetwork(NetworksStore.testnetNetwork)
            else NetworksStore.setCurrentNetwork(NetworksStore.mainnetNetwork)
        }
    }
</script>

<style>
.box{
    box-sizing: border-box;
    text-align: right;
    align-items: center;
    padding: 0 20px 0 20px;
    min-width: fit-content;
    cursor: pointer;
    border: 1px solid var(--divider-dark);
    margin: 0.8rem 61px 0.8rem 0;
    border-radius: 4px;
}
.box:hover{
    background: var(--bg-secondary);
    box-shadow: 0px 1px 2px #0823303d, 0px 2px 6px #08233029;
}
p{
    margin: 0;
}
p.mainnet:hover{
    text-decoration: underline;
    color: var(--font-accent);
}
.mainnet{
    color: var(--font-accent);
}
.custom{
    color: var(--font-warning)
}
.icon{
    width: 50px;
    margin-left: 20px;
}
</style>

<div id="nav-network-info" class="box  flex-row" on:click={handleClick}>
    <div class="flex-column text-body2">
        <p>Current Network</p>
        <p  class="network-name text-secondary"
            class:mainnet={$currentNetwork.type === 'mainnet'}
            class:text-secondary={$currentNetwork.type === 'testnet' || $currentNetwork.type === 'custom'}
            class:custom={$currentNetwork.type === 'custom'}>
        {$currentNetwork.name}
        </p>
        <NavStatus {status} />
    </div>
    <div class="icon">
        {#if $currentNetwork.type === 'mainnet'}
            <NetworkIcon />
        {:else}
            {@html network}
        {/if}
    </div>
    

</div>
<button on:click={themeToggle}>light/dark</button>