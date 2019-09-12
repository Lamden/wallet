<script> 
    import { getContext} from 'svelte';

    //Stores
    import { SettingsStore, allTotals, previousPage } from '../../js/stores.js';

    //Components
    import { Modal, Modals }  from '../../js/router.js'

    //Utils
    import { toCurrencyFormat }  from '../../js/utils.js'

    const { switchPage } = getContext('switchPage');

    let openModal = false;
    let currentModal = '';
    let selected;

    let coin = $SettingsStore.currentPage.data

    let totalBalance = 0;
    let totalUSDValue = 0;

    $: if ($allTotals.coinTotals[coin.network]) totalBalance = $allTotals.coinTotals[coin.network][coin.symbol].balance || 0;
    $: if ($allTotals.coinTotals[coin.network]) totalUSDValue = $allTotals.coinTotals[coin.network][coin.symbol].USD_value || 0;

    function showModal(modal){
        currentModal = modal;
        openModal = true;
    }

</script>

<style>
    div{
        display: grid;
    }
</style>

<h2 on:click={ () => switchPage('CoinsMain')} style="cursor: pointer;"> {"<- Back"} </h2>
<div>
    <h2>{coin.name}</h2>
    <div> {`balance ${totalBalance} ${coin.symbol}`}</div>
    <div> {`(${totalUSDValue})`} </div> 
    <div>Combined value of your ({Object.keys(coin.pubkeys).length}) addresses</div>   
</div>

<button on:click={ () => showModal('CoinSend') }> Send </button>
<button on:click={ () => showModal('CoinRecieve') }> Recieve </button>

<div>
    <h3>Price Information</h3>
    <div>Market Cap: 0</div>
    <div>Price: 0</div>
    <div>Volume: 0</div>
    <div>Circulating Supply: 0</div>
    <div>Change (24h): 0</div>
</div>

{#if openModal}
	<Modal on:close="{() => openModal = false}">
        <svelte:component this={Modals[currentModal]} {switchPage} {coin}}/>
	</Modal>
{/if}