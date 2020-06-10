<script>
    //Stores
    import { currentNetwork, networkKey } from '../../js/stores/stores.js';

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
