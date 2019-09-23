<script>
    import { getContext} from 'svelte';

	//Stores
    import { allSwaps } from '../../js/stores.js';

    //Context
    const { switchPage } = getContext('switchPage');


    function newSwap(){
        switchPage('SwapsInitial');
    }

</script>

<h1>Swaps Page</h1>

<button on:click={() => newSwap() }> Start A New Swap </button>

{#each $allSwaps as swap}
<div>
    <h2>{`Swap Stage: ${swap.state}`}</h2>
    {`From: ${swap.sending.value} ${swap.sending.coin.symbol}`}<br>
    {`To: ${swap.receiving.value} ${swap.receiving.coin.symbol}`}<br>
    {`expires: ${new Date(swap.locktime)}`}
</div>
    
{/each}