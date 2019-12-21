<script>
    import { onMount, beforeUpdate, afterUpdate } from 'svelte';
    
    //Stores
    import { breadcrumbs, allTransactions } from '../../js/stores/stores.js';

	//Components
    import { Transaction }  from '../../js/router.js'
    
    //Props
    export let filter;
    $: txList = [...$allTransactions];
    $: txByDay = txList.length > 0 ? groupByDate() : {};
  
	onMount(() => {
        if (!filter) breadcrumbs.set([{name: 'History', page: {name: ''}},]);
    });

    function filterTxList(){
        if (filter && txList){
            let filteredList = txList.filter( f => {
                return  f.sender.network === filter.network && f.sender.symbol === filter.symbol && f.sender.vk === filter.vk;
            });
            return filteredList
        }
        return txList;
    }

    function sortTxList(){
        txList = filterTxList().sort((a, b) => new Date(b.date) - new Date(a.date));
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
    {#each Object.keys(txByDay) as day}
        <div class="section-header text-body2">
            {new Date(day).toDateString()}
        </div>
        {#each txByDay[day] as tx}
            <Transaction txData={tx}/>
        {/each}
    {/each}
</div>
