<script>
    import { getContext} from 'svelte';

	//Stores
    import { initialSwaps, participateSwaps } from '../../js/stores.js';
    console.log($initialSwaps)

    //Context
    const { switchPage } = getContext('switchPage');


    function initialSwap(){
        switchPage('SwapsInitial');
    }

    function participateSwap(){
        switchPage('SwapsParticipate');
    }

</script>

<h1>Swaps Page</h1>

<button on:click={() => initialSwap() }> Initiate a Swap </button>
<button on:click={() => participateSwap() }> Participate in a Swap </button>
{$initialSwaps.length}
<h2>Swaps Created by You</h2>
{#if $initialSwaps.length > 0 }
    {console.log($initialSwaps)}
    {#each $initialSwaps as swap}
    {console.log(swap)}
    <div>
        <h2>{`Swap Stage: ${swap.state}`}</h2>
        {`From: ${swap.initial.sending.value} ${swap.initial.sending.coin.symbol}`}<br>
        {`To: ${swap.initial.receiving.value} ${swap.initial.receiving.coin.symbol}`}<br>
        {`expires: ${new Date(swap.initial.swapContract.locktime)}`}
    </div>
        
    {/each}
{:else}
    You have not created any Swaps
{/if}

<h2>Swaps you are Participating in</h2>
{#if $initialSwaps.length > 0 }
    {#each $participateSwaps as swap}
    <div>
        <h2>{`Swap Stage: ${swap.state}`}</h2>
        {`From: ${swap.sending.value} ${swap.sending.coin.symbol}`}<br>
        {`To: ${swap.receiving.value} ${swap.receiving.coin.symbol}`}<br>
        {`expires: ${new Date(swap.locktime)}`}
    </div>
        
    {/each}
{:else}
    You have not participated in any Swaps
{/if}