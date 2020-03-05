<script>
    import { onMount } from 'svelte';
    
    //Stores
    import { TxStore, breadcrumbs, currentNetwork, networkKey, PendingTxStore } from '../../js/stores/stores.js';

	//Components
    import { Transaction, PendingTransactions }  from '../Router.svelte'

    let page = 1;
    
    $: txByDay = groupByDate(flattenObject($TxStore[networkKey($currentNetwork)]));
  
	onMount(() => {
        breadcrumbs.set([{name: 'History', page: {name: ''}},]);   
    });

    function sortTxList(txList){
        return txList.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    function groupByDate(txList){
        if (!txList) return {};
        let txDict = {};
        sortTxList(txList).map(tx => {
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            let date = new Date(tx.timestamp).toLocaleDateString(undefined, options);
            if (!txDict[date]){
                txDict[date] = [tx];
            }else{
                txDict[date].push(tx);
            }   
        })
        return txDict
    }

    function flattenObject(txList){
        let flatList = []
        if (!txList) return flatList;
        Object.keys(txList).map(vk => {
            flatList.push(...txList[vk])
        })
        return flatList
    }

</script>

<style>
.history{
    display:flex;
    flex-direction: column;
}
.section-header{
    margin: 24px 0 18px;
}
</style>

<div class="history text-primary flex-column">
    <h5>Transaction History</h5>
    <h4>Pending Transactions</h4>
    <PendingTransactions pendingTransactions={$PendingTxStore} />

    {#each Object.keys(txByDay) as day}
        <h4>Transaction Results</h4>
        <div class="section-header text-body2">
            {day}
        </div>
        
        {#each txByDay[day] as tx}
            <Transaction txData={tx}/>
        {/each}
    {/each}
</div>
