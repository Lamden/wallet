<script> 
    import { setContext, getContext, onMount } from 'svelte';

    //Stores
    import { CoinStore, SettingsStore, previousPage, getCoinReference, breadcrumbs } from '../../js/stores/stores.js';

    //Components
	import { HistoryMain, Modal, Modals, Components }  from '../../js/router.js'
	const { Button } = Components;
	import { backgrounds } from '../../js/images.js';
	const { squares_bg } = backgrounds;

    //Utils
    import { logos } from '../../js/crypto/logos.js';

    setContext('closeModal', {
		closeModal: () => closeModal(),
	});

    const { switchPage } = getContext('switchPage');

    let openModal = false;
    let currentModal = '';

    $: coin = CoinStore.getCoin($SettingsStore.currentPage.data, $CoinStore) || $SettingsStore.currentPage.data;
    $: logo = coin.logo ? coin.logo : logos[coin.network][coin.symbol.replace("-", "_")] || logos[coin.network].default ;
    $: symbol = coin.symbol;
    $: balance = coin.balance ? coin.balance : 0;

	onMount(() => {
        breadcrumbs.set([
            {name: 'Holdings', page: {name: 'CoinsMain'}},
            {name: `${coin.name} ${symbol}`, page: {name: ''}},
        ]);
    });
    

    function showModal(modal){
        currentModal = modal;
        openModal = true;
    }

    function closeModal(){
        openModal = false;
    }

    function deleteCoin(){
        if (confirm("Delete?")){
            switchPage('CoinsMain');
            CoinStore.update(coinstore => {coinstore.splice(coinstore.indexOf(coin), 1); return coinstore;});
        };
    }

</script>

<style>
.page{
	display: flex;
	flex-direction: column;
}

.hero-rec{
    display: flex;
    flex-direction: column;
	box-sizing: border-box;
	min-height: 247px;
	border-radius: 4px;
	margin-bottom: 18px;
    padding: 40px;
    background-size: cover;
    background-repeat: no-repeat;
}

.amount-box{
    display: flex;
	flex-direction: column;
}

.amount{
    font-style: normal;
    font-weight: normal;
    font-size: 55px;
    line-height: 69px;
    display: flex;
    align-items: center;
    letter-spacing: 0.25px;
}

.buttons{
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: flex-end;
    flex-grow: 1;
    margin-top: 4rem;
}


</style>

<div class="page text-primary">
	<div class="hero-rec" style="background-image: url({squares_bg});">
        <div class="amount-box">
            <div class="text-body1"> {symbol} </div>
            <div class="amount"> {balance} </div>
        </div>
        <div class="buttons">
        	<Button 
                classes={'button__transparent'}
				name="Send Coin"
                margin={'0 49px 0 0'}
		 		click={() => switchPage('CoinSend', coin)} 
				icon='arrowUp'/>

		    <Button 
                classes={'button__transparent button__blue'}
				name="Recieve Coin"
                margin={'0 49px 0 0'}
		 		click={() => switchPage('CoinRecieve', coin)} 
				icon='arrowDown'/>

            <Button 
                classes={'button__transparent button__blue'}
				name="Delete Coin"
		 		click={() => deleteCoin()} 
				icon='arrowDown'/>
        </div>

	</div>
    <HistoryMain filter={coin} />
</div>