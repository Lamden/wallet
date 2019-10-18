<script>
    import { createEventDispatcher } from 'svelte';

    //Stores
    import { CoinStore } from '../../js/stores.js';

    export let id;
    export let required = false;
    export let filter = [];

    const dispatch = createEventDispatcher();

    let selected;

    function dispatchSelected() {
            dispatch('selected', {
                selected,
            });
    }

    function coinList(){
        if (filter.length > 0){
            return $CoinStore.filter(f => filter.includes(f.symbol))
        }
        return $CoinStore;
    }
        
</script>


<select id={id} 
        bind:value={selected}
        on:change={dispatchSelected}
        required>

        <option value={undefined}>Choose wallet..</option>
    
    {#each coinList() as coin}
        <option value={coin} class="dropdownItem">{`${coin.name} - ${coin.nickname} (${coin.balance || 0 } ${coin.symbol})`}</option>
    {/each}
</select>

