<script>
    import { getContext, setContext} from 'svelte';

	//Stores
    import { CoinStore, initialSwaps, participateSwaps } from '../../js/stores.js';

    //Utils
    import { copyToClipboard } from '../../js/utils.js';

    //Context
    const { switchPage } = getContext('switchPage');
    
    let testLink = ""

    function showdetails(){
        console.log( decodeLink(testLink) )
    }

    function initialSwap(){
        switchPage('SwapsInitial');
    }

    function participateSwap(swap){
        swap = swap || undefined;
        switchPage('SwapsParticipate', swap);
    }

    function refundTx(swap){
        if (swap) switchPage('SwapsRefund', swap);
    }

    function decodeLink(link){
        let parms = link.split("/")[link.split("/").length - 1]
        return JSON.parse(atob(parms))
    }

    function showDecode(link){
        console.log(decodeLink(link))
    }

    function deleteSwapInfo(swapInfo){
        CoinStore.deleteSwap(swapInfo.sending, swapInfo.txInfo.secret_hash)
    }

    function determineSwapState(swap){
        if (swap.hasOwnProperty('redeemTxResult')) return {text:'Completed', num:4};
        if (swap.hasOwnProperty('refundTxResult')) return {text:'Refunded', num:3};
        if (swap.hasOwnProperty('txResult')) return {text:'Sent to Contract', num:2};
        if (swap.hasOwnProperty('txInfo')) return {text:'Started', num:0};
        return {text:'Not started', num:0};
    }

    function swapExpired(swap){
        return new Date(swap.txInfo.locktime) < new Date();
    }

</script>

<style>
.swap-box{
    border: 1px solid grey;
    margin: 1rem;
    padding: 1rem;
}

</style>

<h1>Swaps Page</h1>

<button on:click={() => initialSwap() }> Initiate a Swap </button>
<button on:click={() => participateSwap() }> Participate in a Swap </button>

<h2>Swaps Created by You</h2>
{#if $initialSwaps.length > 0 }
    {#each $initialSwaps as swap}
        <div class="swap-box">
            <h3>{`Swap Status: ${determineSwapState(swap).text}`}</h3>
            <div>
                {`From: ${swap.sending.value} ${swap.sending.symbol}`}<br>
                {`To: ${swap.receiving.value} ${swap.receiving.symbol}`}<br>
            </div>
            <div>
                {#if determineSwapState(swap).num < 3}
                    {#if swapExpired(swap) }
                        {`Expired On: ${new Date(swap.txInfo.locktime)}`}
                        {#if determineSwapState(swap).num === 2 }
                            <button on:click={() => refundTx(swap)}> Refund </button>
                        {/if}
                        {#if determineSwapState(swap).num === 3}
                            {`Refunded On: ${new Date(swap.refundTxResult.sent)}`}
                        {/if}
                    {:else}
                        {`Expires: ${new Date(swap.txInfo.locktime)}`}
                    {/if}
                {/if}
            </div>
            <div>
                {#if determineSwapState(swap).num === 2}
                    <a class="tx-link" href={swap.txResult.transaction_link} rel="noopener noreferrer" target="_blank">
                            {`Sent ${swap.txInfo.value} (${swap.sending.symbol}) to contract`}
                    </a>
                    <button on:click={() => copyToClipboard(swap.participateInfo)}> copy participate info </button>
                    <button on:click={ () => switchPage('SwapsInitialRedeem', swap) }> Redeem  </button>
                {/if}
                {#if determineSwapState(swap).num === 4}
                    <a class="tx-link" href={swap.redeemTxResult.transaction_link} rel="noopener noreferrer" target="_blank">
                            {`Received ${swap.redeemTxInfo.value} (${swap.receiving.symbol}) from contract`}
                    </a>
                {/if}
                <br><button on:click={() => deleteSwapInfo(swap)}> delete </button>
            </div>
        </div>
    {/each}
{:else}
    You have not created any Swaps
{/if}

<h2>Swaps you are Participating in</h2>
{#if $participateSwaps.length > 0 }
    {#each $participateSwaps as swap}
        <div class="swap-box">
            <div>
                <h3>{`Swap Status: ${determineSwapState(swap).text}`}</h3>
                {`From: ${swap.participateInfo.participateValue} ${swap.sending.symbol}`}<br>
                {`To: ${swap.initialContractInfo.value} ${swap.participateInfo.initialCurrency}`}<br>
            </div>
            <div>
                {#if determineSwapState(swap).num < 3}
                    {#if swapExpired(swap) }
                        {`Expired On: ${new Date(swap.txInfo.locktime)}`}
                        {#if determineSwapState(swap).num === 2 }
                            <button on:click={() => refundTx(swap)}> Refund </button>
                        {/if}
                        {#if determineSwapState(swap).num === 3}
                            {`Refunded On: ${new Date(swap.refundTxResult.sent)}`}
                        {/if}
                    {:else}
                        {`Expires: ${new Date(swap.txInfo.locktime)}`}
                    {/if}
                {/if}
            </div>
            <div>
                {#if determineSwapState(swap).num === 2}
                    <a class="tx-link" href={swap.txResult.transaction_link} rel="noopener noreferrer" target="_blank">
                            {`Sent ${swap.txInfo.value} (${swap.sending.symbol}) to contract`}
                    </a>
                    <button on:click={() => copyToClipboard(swap.initialRedeemInfo)}> copy redeem info </button>
                    <button on:click={ () => switchPage('SwapsParticipateRedeem', swap) }> Redeem  </button>
                {/if}
                {#if determineSwapState(swap).num === 4}
                    <a class="tx-link" href={swap.redeemTxResult.transaction_link} rel="noopener noreferrer" target="_blank">
                            {`Received ${swap.redeemTxInfo.value} (${swap.receiving.symbol}) from contract`}
                    </a>
                {/if}
                <br><button on:click={() => deleteSwapInfo(swap)}> delete </button>
            </div>
        </div>
    {/each}
{:else}
    You have not participated in any Swaps
{/if}