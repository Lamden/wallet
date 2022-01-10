<script> 
    import whitelabel from '../../../whitelabel.json'
    
    import { getContext, onMount } from 'svelte';

    //Stores
    import { 
        CoinStore,
        SettingsStore, 
        currentNetwork, 
        BalancesStore,
        networkKey,
        PendingTxStore } from '../../js/stores/stores.js';

    //Components
    import { CoinHistory, Modal, Modals, Components }  from '../Router.svelte'
    const { Button, Identicons } = Components;
    
    
    //Images
    import hero_bg from '../../img/backgrounds/hero_bg.png';

    //Icons
    import RefreshIcon from '../icons/RefreshIcon.svelte'
    import SendIcon from '../icons/SendIcon.svelte'
    import CopyIcon from '../icons/CopyIcon.svelte'
    import SettingsIcon from '../icons/SettingsIcon.svelte'
    import PopoutIcon from '../icons/PopoutIcon.svelte'
    import CheckmarkIcon from '../icons/CheckmarkIcon.svelte'
    
    //Utils
    import { copyToClipboard, displayBalanceToFixed } from '../../js/utils.js'

    //Context
    const { switchPage, openModal, closeModal } = getContext('app_functions');

    let refreshing = false;
    let copiedButton = false;
    let copiedIcon = false;
    let currentNetworkKey = networkKey($currentNetwork)

    let sendPages = {
        lamden: 'CoinLamdenSend'
    }

    let buttons = [
        {id: "home-btn", name: 'ok', click: () => closeModal(), class: 'button__solid button__primary'},
    ]

    $: coin = $CoinStore.find(f => f.vk === $SettingsStore.currentPage.data.vk) || $SettingsStore.currentPage.data;
    $: background =  hero_bg
    $: balance = displayBalanceToFixed(BalancesStore.getBalance($currentNetwork, coin.vk), 8) || '0'
    $: sendPage = sendPages[coin.network]
    $: transactionsList = [];
    $: addressLookupURL = $currentNetwork.type === "mainnet" ? "https://www.tauhq.com" : $currentNetwork.blockExplorer;
    $: pendingTxList = () => {
        let pendingList = []
        $PendingTxStore.forEach(tx => {
            if (tx.txInfo.senderVk === coin.vk) pendingList.push(tx)
        })
        return pendingList
    }

	onMount(() => {
        if ($currentNetwork.blockExplorer) fetchTransactions();
        if (background.includes('http')){
            fetch(background)
                .then(res => {
                    if (res.status !== 200) brokenBGLink = true
                })
                .catch((err) => brokenBGLink = true)
        }
    });

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
		chrome.runtime.sendMessage({type: 'balancesStoreUpdateOne', data: coin.vk})
		refreshing = true
		setTimeout(() => {
            refreshing = false
            balance = displayBalanceToFixed(BalancesStore.getBalance($currentNetwork, coin.vk), 8)
		}, 2000);
    }

    const handleAddressCopy = (type) => {
        copyToClipboard(coin.vk)
        if (type == "icon") copiedIcon = true
        if (type == "button") copiedButton = true
        setTimeout(() => {copiedButton = false; copiedIcon = false}, 2000)
    }

    currentNetwork.subscribe(newNetwork => {
		if (networkKey(newNetwork) !== currentNetworkKey){
			currentNetworkKey = networkKey(newNetwork)
			handleRefresh()
		}
	})
</script>

<style>
    hr{
        height: 0px;
        border: 1px solid var(--divider-dark);
        width: 100%;
    }
    h2{
        margin: 0;
    }
    p{
        margin: 0;
    }
    .hero-rec{
        min-height: 247px;
        padding: 40px 40px 26px;
    }
    .balance-total{
        align-items: center;
        color: var(--font-overlay);
    }

    .wallet-details{
        flex-grow: 1;
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

    .refresh-icon{
        width: 40px;
    }

    .text-huge:first-child{
        margin-right: 10px;
    }

    .account-vk{
        margin-left: 1em;
    }

    .account-address{
        margin: 1rem 0 2rem;
    }

    .account-vk{
        margin-left: 1em;
        width: 175px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .icon-copy{
        margin: 0 1em 0 0.5em;
    }

    .logo{
        display: flex;
        justify-content: center;
        padding: 5px;
        background: black;
        border-radius: 999px;
        border: 3px solid var(--color-grey-3);
    }
    h2{
        line-height: 52px;
    }
    .mr10{
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
	<div class="hero-rec flex-column" style="background-image: url({hero_bg});">
        <div class="flex-row">
            <div class="flex-column wallet-details">
                <div class="nickname text-body1 flex-row">
                    <div class="logo mr10 flex-center-center">
                        <Identicons margin="0" iconValue={coin.vk} width="36px"/>
                    </div>
                    <h2>{coin.nickname}</h2>
                </div>
                <div class="text-overlay text-body1"> {$currentNetwork.currencySymbol} </div>
                <div class="flex-row balance-total">
                    <p class="text-huge">{balance}</p>
                    <div on:click={handleRefresh} 
                        id="refresh-icon"
                        class="flex-column refresh-icon" 
                        class:spinner={refreshing}>
                        <RefreshIcon />
                    </div>
                </div>
                
            </div>
        </div>

        <div class="buttons">
            {#if whitelabel.accountDetails.buttons.send.show}
                {#if coin.sk !== "watchOnly"}
                    <Button
                        id={'send-coin-btn'} 
                        classes={'button__outlined button__overlay'}
                        name={whitelabel.accountDetails.buttons.send.name}
                        click={() => openModal(sendPage, {coin, refreshTx: () => delayedRefresh()})} 
                        padding={"12px"}
                        margin={'0 15px 15px 0'}
                    >
                        <div slot="icon-before">
                            <SendIcon width="15px" color="var(--color-white)" />
                        </div>
                    </Button> 
                {/if}
            {/if}
            {#if whitelabel.accountDetails.buttons.copy.show}
                <Button
                    id={'copy-address-btn'} 
                    classes={'button__outlined button__overlay'}
                    click={() => handleAddressCopy("button")} 
                    name={whitelabel.accountDetails.buttons.copy.name}
                    padding={"12px"}
                    margin={'0 15px 15px 0'}
                >
                    <div slot="icon-before">
                        {#if copiedButton}
                            <CheckmarkIcon width="13px" color="var(--success-color)"/>
                        {:else}
                            <CopyIcon width="12px" color="var(--color-white)" />
                        {/if}
                    </div>
                </Button> 
            {/if}
            {#if whitelabel.accountDetails.buttons.options.show}
                <Button
                    id={'modify-coin-btn'} 
                    classes={'button__outlined button__overlay'}
                    name={whitelabel.accountDetails.buttons.options.name}
                    padding={"12px"}
                    margin={'0 15px 15px 0'}
                    click={() => openModal('CoinModify', coin)}
                >
                    <div slot="icon-before">
                        <SettingsIcon width="15px" color="var(--color-white)" />
                    </div>
                </Button> 
            {/if}
            </div>
        
    </div>
    <strong class="text-accent text-body1">Account Address</strong>
    <div class="flex-row flex-align-center account-address text-body1">
        <div class="logo flex-center-center">
            <Identicons margin="0" iconValue={coin.vk} />
        </div>
        <span class="account-vk">{coin.vk}</span>
        <div class="icon-copy" 
            on:click={() => handleAddressCopy("icon")} 
            title="copy account address"
        >
            {#if !copiedIcon}
                <CopyIcon width="18px" color="var(--font-primary)" />
            {:else}
                <CheckmarkIcon width="18px" color="var(--success-color)"/>
            {/if}
        </div>
        <PopoutIcon width="20px" url={`${addressLookupURL}/addresses/${coin.vk}`}/>
    </div>
    <hr>

    <CoinHistory pendingTxList={pendingTxList()} {coin} {transactionsList} {fetchTransactions} />

</div>