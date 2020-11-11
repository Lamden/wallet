<script>
import {getContext} from 'svelte'
    export let swap
    export let currencySymbol
    export let blockexplorer

    //Components
	import { Components }  from '../Router.svelte';
    const { Button } = Components;

    //Context
    const { switchPage } = getContext('app_functions');
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

</style>

<div class="flex-row swap-details text-body2">
    <p>{new Date(swap.created).toLocaleString()}</p>
    <p class="amount"><strong>Amount</strong>{`${swap.amount} ${currencySymbol}`}</p>
    <p 
        class:text-green={swap.status === 'success'} 
        class:text-red={swap.status === 'error'} 
        class:text-warning={swap.status !== 'error' && swap.status !== 'success'}>
        {swap.status.toUpperCase()}
    </p>
</div>
<div class="swap-side">
    <p>
        <strong>ETH Approval Tx</strong>
        <a class="text-link" href={blockexplorer.ethereum + '/tx/' + swap.eth_approval_txHash} rel="noopener noreferrer" target="_blank">
            {swap.eth_approval_txHash}
        </a>
    </p>
    <p>
        <strong>ETH Swap Contract Tx</strong>
        <a class="text-link" href={blockexplorer.ethereum + '/tx/' + swap.eth_swap_txHash} rel="noopener noreferrer" target="_blank">
            {swap.eth_swap_txHash}
        </a>
    </p>
        <p>
        <strong>ETH Address</strong>
        <a class="text-link" href={blockexplorer.ethereum + '/address/' + swap.swapInfo.address} rel="noopener noreferrer" target="_blank">
            {swap.swapInfo.address}
        </a>
    </p>
    
    <p><strong>Lamden Address</strong>
            <a class="text-link" href={blockexplorer.lamden + '/addresses/' + swap.lamdenAddress} rel="noopener noreferrer" target="_blank">
            {swap.lamdenAddress}
        </a>
    </p>
    {#if swap.lamden_swap_txHash}
        <p>
            <strong>Lamden {currencySymbol} Send Tx</strong>
            <a class="text-link" href={blockexplorer.lamden + '/transactions/' + swap.lamden_swap_txHash} rel="noopener noreferrer" target="_blank">
                {swap.lamden_swap_txHash}
            </a>
        </p>
    {/if}
    {#if swap.errorMsg !== ""}
        <p><strong>Error:</strong></p>
        <p class="text-red">{swap.errorMsg}</p>
    {/if}
    {#if swap.status !== "success"}
        <Button 
            name={swap.status === 'error' ? 'retry' : "continue"}
            classes="button__transparent button__accent"
            padding={'5px 10px'}
            height={'30px'}
            margin={'0.5rem 0 0 0'}
            click={() => switchPage('ContinueSwap', swap)}
        />
    {/if}
</div> 
