<script> 
    import { SettingsStore, previousPage } from '../../js/stores.js';


    //Components
    import { Modal, Modals }  from '../../js/router.js'

    let openModal = false;
    let currentModal = '';

    let coin = $SettingsStore.currentPage.data
    coin.totalBalance = 0; 
    coin.totalUsdBalance = 0;
    coin.pubkeysList = [];
    let selected;
    createTotals()

	function switchPage(name, data) {
        data = data || {}
        $SettingsStore.currentPage = {name, data}
    }
    
    function createTotals(){
        for (const pubkey in coin.pubkeys){
            coin.pubkeysList.push({'nickname':  coin.pubkeys[pubkey].nickname, 'address' : pubkey });
            //coin.totalBalance += coin.pubkeys[pubkey].balance;
            //coin.totalUsdBalance += coin.pubkeys[pubkey].USD_value;
        }
    }

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
    <div>balance {coin.totalBalance} {coin.symbol}</div>
    <div>( ${coin.totalUsdBalance.toFixed(2)} )</div> 
    <div>Combined value of your ({Object.keys(coin.pubkeys).length}) addresses</div>   
</div>

<button on:click={ () => showModal('CoinSend') }> Send </button>
<button on:click={ () => showModal('CoinPublicKey') }> Recieve </button>

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