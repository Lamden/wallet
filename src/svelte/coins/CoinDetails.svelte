<script> 
    import { setContext, getContext, onMount } from 'svelte';

    //Stores
    import { CoinStore, SettingsStore, currentNetwork, previousPage, getCoinReference, breadcrumbs, TxStore, networkKey } from '../../js/stores/stores.js';

    //Components
	import { CoinHistory, Modal, Modals, Components }  from '../Router.svelte'
    const { Button } = Components;
    
    //Images
    import squares_bg from '../../img/backgrounds/squares_bg.png';
    import arrowUp from '../../img/menu_icons/icon_arrow-up.svg';
    import arrowDown from '../../img/menu_icons/icon_arrow-down.svg';

    //Utils
    import { copyToClipboard } from '../../js/utils.js'

    //Context
    const { switchPage, openModal, closeModal } = getContext('app_functions');

    let sendPages = {
        lamden: 'CoinLamdenSend'
    }

    let buttons = [
        {id: "home-btn", name: 'ok', click: () => closeModal(), class: 'button__solid button__purple'},
    ]

    $: coin = CoinStore.getCoin($SettingsStore.currentPage.data, $CoinStore) || $SettingsStore.currentPage.data;
    $: symbol = coin.symbol;
    $: balance = coin.balance ? coin.balance : 0;
    $: sendPage = sendPages[coin.network]
    $: txList = () =>  {
        if (!$TxStore[networkKey($currentNetwork)]) return [];
        if (!$TxStore[networkKey($currentNetwork)][coin.vk]) return [];
        return [...$TxStore[networkKey($currentNetwork)][coin.vk]]   
    }

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
            <div class="amount"> {balance.toLocaleString('en')} </div>
        </div>
        <div class="buttons">
        	<Button
                id={'send-coin-btn'} 
                classes={'button__transparent'}
				name="Send Tx"
                margin={'0 49px 0 0'}
		 		click={() => openModal(sendPage, coin)} 
				icon={arrowUp}/>
            <Button
                id={'send-coin-btn'} 
                classes={'button__transparent button__blue'}
                name="Receive Coin"
                margin={'0 49px 0 0'}
		 		click={() => copyWalletAddress()} 
				icon={arrowDown}/>

		    <Button 
                id={'modify-coin-btn'} 
                classes={'button__transparent button__blue'}
				name="Coin Options"
                margin={'0 49px 0 0'}
		 		click={() => openModal('CoinModify', coin)}
				/>
        </div>
    </div>
    <!--<CoinHistory txList={txList()} />-->
</div>