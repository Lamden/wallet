<script>
    //Stores
    import { currentNetwork, networkKey } from '../../js/stores/stores.js';

	//Components
    import { Components }  from '../Router.svelte'
    const { Transaction } = Components;

    //Images
    import chevronRight from '../../img/menu_icons/icon_chevron-right.svg';
    import chevronLeft from '../../img/menu_icons/icon_chevron-left.svg';

    export let transactionsList = [];

    $: page = 0
    $: numPerPage = 25
    $: maxPages = parseInt(transactionsList.length / numPerPage)  + Math.ceil((transactionsList.length / numPerPage) % 1) || 1
    $: lastPage = page + 1 >= maxPages
    $: startingIndex = page * numPerPage
    $: endIndex = (startingIndex + numPerPage)
    $: endNumber = endIndex > transactionsList.length ? transactionsList.length : endIndex;
    $: txChunk = sortTxList(transactionsList).slice(startingIndex, endIndex)
    $: txByDay = groupByDate(txChunk);

    const sortTxList = (txList) => {
        return txList.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    const groupByDate = (txList) => {
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

    const pageUp = () => {
        if (!lastPage) page = page + 1 
    }
    const pageDown = () => {
        if (page !== 0) page = page - 1
         
    }
</script>

<style>
.flex-end{
    display: flex;
    justify-content: flex-end;
}

.arrow{
    width: 26px;
    height: 26px;
    align-items: center;
    background-color: #ffffff00;
    border: none;
    
}
.icon{
    width: 11px;
}
.icon.left{
    padding-left: 3px;
}
.icon.right{
    padding-left: 4px;
}
.arrow.right{
    margin-left: 10px;
}
.arrow.left{
    margin-right: 10px;
}

.page-details{
    margin: 0 22px 0 0;
}
.page-words{
    margin-top: 4px;
}
.section-header{
    margin: 24px 0 18px;
}
</style>

<h4>Results</h4>
<div class="text-body2 flex-column">
    <div class="flex-row flex-end">
        <button class="arrow left" on:click={pageDown}>
            <div class="icon left">
                {@html chevronLeft}
            </div>
        </button>
        <div class="page-words">
            {`page ${page + 1} of ${maxPages}`}
        </div>
        <button class="arrow right" on:click={pageUp}>
            <div class="icon right">
                {@html chevronRight}
            </div>
        </button>
    </div>
    <div class="flex-end text-primary-dark page-details">
        {`${startingIndex + 1 } - ${endNumber} /  ${transactionsList.length}`}
    </div>
</div>


{#each Object.keys(txByDay) as day}
    
    <div class="section-header text-body2">
        {day}
    </div>
    
    {#each txByDay[day] as tx}
        <Transaction txData={tx}/>
    {/each}
{/each}
