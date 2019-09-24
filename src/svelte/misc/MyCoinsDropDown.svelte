<script>
    import { createEventDispatcher } from 'svelte';

    //Stores
    import { CoinStore } from '../../js/stores.js';

    export let id;
    export let required = false;

    const dispatch = createEventDispatcher();

    let selected;

    function dispatchSelected() {
            dispatch('selected', {
                selected,
            });
        }
        
</script>


<select id={id} 
        bind:value={selected}
        on:change={dispatchSelected}
        required>
    <option value='temp'>Choose coin in your wallet..</option>
    {#each $CoinStore as coin}
        <option value={coin} class="dropdownItem">{`(${coin.symbol}) ${coin.name} - ${coin.nickname}`}</option>
    {/each}
</select>

