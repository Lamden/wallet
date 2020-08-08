<script>
    import { beforeUpdate, afterUpdate } from 'svelte';
    
    //Stores
    import { currentNetwork } from '../../js/stores/stores.js';

	//Components
    import { Transactions, PendingTransactions }  from '../Router.svelte'

    //Images
    import refresh from '../../img/menu_icons/icon_refresh.svg';
    
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
    <div class="flex-row">
        <h3>Pending</h3>
        <div>{@html refresh}</div>
    </div>
    
    <PendingTransactions pendingTransactions={pendingTxList} />

    {#if $currentNetwork.blockExplorer}
        {#if transactionsList.length > 0}
            <Transactions {transactionsList} vk={coin.vk} {fetchTransactions} />
        {/if}
    {:else}
        <p>This network does not have a Block Explorer to pull a transaction history from.</p>
    {/if}
</div>
