<script> 
    import { setContext, getContext, onMount } from 'svelte';

    //Stores
    import { 
        CoinStore,
        DappStore, 
        SettingsStore, 
        currentNetwork, 
        breadcrumbs, 
        BalancesStore,
        networkKey,
        PendingTxStore } from '../../js/stores/stores.js';

    //Components
    import Charms  from '../components/Charms.svelte'
    import { CoinHistory, Modal, Modals, Components }  from '../Router.svelte'
    const { Button } = Components;
    
    //Images
    import squares_bg from '../../img/backgrounds/squares_bg.png';
    import verified_app from '../../img/menu_icons/icon_verified_app.svg'
    import arrowUp from '../../img/menu_icons/icon_arrow-up.svg';
    import copyWhite from '../../img/menu_icons/icon_copy_white.svg';
    import settings from '../../img/menu_icons/icon_settings.svg';
    import options from '../../img/menu_icons/icon_options.svg';
    

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

    $: coin = $CoinStore.find(f => f.vk === $SettingsStore.currentPage.data.vk) || $SettingsStore.currentPage.data;
    $: dappInfo = $DappStore[getDappInfo($DappStore)] || undefined
    $: dappLogo = dappInfo ? dappInfo.logo || false : false;
    $: background = dappInfo ? dappInfo.background ? `${dappInfo.url}${dappInfo.background}` : squares_bg : squares_bg
    $: symbol = coin.symbol;
    $: balance = BalancesStore.getBalance($currentNetwork, coin.vk).toLocaleString('en') || '0'
    $: sendPage = sendPages[coin.network]
    $: transactionsList = [];
    $: pendingTxList = () => {
        let pendingList = []
        $PendingTxStore.forEach(tx => {
            if (tx.txInfo.senderVk === coin.vk) pendingList.push(tx)
        })
        return pendingList
    }
    $: thisNetworkApproved = dappInfo ? typeof dappInfo[$currentNetwork.type] === 'undefined' ? false : true : false;
    $: trustedApp = thisNetworkApproved ? dappInfo[$currentNetwork.type].trustedApp : false;
    $: stampRatio = 1


	onMount(() => {
        breadcrumbs.set([
            {name: 'Accounts', page: {name: 'CoinsMain'}},
            {name: `${coin.nickname}`, page: {name: ''}},
        ]);
        getBalance()
        $currentNetwork.API.getVariable('stamp_cost', 'S', 'value').then(res => stampRatio = res)
        if ($currentNetwork.blockExplorer) fetchTransactions();

    });

    const getBalance = async () => {
        chrome.runtime.sendMessage({type: 'balancesStoreUpdateOne', data: coin.vk})
    }

    const getDappInfo = (dappStore) => {
        return Object.keys(dappStore).find(f => dappStore[f].vk === coin.vk)
    }

    const copyWalletAddress = () => {
        copyToClipboard(coin.vk)
        openModal('MessageBox', {
            text: "Account Address Copied",
            type: "success",
            buttons: buttons
        })
    }

    const fetchTransactions = () => {
        if ($currentNetwork.blockExplorer){
            return fetch(`${$currentNetwork.blockExplorer}/api/transactions/history/${coin.vk}?limit=10`)
            .then(res => res.json())
            .then(json => {
                transactionsList = json.data
            })
            
        }
        return [];
    }

    const delayedRefresh = () => {
        if($currentNetwork.blockExplorer) setTimeout(fetchTransactions, 10000)
    }
</script>

<style>
.hero-rec{
	box-sizing: border-box;
	min-height: 247px;
	border-radius: 4px;
	margin-bottom: 18px;
    padding: 40px 40px 26px;
    background-size: cover;
    background-repeat: no-repeat;
}

.wallet-details{
    flex-grow: 1;
}

.dapp-logo{
    width: 150px;
}

.nickname{
    margin-bottom: 20px;
}

small > a {
    margin: 0 5px;
}
small.flex-row{
    align-items: center;
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

.buttons{
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: flex-end;
    flex-grow: 1;
    margin-top: 4rem;
}

.buttons > *{
    margin: 10px 0px;
}

.dapp-name{
    margin: 0;
}

.trusted-icon{
    width: 22px;
    margin-right: 10px;
}

@media only screen and (max-width: 970px) {
  .buttons {
    flex-direction: column;
    align-items: flex-start;
    margin-top: 2rem;
  }
}


</style>

<div id="coin-details" class="flex-column text-primary">
	<div class="hero-rec flex-column" style="background-image: url({background});">
        <div class="flex-row">
            <div class="flex-column wallet-details">
                <div class="nickname text-body3">
                    {#if thisNetworkApproved && dappInfo}
                        <div class="flex-row">
                            {#if trustedApp}
                                <div class="trusted-icon">
                                    {@html verified_app}
                                </div>
                            {/if}
                            <p class="dapp-name">{dappInfo.appName}</p>
                        </div>
                    {:else}
                        <div>{coin.nickname}</div>
                        {#if dappInfo}
                            <small class="text-subtitle2">
                                {`${dappInfo.appName} has not requested access to Lamden's ${$currentNetwork.type.toUpperCase()}`}
                            </small>
                            <small class="flex-row text-subtitle2">
                                {`See`}
                                <a class="outside-link" href={dappInfo.url} rel="noopener noreferrer" target="_blank">{dappInfo.url}</a>
                                {`for details`}
                            </small>
                        {/if}
                    {/if}
                </div>
                <div class="text-body1"> {$currentNetwork.currencySymbol} </div>
                <div class="amount"> {balance} </div>
            </div>
            {#if thisNetworkApproved && dappLogo }
                <div>
                    <img class="dapp-logo" src={`${dappInfo.url}${dappLogo}`} alt="dapp-logo" />
                </div>
            {/if}
        </div>

        <div class="buttons">
        	<Button
                id={'send-coin-btn'} 
                classes={'button__transparent button__blue'}
				name="Send Tx"
                padding={"12px"}
                margin={'0 15px 15px 0'}
		 		click={() => openModal(sendPage, {coin, refreshTx: () => delayedRefresh()})} 
				icon={arrowUp}/>
            <Button
                id={'send-coin-btn'} 
                classes={'button__transparent button__blue'}
                name="Copy Address"
                padding={"12px"}
                margin={'0 15px 15px 0'}
		 		click={() => copyWalletAddress()} 
				icon={copyWhite}/>

		    <Button 
                id={'modify-coin-btn'} 
                classes={'button__transparent button__blue'}
                icon={options}
				name="Options"
                padding={"12px"}
                margin={'0 15px 15px 0'}
		 		click={() => openModal('CoinModify', coin)}
				/>
            </div>
            {#if thisNetworkApproved && $currentNetwork.lamden}
                <div>
                    <Button 
                        id={'dapp-options-btn'} 
                        classes={'button__transparent button__blue'}
                        name="dApp Settings"
                        icon={settings}
                        padding={"12px"}
                        margin={'0 0 15px 0'}
                        click={() => openModal('CoinDappOptions', {coin, dappInfo, startPage: 1})}
                        />
                </div>
            {/if}
        
    </div>
    {#if thisNetworkApproved && $currentNetwork.lamden}
        <Charms dappInfo={dappInfo} />
    {/if}

    <CoinHistory pendingTxList={pendingTxList()} {coin} {transactionsList} {fetchTransactions}/>

</div>