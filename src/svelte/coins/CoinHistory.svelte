<script>
    import { onMount, beforeUpdate, afterUpdate } from 'svelte';
    
    //Stores
    import { breadcrumbs, TxStore } from '../../js/stores/stores.js';

	//Components
    import { Transaction, PendingTransactions }  from '../Router.svelte'
    
    //Props
    export let txList;
    export let all = false;
    export let pendingTxList

    $: sortedList = [];
    $: txByDay = txList.length > 0 ? groupByDate() : {};
  
	onMount(() => {
        if (all) breadcrumbs.set([{name: 'History', page: {name: ''}},]);
    });

    const sortTxList = (list) => {
        return list.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    const groupByDate = () => {
        let txDict = {};
        txList.map(tx => {
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            let date = new Date(tx.timestamp).toLocaleDateString(undefined, options);
            if (!txDict[date]){
                txDict[date] = [tx];
            }else{
                txDict[date].push(tx);
                txDict[date] = sortTxList(txDict[date])
            }   
        })
        return txDict
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


<div class="history text-primary">
    <h4>Pending Transactions</h4>
    <PendingTransactions pendingTransactions={pendingTxList} />
    {#if Object.keys(txByDay).length === 0}
        <h4>No Transaction History</h4>
    {:else}
        {#each Object.keys(txByDay) as day}
            <h4>Transaction Results</h4>
            <div class="section-header text-body2">
                {new Date(day).toDateString()}
            </div>
            {#each txByDay[day] as tx}
                <Transaction txData={tx}/>
            {/each}
        {/each}
    {/if}
</div>
