<script>
    export let swap
    export let currencySymbol
    export let blockexplorer

</script>

<style>
    .swap-side{
        width: 100%;
        border-bottom: 1px solid var(--divider-dark);
        padding-bottom: 1rem;
        margin-bottom: 1rem;
    }
    .swap-side > p {
        margin: 0;
        line-height: 15px;
        width: 62vw;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .swap-details{
        justify-content: space-between;
    }
    .swap-details > p {
        min-width: fit-content;
    }
    .amount {
        margin-left: 10px;
        margin-right: 10px;
    }
    strong{
        margin-right: 5px;
    }
    span.weight-300 {
        margin: 0 10px 0 0;
        line-height: 1.5;
    }
    

</style>

<div class="flex-row swap-details text-body2">
    <p class="text-primary-dim">{new Date(swap.created).toLocaleString()}</p>
    <p class="amount"><strong class="text-primary-dim">Amount</strong>{`${swap.amount} ${currencySymbol}`}</p>
    <p 
        class:text-green={swap.status === 'success'} 
        class:text-red={swap.status === 'error'} 
        class:text-warning={swap.status !== 'error' && swap.status !== 'success'}>
        {swap.status.toUpperCase()}
    </p>
</div>
<div class="flex-column swap-side">
    {#if swap.eth_approval_txHash}
        <p>
            <span class="weight-300">ETH Approval Tx</span>
            <a class="text-link" href={blockexplorer.ethereum + '/tx/' + swap.eth_approval_txHash} rel="noopener noreferrer" target="_blank">
                {swap.eth_approval_txHash}
            </a>
        </p>
    {/if}
    <p>
        <span class="weight-300">ETH Swap Contract Tx</span>
        <a class="text-link" href={blockexplorer.ethereum + '/tx/' + swap.eth_swap_txHash} rel="noopener noreferrer" target="_blank">
            {swap.eth_swap_txHash}
        </a>
    </p>
        <p>
        <span class="weight-300">ETH Address</span>
        <a class="text-link" href={blockexplorer.ethereum + '/address/' + swap.swapInfo.address} rel="noopener noreferrer" target="_blank">
            {swap.swapInfo.address}
        </a>
    </p>
    
    <p><span class="weight-300">Lamden Address</span>
            <a class="text-link" href={blockexplorer.lamden + '/addresses/' + swap.lamdenAddress} rel="noopener noreferrer" target="_blank">
            {swap.lamdenAddress}
        </a>
    </p>
    {#if swap.lamden_swap_txHash}
        <p>
            <span class="weight-300">Lamden {currencySymbol} Send Tx</span>
            <a class="text-link" href={blockexplorer.lamden + '/transactions/' + swap.lamden_swap_txHash} rel="noopener noreferrer" target="_blank">
                {swap.lamden_swap_txHash}
            </a>
        </p>
    {/if}
    {#if swap.errorMsg !== ""}
        <p><strong>Error:</strong></p>
        <p class="text-red">{swap.errorMsg}</p>
    {/if}
</div> 
