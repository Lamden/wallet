<script>
    import { onMount, beforeUpdate, afterUpdate } from 'svelte';
    
    //Stores
    import { breadcrumbs, TxStore } from '../../js/stores/stores.js';

	//Components
    import { Transaction }  from '../Router.svelte'
    
    //Props
    export let txList;
    export let all = false;

    $: sortedList = [];
    $: txByDay = txList.length > 0 ? groupByDate() : {};
  
	onMount(() => {
        if (all) breadcrumbs.set([{name: 'History', page: {name: ''}},]);
    });

    function sortTxList(){
        sortedList = txList.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    function groupByDate(){
        sortTxList();
        let txDict = {};
        txList.map(tx => {
            let date = new Date(tx.date).toLocaleDateString();
            if (!txDict[date]){
                txDict[date] = [tx];
            }else{
                txDict[date].push(tx);
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
    {#if Object.keys(txByDay).length === 0}
        <h4>No Transaction History</h4>
    {:else}
        {#each Object.keys(txByDay) as day}
            <div class="section-header text-body2">
                {new Date(day).toDateString()}
            </div>
            {#each txByDay[day] as tx}
                <Transaction txData={tx}/>
            {/each}
        {/each}
    {/if}
</div>
