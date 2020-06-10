<script>
    import { onMount, afterUpdate } from 'svelte'
    //Stores
    import { currentNetwork, networkKey } from '../../js/stores/stores.js';

	//Components
    import { Components }  from '../Router.svelte'
    const { Transaction, Button } = Components;

    //Images
    import chevronRight from '../../img/menu_icons/icon_chevron-right.svg';
    import chevronLeft from '../../img/menu_icons/icon_chevron-left.svg';
    import refresh from '../../img/menu_icons/icon_refresh.svg';

    export let transactionsList = [];
    export let vk;
    export let fetchTransactions;

    let refreshing = false;
    $: txList = [...transactionsList]
/*
    $: page = 0
    $: numPerPage = 25
    $: maxPages = parseInt(transactionsList.length / numPerPage)  + Math.ceil((transactionsList.length / numPerPage) % 1) || 1
    $: lastPage = page + 1 >= maxPages
    $: startingIndex = page * numPerPage
    $: endIndex = (startingIndex + numPerPage)
    $: endNumber = endIndex > transactionsList.length ? transactionsList.length : endIndex;
    $: txChunk = sortTxList(transactionsList).slice(startingIndex, endIndex)
    $: txByDay = groupByDate(txChunk);
*/
    afterUpdate(() => {
        console.log(transactionsList)
    })

    const openLink = () => {
        window.open(`${$currentNetwork.blockExplorer}/address/${vk}`, '_blank');
    }

    const refreshHistory = () => {
        refreshing = true;
        fetchTransactions();
        setTimeout(() => {refreshing = false}, 2000)
    }
    /*
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
         
    }*/
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
.tx-history-h4{
    align-items: center;
}
.refresh-icon{
	margin-left: 10px;
    width: 20px;
    justify-content: center;
}
.button-more{
    justify-content: center;
}

.spinner{
	animation: rotation 4s infinite linear;
}
h4{
    display: inline;
}

@keyframes rotation {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(-720deg);
  }
}
</style>

<div class="flex-row tx-history-h4">
    <h4>Transaction History</h4>			
    <div on:click={refreshHistory} 
		 class="flex-col refresh-icon clickable" 
		 class:spinner={refreshing}>
		 {@html refresh} 
	</div>
</div>
<!-- No need for pagenation, just displaying from blockexplorer for now
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
-->

{#each transactionsList as txData}
    <Transaction {txData} {vk} />
{/each}
{#if transactionsList.length === 10}
    <div class="flex-row button-more">
        <Button 
            name={"show more"}
            classes="button__transparent button__blue"
            margin={"0 0 1rem 0"}
            click={openLink}
            />
    </div>
{/if}
