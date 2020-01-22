<script>
    import { onMount } from 'svelte';
    
    //Stores
    import { breadcrumbs, TxStore, currentNetwork } from '../../js/stores/stores.js';

	//Components
    import { Transaction }  from '../Router.svelte'

    let page = 1;
    

    $: txByNetwork = () =>  {  
  
        let netKey = $currentNetwork.ip + $currentNetwork.port
        let networkTxs = !$TxStore[netKey] ? [] : $TxStore[netKey];
        let returnList = []
        Object.keys(networkTxs).map(vks => {
            returnList = [...returnList, ...$TxStore[netKey][vks]]
        })
        return returnList;
    }
    $: sortedList = txByNetwork().sort((a, b) => new Date(b.date) - new Date(a.date));;
    $: txByDay = sortedList.length > 0 ? groupByDate() : {};
    $: txPerPage = 10;
    $: maxPages = () => {
        return (txByDay.length / txPerPage) + (txByDay.length % txPerPage > 0 ? 1 : 0)
    }
  
	onMount(() => {
        breadcrumbs.set([{name: 'History', page: {name: ''}},]);
        
    });

    function groupByDate(){
        let txDict = {};
        sortedList.map(tx => {
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
