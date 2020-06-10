<script>
    import { onMount, beforeUpdate, afterUpdate } from 'svelte';
    
    //Stores
    import { breadcrumbs, currentNetwork } from '../../js/stores/stores.js';

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


	onMount(() => {
        if (all) breadcrumbs.set([{name: 'History', page: {name: ''}},]);
    });

</script>

<style>
.history{
    display:flex;
    flex-direction: column;
}
</style>


<div class="history text-primary">
    <div class="flex-row">
        <div><h4>Pending</h4></div>
        <div>{@html refresh}</div>
    </div>
    
    <PendingTransactions pendingTransactions={pendingTxList} />
    {#if transactionsList.length > 0}
        <Transactions {transactionsList} vk={coin.vk} {fetchTransactions}/>
    {/if}
</div>
