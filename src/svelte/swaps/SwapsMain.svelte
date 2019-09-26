<script>
    import { getContext} from 'svelte';

	//Stores
    import { CoinStore, initialSwaps, participateSwaps } from '../../js/stores.js';
    console.log($initialSwaps)

    //Context
    const { switchPage } = getContext('switchPage');


    function initialSwap(){
        switchPage('SwapsInitial');
    }

    function participateSwap(){
        switchPage('SwapsParticipate');
    }

    function decodeLink(link){
        let parms = link.split("/")[link.split("/").length - 1]
        return JSON.parse(atob(parms))
    }

    function showDecode(link){
        console.log(decodeLink(link))
    }

    function deleteSwapInfo(swapInfo, keyName){
        CoinStore.deleteSwap(swapInfo[keyName].sending.coin, swapInfo[keyName].swapContract.secret_hash, keyName)
    }

    
</script>

<h1>Swaps Page</h1>

<button on:click={() => initialSwap() }> Initiate a Swap </button>
<button on:click={() => participateSwap() }> Participate in a Swap </button>

<h2>Swaps Created by You</h2>
{#if $initialSwaps.length > 0 }
    {#each $initialSwaps as swap}
        <div>
            <p style="display: none"> {showDecode(swap.initial.participateLink)}</p>
            {`From: ${swap.initial.sending.value} ${swap.initial.sending.coin.symbol}`}<br>
            {`To: ${swap.initial.receiving.value} ${swap.initial.receiving.coin.symbol}`}<br>
            {`expires: ${new Date(swap.initial.swapContract.locktime)}`}
            <button on:click={() => deleteSwapInfo(swap, 'initial')}> delete </button>
        </div> 
    {/each}
{:else}
    You have not created any Swaps
{/if}

<h2>Swaps you are Participating in</h2>
{#if $participateSwaps.length > 0 }
    {#each $participateSwaps as swap}
        <div>
            {`From: ${swap.participate.participateInfo.participateValue} ${swap.participate.participateInfo.participateCurrency}`}<br>
            {`To: ${swap.participate.participateInfo.initialValue} ${swap.participate.participateInfo.initialCurrency}`}<br>
            {`expires: ${new Date(swap.participate.swapContract.locktime)}`}
        </div>
    {/each}
{:else}
    You have not participated in any Swaps
{/if}