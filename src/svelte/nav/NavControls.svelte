<script>
	//Stores
    import { currentNetwork, NetworksStore, networksDropDownList } from '../../js/stores/stores.js';
    
	//Components
    import { NavStatus, Components }  from '../Router.svelte'
    const { DropDown } = Components;

    //Images
    import NetworkIcon from '../icons/NetworkIcon.svelte'
    import network from '../../img/menu_icons/icon_network-testnet.svg'


    export let style;

    const handleClick = () => {
        if (!$currentNetwork.type === 'custom') NetworksStore.setCurrentNetwork(NetworksStore.mainnetNetwork)
        else{
            if ($currentNetwork.type === 'mainnet') NetworksStore.setCurrentNetwork(NetworksStore.testnetNetwork)
            else NetworksStore.setCurrentNetwork(NetworksStore.mainnetNetwork)
        }
    }

    const handleSelected = (e) => {
        let index = e.target.options.selectedIndex
        let network = $networksDropDownList[index]
        NetworksStore.setCurrentNetwork(network.value)
    }
</script>

<style>
.box{
    box-sizing: border-box;
    text-align: left;
    align-items: center;
    padding: 0 20px 0 20px;
    min-width: fit-content;
    cursor: pointer;
    border: 1px solid var(--color-white);
    margin: 0.8rem 61px 0.8rem 0;
    border-radius: 6px;
}
.box:hover{
    background: var(--bg-secondary);
    box-shadow: var(--box-shadow-2);
    -webkit-box-shadow: var(--box-shadow-2);
    -moz-box-shadow: var(--box-shadow-2);
}

.mainnet{
    color: var(--font-accent);
}
.custom{
    color: var(--font-warning)
}
.icon{
    margin-left: 20px;
    width: 50px;
}
.dropdown{
    background: transparent;
    padding: 4px 2px;
    border-radius: 4px;
    width: 146px;
    margin-bottom: 4px;
    border: 1px solid white;
}
.dropdown:focus-visible{
    outline: none;
}
option{
    background-color: var(--bg-secondary);
}
</style>

<div id="nav-network-info" style={style} class="box  flex-row">
    <div class="flex-column text-body2">
        <select on:change={handleSelected} class="dropdown text-secondary text-body2"             
            class:mainnet={$currentNetwork.type === 'mainnet'}
            class:text-secondary={$currentNetwork.type === 'testnet' || $currentNetwork.type === 'custom'}
            class:custom={!$currentNetwork.lamden}>
            {#each $networksDropDownList as item, index}
                <option value={item.value} class="text-body2" selected={item.selected}>{item.name}</option>
            {/each}
        </select>
        <NavStatus />
    </div>
    <div class="icon">
        {#if $currentNetwork.type === 'mainnet'}
            <NetworkIcon width= "50px"/>
        {:else}
            {@html network}
        {/if}
    </div>
</div>
