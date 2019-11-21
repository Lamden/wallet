<script>
    import { createEventDispatcher } from 'svelte';

    //Stores
    import { CoinStore } from '../../js/stores/stores.js';

    export let id;
    export let required = false;
    export let filter = [];
    export let set;

    const dispatch = createEventDispatcher();

    let selected;

    function dispatchSelected() {
            dispatch('selected', {
                selected,
            });
    }

    function dispatchSet(coin) {
            dispatch('selected', {
                coin,
            });
    }

    function coinList(){
        if (set !== undefined) {
            return [ $CoinStore.find(f => {
                return (f.network === set.network && f.symbol === set.symbol && f.vk === set.vk)
            }) ];
        }
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

    {#if !set}
        <option value={undefined}>Choose wallet..</option>
    {/if}
        
    {#each coinList() as coin}
        <option value={coin} class="dropdownItem">{`${coin.name} - ${coin.nickname} (${coin.balance || 0 } ${coin.symbol})`}</option>
    {/each}
</select>

