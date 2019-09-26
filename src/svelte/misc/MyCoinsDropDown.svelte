<script>
    import { createEventDispatcher } from 'svelte';

    //Stores
    import { CoinStore } from '../../js/stores.js';

    export let id;
    export let required = false;
    export let filter = undefined;

    const dispatch = createEventDispatcher();

    let selected;

    function dispatchSelected() {
            dispatch('selected', {
                selected,
            });
    }

    function coinList(){
        if (filter){
            return $CoinStore.filter(f => f.symbol === filter)
        }
        return $CoinStore;
    }
        
</script>


<select id={id} 
        bind:value={selected}
        on:change={dispatchSelected}
        required>
    {#if filter}
        <option value={undefined}>{`Select ${filter}`} wallet..</option>
    {:else}
        <option value={undefined}>Choose wallet..</option>
    {/if}
    
    {#each coinList() as coin}
        <option value={coin} class="dropdownItem">{`${coin.name} - ${coin.nickname} (${coin.balance} ${coin.symbol})`}</option>
    {/each}
</select>

