<script>
    import { onMount } from 'svelte';
    
    //Stores
    import { TxStore, breadcrumbs, currentNetwork, networkKey } from '../../js/stores/stores.js';

	//Components
    import { Transaction }  from '../Router.svelte'

    let page = 1;
    
    $: txByDay = groupByDate(flattenObject($TxStore[networkKey($currentNetwork)]));
  
	onMount(() => {
        breadcrumbs.set([{name: 'History', page: {name: ''}},]);     
    });

    function sortTxList(txList){
        return txList.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    function groupByDate(txList){
        if (!txList) return {};
        let txDict = {};
        sortTxList(txList).map(tx => {
            let date = new Date(tx.date).toLocaleDateString();
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
        console.log(flatList)
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

<div class="history text-primary">
    {#if Object.keys(txByDay).length === 0}
        <h5>No Transaction History</h5>
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
