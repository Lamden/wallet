<script> 
    import { setContext, getContext, onMount } from 'svelte';

    //Stores
    import { CoinStore, SettingsStore, currentNetwork, previousPage, getCoinReference, breadcrumbs, TxStore } from '../../js/stores/stores.js';

    //Components
	import { HistoryMain, Modal, Modals, Components }  from '../../js/router.js'
	const { Button } = Components;
	import { backgrounds } from '../../js/images.js';
	const { squares_bg } = backgrounds;

    //Utils
    import { copyToClipboard } from '../../js/utils.js'
    import { logos } from '../../js/crypto/logos.js';

    //Context
    const { switchPage, openModal, closeModal } = getContext('app_functions');

    let sendPages = {
        lamden: 'CoinLamdenSend'
    }

    let buttons = [
        {id: "home-btn", name: 'ok', click: () => closeModal(), class: 'button__solid button__purple'},
    ]

    $: coin = CoinStore.getCoin($SettingsStore.currentPage.data, $CoinStore) || $SettingsStore.currentPage.data;
    $: logo = coin.logo ? coin.logo : logos[coin.network][coin.symbol.replace("-", "_")] || logos[coin.network].default ;
    $: symbol = coin.symbol;
    $: balance = coin.balance ? coin.balance : 0;
    $: sendPage = sendPages[coin.network]
    $: txList =  [...TxStore.getTx($currentNetwork, coin.vk)]

	onMount(() => {
        breadcrumbs.set([
            {name: 'Holdings', page: {name: 'CoinsMain'}},
            {name: `${coin.name} ${symbol}`, page: {name: ''}},
        ]);
    });

    function copyWalletAddress(){
        copyToClipboard(coin.vk)
        openModal('MessageBox', {
            text: "Wallet Address Copied",
            type: "success",
            buttons: buttons
        })
    }

</script>

<style>
.coin-details{
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

.nickname{
    margin-bottom: 20px;
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

<div class="coin-details text-primary">
	<div class="hero-rec" style="background-image: url({squares_bg});">
        <div class="amount-box">
            <div class="nickname text-body3">{coin.nickname}</div>
            <div class="text-body1"> {symbol} </div>
            <div class="amount"> {balance} </div>
        </div>
        <div class="buttons">
        	<Button
                id={'send-coin-btn'} 
                classes={'button__transparent'}
				name="Send Coin"
                margin={'0 49px 0 0'}
		 		click={() => openModal(sendPage, coin)} 
				icon='arrowUp'/>
            <Button
                id={'send-coin-btn'} 
                classes={'button__transparent button__blue'}
                name="Receive Coin"
                margin={'0 49px 0 0'}
		 		click={() => copyWalletAddress()} 
				icon='arrowDown'/>

		    <Button 
                id={'modify-coin-btn'} 
                classes={'button__transparent button__blue'}
				name="Coin Options"
                margin={'0 49px 0 0'}
		 		click={() => openModal('CoinModify', coin)}
				/>
        </div>
    </div>
    <!--<HistoryMain {txList} />-->
</div>