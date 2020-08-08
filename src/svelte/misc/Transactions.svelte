<script>
    //Stores
    import { currentNetwork } from '../../js/stores/stores.js';

	//Components
    import { Components }  from '../Router.svelte'
    const { Transaction, Button } = Components;

    //Images
    import refresh from '../../img/menu_icons/icon_refresh.svg';

    export let transactionsList = [];
    export let vk;
    export let fetchTransactions;

    let refreshing = false;
    $: txList = [...transactionsList]

    const openLink = () => {
        window.open(`${$currentNetwork.blockExplorer}/address/${vk}`, '_blank');
    }

    const refreshHistory = () => {
        refreshing = true;
        fetchTransactions();
        setTimeout(() => {refreshing = false}, 1500)
    }

</script>

<style>
.tx-history-h3{
    align-items: center;
}
h3{
    margin-right: 10px;
}
.refresh-icon{
    width: 20px;
    position: relative;
    top: 1px;
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

<div class="flex-row tx-history-h3">
    <h3>Transaction History</h3>			
    <div on:click={refreshHistory} 
		 class="flex-col refresh-icon clickable" 
		 class:spinner={refreshing}>
		 {@html refresh} 
	</div>
</div>

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
