<script> 
    import { SettingsStore, previousPage } from '../../js/stores.js';

    let coin = $SettingsStore.currentPage.data

	function switchPage(page, data) {
		data = data || {}
		let newStore = $SettingsStore;
		newStore.currentPage.name = page;
        newStore.currentPage.data = data;
		SettingsStore.set(newStore);
    }
    
    let totalBalance = 0; 
    let totalUsdBalance = 0; 
    createTotals()

    function createTotals(){
        for (let pubkey in coin.pubkeys){
            totalBalance += coin.pubkeys[pubkey].balance
            totalUsdBalance += coin.pubkeys[pubkey].USD_value
        }
    }

</script>

<h2 on:click={ () => switchPage('CoinsMain')} style="cursor: pointer;"> {"<- Back"} </h2>
<div>
    <h2>{coin.name}</h2>
    <div>balance {totalBalance} {coin.symbol}</div>
    <div>( ${totalUsdBalance.toFixed(2)} )</div> 
    <div>Combined value of your ({Object.keys(coin.pubkeys).length}) addresses</div>   

</div>
<div>
    <h3>Price Information</h3>
    <div>Market Cap: {coin.market_info.market_cap}</div>
    <div>Price: {coin.market_info.price}</div>
    <div>Volume: {coin.market_info.volume}</div>
    <div>Circulating Supply: {coin.market_info.circ_supply}</div>
    <div>Change (24h): {coin.market_info.price_change_24h}</div>
</div>