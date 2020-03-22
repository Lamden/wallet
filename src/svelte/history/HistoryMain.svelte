<script>
    import { onMount } from 'svelte';
    
    //Stores
    import { TxStore, breadcrumbs, PendingTxStore, currentNetwork } from '../../js/stores/stores.js';

	//Components
    import { Transactions, PendingTransactions }  from '../Router.svelte'

	onMount(() => {
        breadcrumbs.set([{name: 'History', page: {name: ''}},]);
    });

    $: transactionsList = flattenObject($TxStore)

    const flattenObject = (txList) => {
        let flatList = []
        if (typeof txList[$currentNetwork.url] === 'undefined') return flatList;
        Object.keys(txList[$currentNetwork.url]).map(vk => {
            flatList.push(...txList[$currentNetwork.url][vk])
        })
        return flatList
    }

</script>

<style>
.history{
    display:flex;
    flex-direction: column;
}

</style>

<div class="history text-primary flex-column">
    <h5>Transaction History</h5>
    <h4>Pending</h4>
    <PendingTransactions pendingTransactions={$PendingTxStore} />
    <Transactions {transactionsList} />
</div>
