<script> 
    import { SettingsStore, previousPage } from '../../js/stores.js';


    //Components
    import { Modal, CoinPublicKey, CoinSend }  from '../../js/router.js'
    const modals = {CoinPublicKey, CoinSend}

    let openModal = false;
    let currentModal = '';

    let coin = $SettingsStore.currentPage.data
    coin.totalBalance = 0; 
    coin.totalUsdBalance = 0;
    coin.pubkeysList = [];
    let selected;
    createTotals()

	function switchPage(page, data) {
		data = data || {}
		let newStore = $SettingsStore;
		newStore.currentPage.name = page;
        newStore.currentPage.data = data;
		SettingsStore.set(newStore);
    }
    
    function createTotals(){
        for (let pubkey in coin.pubkeys){
            coin.pubkeysList.push({'label': pubkey, 'address' : coin.pubkeys[pubkey].address });
            coin.totalBalance += coin.pubkeys[pubkey].balance;
            coin.totalUsdBalance += coin.pubkeys[pubkey].USD_value;
        }
    }

    function donenow(){
        alert('done')
    }

    function showModal(modal){
        currentModal = modal;
        openModal = true;
    }

</script>

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
    <div>Market Cap: {coin.market_info.market_cap}</div>
    <div>Price: {coin.market_info.price}</div>
    <div>Volume: {coin.market_info.volume}</div>
    <div>Circulating Supply: {coin.market_info.circ_supply}</div>
    <div>Change (24h): {coin.market_info.price_change_24h}</div>
</div>

{#if openModal}
	<Modal on:close="{() => openModal = false}">
        <svelte:component this={modals[currentModal]} {switchPage} {coin}}/>
	</Modal>
{/if}