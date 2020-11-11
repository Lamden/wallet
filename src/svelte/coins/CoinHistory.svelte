<script>
    import whitelabel from '../../../whitelabel.json'

    import { beforeUpdate, afterUpdate } from 'svelte';
    
    //Stores
    import { currentNetwork } from '../../js/stores/stores.js';

	//Components
    import { Transactions, PendingTransactions }  from '../Router.svelte'

    //Props
    export let coin;
    export let all = false;
    export let pendingTxList;
    export let transactionsList;
    export let fetchTransactions;

</script>

<style>
.history{
    display:flex;
    flex-direction: column;
}
</style>


<div class="history text-primary">
    {#if whitelabel.accountDetails.transactions.pending.show}
        <div class="flex-row">
            <h3>{whitelabel.accountDetails.transactions.pending.title}</h3>
        </div>
        <PendingTransactions pendingTransactions={pendingTxList} />
    {/if}
    {#if whitelabel.accountDetails.transactions.history.show}
        {#if $currentNetwork.blockExplorer}
            {#if transactionsList.length > 0}
                <Transactions {transactionsList} vk={coin.vk} {fetchTransactions} />
            {/if}
        {:else}
            <p>This network does not have a Block Explorer to pull a transaction history from.</p>
        {/if}
    {/if}
</div>
