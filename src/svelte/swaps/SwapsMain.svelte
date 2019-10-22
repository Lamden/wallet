<script>
    import { getContext, setContext} from 'svelte';

	//Stores
    import { SwapStore, initialSwaps, participateSwaps } from '../../js/stores.js';

    //Utils
    import { copyToClipboard } from '../../js/utils.js';

    //Context
    const { switchPage } = getContext('switchPage');
    
    let testLink = ""

    function showdetails(){
        console.log( decodeLink(testLink) )
    }

    function initialSwap(swap){
        switchPage('SwapsInitial', swap);
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
        console.log(swapInfo)
        SwapStore.deleteSwap(swapInfo.secret_hash)
    }

    function swapExpired(swap){
        return new Date(swap.sendCoinsTx.locktime) < new Date();
    }

    function participateString(swap) {
        const linkContent = {
            contract: swap.sending.network === 'ethereum' ? swap.sendCoinsTx.contract_address : swap.sendCoinsTx.contract,
            transactionAddress: swap.sendCoinsTxResult.transaction_address,
            initialCurrency: swap.sending.symbol,
            participateAliceAddress: swap.receiving.vk,
            participateCurrency: swap.receiving.symbol,
            participateValue: swap.receiving.value,
        };
        if (swap.sending.is_token){
            linkContent.initialCurrency = swap.sending.network_symbol;
        };
        if (swap.receiving.is_token){
            linkContent.participateTokenAddress = swap.receiving.token_address;
            linkContent.participateCurrency = swap.receiving.network_symbol;
        };
        console.log(linkContent);
        return JSON.stringify(linkContent);
    }
</script>

<style>
.swap-box{
    border: 1px solid grey;
    margin: 1rem;
    padding: 1rem;
}

</style>
<h2 on:click={ () => switchPage('CoinsMain')} style="cursor: pointer;"> {"<- Back"} </h2>
<h1>Swaps Page</h1>

<button on:click={() => initialSwap() }> Initiate a Swap </button>
<button on:click={() => participateSwap() }> Participate in a Swap </button>

<h2>Swaps Created by You</h2>
{#if $initialSwaps.length > 0 }
    {#each $initialSwaps as swap}
        <div class="swap-box">
            <h3>{`Swap Status: ${swap.swapState.text}`}</h3>
            <div>
                {`From: ${swap.sending.value} ${swap.sending.symbol}`}<br>
                {`To: ${swap.receiving.value} ${swap.receiving.symbol}`}<br>
            </div>
            <div>
                {#if swap.swapState.num < 3}
                    {#if swapExpired(swap) }
                        {`Expired On: ${new Date(swap.sendCoinsTx.locktime)}`}
                        {#if swap.swapState.num === 2 }
                            <button on:click={() => refundTx(swap)}> Refund </button>
                        {/if}
                        {#if swap.swapState.num === 3}
                            {`Refunded On: ${new Date(swap.refundTx.sent)}`}
                        {/if}
                    {:else}
                        {`Expires: ${new Date(swap.sendCoinsTx.locktime)}`}
                    {/if}
                {/if}
            </div>
            <div>
                {#if swap.swapState.num === 1 && swap.sending.is_token}
                        <button on:click={ () => switchPage('SwapsInitial', swap) }> Send 'Approve Token' Transaction  </button>
                {/if}
                {#if (swap.swapState.num === 1 && !swap.sending.is_token) || (swap.swapState.num === 3) }
                        <button on:click={ () => switchPage('SwapsInitial', swap) }> Send Coins to Contract  </button>
                {/if}
                {#if swap.swapState.num === 5}
                    <a class="tx-link" href={swap.sendCoinsTxResult.transaction_link} rel="noopener noreferrer" target="_blank">
                            {`Sent ${swap.sendCoinsTx.value} (${swap.sending.symbol}) to contract`}
                    </a>
                    <button on:click={() => copyToClipboard( participateString(swap) )}> copy participate info </button>
                    <button on:click={ () => switchPage('SwapsInitialRedeem', swap) }> Redeem  </button>
                {/if}
                {#if swap.swapState.num === 7}
                    <a class="tx-link" href={swap.redeemTx.transaction_link} rel="noopener noreferrer" target="_blank">
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
                <h3>{`Swap Status: ${swap.swapState.text}`}</h3>
                {`From: ${swap.participateInfo.participateValue} ${swap.sending.symbol}`}<br>
                {`To: ${swap.initialContractInfo.value} ${swap.participateInfo.initialCurrency}`}<br>
            </div>
            <div>
                {#if swap.swapState.num < 3}
                    {#if swapExpired(swap) }
                        {`Expired On: ${new Date(swap.sendCoinsTx.locktime)}`}
                        {#if swap.swapState.num === 2 }
                            <button on:click={() => refundTx(swap)}> Refund </button>
                        {/if}
                        {#if swap.swapState.num === 3}
                            {`Refunded On: ${new Date(swap.refundTxResult.sent)}`}
                        {/if}
                    {:else}
                        {`Expires: ${new Date(swap.sendCoinsTx.locktime)}`}
                    {/if}
                {/if}
            </div>
            <div>
                {#if swap.swapState.num === 2}
                    <a class="tx-link" href={swap.txResult.transaction_link} rel="noopener noreferrer" target="_blank">
                            {`Sent ${swap.sendCoinsTx.value} (${swap.sending.symbol}) to contract`}
                    </a>
                    <button on:click={() => copyToClipboard(swap.initialRedeemInfo)}> copy redeem info </button>
                    <button on:click={ () => switchPage('SwapsParticipateRedeem', swap) }> Redeem  </button>
                {/if}
                {#if swap.swapState.num === 4}
                    <a class="tx-link" href={swap.redeemTxResult.transaction_link} rel="noopener noreferrer" target="_blank">
                            {`Received ${swap.redeemsendCoinsTx.value} (${swap.receiving.symbol}) from contract`}
                    </a>
                {/if}
                <br><button on:click={() => deleteSwapInfo(swap)}> delete </button>
            </div>
        </div>
    {/each}
{:else}
    You have not participated in any Swaps
{/if}