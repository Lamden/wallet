<script> 
    import whitelabel from '../../../whitelabel.json'
    
    import { setContext, getContext, onMount } from 'svelte';

    //Stores
    import { 
        CoinStore,
        DappStore, 
        SettingsStore, 
        currentNetwork, 
        BalancesStore,
        networkKey,
        PendingTxStore } from '../../js/stores/stores.js';

    //Components
    import Charms  from '../components/Charms.svelte'
    import { CoinHistory, Modal, Modals, Components }  from '../Router.svelte'
    const { Button } = Components;
    
    
    //Images
    import hero_bg from '../../img/backgrounds/hero_bg.png';
    import dapp_default_bg from '../../img/backgrounds/dapp_default_bg.jpeg';
    import verified_app from '../../img/menu_icons/icon_verified_app.svg'
    import arrowUp from '../../img/menu_icons/icon_arrow-up.svg';
    import copyWhite from '../../img/menu_icons/icon_copy_white.svg';
    import settings from '../../img/menu_icons/icon_settings.svg';
    import options from '../../img/menu_icons/icon_options.svg';
    import RefreshIcon from '../icons/RefreshIcon.svelte'
    
    //Utils
    import { copyToClipboard, displayBalance } from '../../js/utils.js'

    //Context
    const { switchPage, openModal, closeModal } = getContext('app_functions');

    let refreshing = false;
    let brokenLogoLink = false;
    let brokenBGLink = false;
    let currentNetworkKey = networkKey($currentNetwork)

    let sendPages = {
        lamden: 'CoinLamdenSend'
    }

    let buttons = [
        {id: "home-btn", name: 'ok', click: () => closeModal(), class: 'button__solid button__primary'},
    ]

    $: coin = $CoinStore.find(f => f.vk === $SettingsStore.currentPage.data.vk) || $SettingsStore.currentPage.data;
    $: dappInfo = $DappStore[getDappInfo($DappStore)] || undefined
    $: dappLogo = dappInfo ? dappInfo.logo || false : false;
    $: background = dappInfo ? dappInfo.background ? brokenBGLink ?  dapp_default_bg : `${dappInfo.url}${dappInfo.background}` : dapp_default_bg : hero_bg
    $: symbol = coin.symbol;
    $: balance = displayBalance(BalancesStore.getBalance($currentNetwork, coin.vk)) || '0'
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
        $currentNetwork.API.getVariable('stamp_cost', 'S', 'value').then(res => stampRatio = res)
        if ($currentNetwork.blockExplorer) fetchTransactions();
        if (background.includes('http')){
            fetch(background)
                .then(res => {
                    if (res.status !== 200) brokenBGLink = true
                })
                .catch((err) => brokenBGLink = true)
        }
    });

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
            return fetch(`${$currentNetwork.blockExplorer}/api/transactions/history/${coin.vk}?limit=${whitelabel.accountDetails.transactions.history.amount}`)
            .then(res => res.json())
            .then(json => {
                if (transactionsList.length > 0 && json.data.length > 0){
                    if (transactionsList[0].hash !== json.data[0].hash) handleRefresh()
                }
                transactionsList = json.data
            })
            
        }
        return [];
    }

    const delayedRefresh = () => {
        if($currentNetwork.blockExplorer) setTimeout(fetchTransactions, 10000)
    }

    const handleRefresh = () => {
        if (refreshing) return
		chrome.runtime.sendMessage({type: 'balancesStoreUpdateOne', data: coin})
		refreshing = true
		setTimeout(() => {
            refreshing = false
            balance = displayBalance(BalancesStore.getBalance($currentNetwork, coin.vk))
		}, 2000);
    }
    
    currentNetwork.subscribe(newNetwork => {
		if (networkKey(newNetwork) !== currentNetworkKey){
			currentNetworkKey = networkKey(newNetwork)
			handleRefresh()
		}
	})
</script>

<style>
    h2{
        margin: 0;
    }
    p{
        margin: 0;
    }
    .hero-rec{
        box-sizing: border-box;
        min-height: 247px;
        border-radius: 4px;
        margin-bottom: 18px;
        padding: 40px 40px 26px;
        background-size: cover;
        background-repeat: no-repeat;
    }
    .balance-total{
        align-items: center;
        color: var(--font-overlay);
    }

    .wallet-details{
        flex-grow: 1;
    }

    .dapp-logo{
        width: 125px;
    }

    .nickname{
        margin-bottom: 20px;
        color: var(--font-overlay);
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
        align-self: center;
    }

    .refresh-icon{
        width: 40px;
    }

    .text-huge:first-child{
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
                <div class="nickname text-body1">
                    {#if thisNetworkApproved && dappInfo}
                        <div class="flex-row">
                            {#if trustedApp}
                                <div class="trusted-icon">
                                    {@html verified_app}
                                </div>
                            {/if}
                            <h2 class="dapp-name">{dappInfo.appName}</h2>
                        </div>
                    {:else}
                        <h2>{coin.nickname}</h2>
                    {/if}
                </div>
                <div class="text-overlay text-body1"> {$currentNetwork.currencySymbol} </div>
                <div class="flex-row balance-total">
                    <p class="text-huge">{balance}</p>
                    <div on:click={handleRefresh} 
                        id="refresh-icon"
                        class="flex-col refresh-icon" 
                        class:spinner={refreshing}>
                        <RefreshIcon />
                    </div>
                </div>
                
            </div>
            {#if thisNetworkApproved && dappLogo }
                {#if !brokenLogoLink}
                    <img class="dapp-logo" src={`${dappInfo.url}${dappLogo}`} alt="dapp-logo" on:error={() => brokenLogoLink = true} />
                {/if}
            {/if}
        </div>

        <div class="buttons">
            {#if whitelabel.accountDetails.buttons.send.show}
                {#if coin.sk !== "watchOnly"}
                    <Button
                        id={'send-coin-btn'} 
                        classes={'button__transparent button__overlay'}
                        name={whitelabel.accountDetails.buttons.send.name}
                        padding={"12px"}
                        margin={'0 15px 15px 0'}
                        click={() => openModal(sendPage, {coin, refreshTx: () => delayedRefresh()})} 
                        icon={arrowUp}
                    />
                {/if}
            {/if}
            {#if whitelabel.accountDetails.buttons.copy.show}
                <Button
                    id={'send-coin-btn'} 
                    classes={'button__transparent button__overlay'}
                    name={whitelabel.accountDetails.buttons.copy.name}
                    padding={"12px"}
                    margin={'0 15px 15px 0'}
                    click={copyWalletAddress} 
                    icon={copyWhite}
                />
            {/if}
            {#if whitelabel.accountDetails.buttons.options.show}
                <Button 
                    id={'modify-coin-btn'} 
                    classes={'button__transparent button__overlay'}
                    icon={options}
                    name={whitelabel.accountDetails.buttons.options.name}
                    padding={"12px"}
                    margin={'0 15px 15px 0'}
                    click={() => openModal('CoinModify', coin)}
                />
            {/if}
            </div>
            {#if thisNetworkApproved && $currentNetwork.lamden}
                <div>
                    <Button 
                        id={'dapp-options-btn'} 
                        classes={'button__transparent button__overlay'}
                        name="dApp Settings"
                        icon={settings}
                        padding={"12px"}
                        margin={'0 0 15px 0'}
                        click={() => openModal('CoinDappOptions', {coin, dappInfo, startPage: 1})}
                        />
                </div>
            {/if}
            {#if thisNetworkApproved && dappInfo} 
                <p class="text-body2 text-green">
                    Account linked to  
                    <a href="{dappInfo.url}" class="text-link" target="_blank" rel="noopener noreferrer">{`${dappInfo.url}`}</a>
                </p>
            {/if}
            {#if !thisNetworkApproved && dappInfo} 
                <p class="text-body2 text-warning">
                    You have not approved for this app for {$currentNetwork.name}. Vist 
                    <a href="{dappInfo.url}" class="text-link" target="_blank" rel="noopener noreferrer">{`${dappInfo.url}`}</a>
                    to create account link.
                </p>
            {/if}
        
    </div>
    {#if thisNetworkApproved && $currentNetwork.lamden}
        <Charms dappInfo={dappInfo} />
    {/if}

    <CoinHistory pendingTxList={pendingTxList()} {coin} {transactionsList} {fetchTransactions} />

</div>