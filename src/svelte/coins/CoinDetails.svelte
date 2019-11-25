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
            {name: 'Holdings', page: 'CoinsMain'},
            {name: `${coin.name} ${symbol}`, page: ''},
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
	height: 247px;
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
    align-items: flex-end;
    flex-grow: 1;
}


</style>

<div class="page">
	<div class="hero-rec" style="background-image: url({squares_bg});">
        <div class="amount-box">
            <div class="text-body1"> {symbol} </div>
            <div class="amount"> {balance} </div>
        </div>
        <div class="buttons">
        	<Button 
                style={'button__transparent'}
				name="Send Coin"
				width={'150px'}
                height={'42px'}
				padding={'13px 8px 13px 12px'}
                margin={'0 49px 0 0'}
		 		click={() => showModal('CoinSend')} 
				icon='arrowUp'/>

		    <Button style={'button__transparent button__blue'}
				name="Recieve Coin"
				width={'150px'}
                height={'42px'}
				padding={'13px 8px 13px 12px'}
		 		click={() => showModal('CoinRecieve')} 
				icon='arrowDown'/>
        </div>

	</div>
    <HistoryMain filter={coin} />
</div>

{#if openModal}
	<Modal on:close="{() => openModal = false}">
        <svelte:component this={Modals[currentModal]} {switchPage} {coin}}/>
	</Modal>
{/if}