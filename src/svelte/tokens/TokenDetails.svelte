<script> 
    import whitelabel from '../../../whitelabel.json'
    
    import { setContext, getContext, onMount } from 'svelte';

    //Stores
    import { 
        TokenStore,
        CoinStore,
        SettingsStore, 
        currentNetwork, 
        networkKey,
        TokenBalancesStore,
        tokensDropDown,
        tokenBalanceTotal
    } from '../../js/stores/stores.js';

    //Misc
    import { getTokenTotalBalance } from '../../js/utils.js';

    //Components
    import { Modal, Modals, Components, Coin, CoinDivider }  from '../Router.svelte'
    const { Button, TokenLogo } = Components;
    
    //Images
    import hero_bg from '../../img/backgrounds/hero_bg.png';   

    //Icons
    import RefreshIcon from '../icons/RefreshIcon.svelte'
    import TransferIcon from '../icons/TransferIcon.svelte'
    import ApproveIcon from '../icons/ApproveIcon.svelte'
    import SettingsIcon from '../icons/SettingsIcon.svelte'
    
    //Utils
    import { copyToClipboard, displayBalance, stringToFixed } from '../../js/utils.js'

    //Context
    const { switchPage, openModal, closeModal } = getContext('app_functions');

    let refreshing = false;

    let buttons = [
        {id: "home-btn", name: 'ok', click: () => closeModal(), class: 'button__solid button__primary'},
    ]

    $: netKey = networkKey($currentNetwork)
    $: tokens = $TokenStore[netKey] || []
    $: token = tokens.find(f => f.contractName === $SettingsStore.currentPage.data.contractName) || $SettingsStore.currentPage.data;
    $: balance = displayBalance(stringToFixed(getTokenTotalBalance(netKey, token.contractName, $tokenBalanceTotal), 8))
    $: accountList = createAccountList($TokenBalancesStore)

	onMount(() => { 
        null
    });

    const createAccountList = () => {
        let acountsWithBalances = []
        if (!$TokenBalancesStore[netKey]) return acountsWithBalances
        Object.keys($TokenBalancesStore[netKey]).forEach(vk => {
            if (typeof $TokenBalancesStore[netKey][vk][token.contractName] !== 'undefined'){
                acountsWithBalances.push($CoinStore.find(f => f.vk === vk))
            }
        })
        return acountsWithBalances
    }


    const copyWalletAddress = () => {
        copyToClipboard(coin.vk)
        openModal('MessageBox', {
            text: "Account Address Copied",
            type: "success",
            buttons: buttons
        })
    }

    const handleRefresh = (delay = 0) => {
        if (refreshing) return
		setTimeout(chrome.runtime.sendMessage({type: 'refreshOneTokenBalances', data: token.contractName}), delay)
		refreshing = true
		setTimeout(() => {
            refreshing = false
		}, 2000);
    }

    const handleOpenTxWindow = (txMethod, account = undefined) => {
        openModal('TokenLamdenSend', {
            token, 
            coin: account,
            txMethod,
            refreshTx: () => handleRefresh(8000)
        })
    }
</script>

<style>
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
        color: var(--font-overlay);
    }

    .token-name{
        margin-bottom: 20px;
        color: var(--font-overlay);
    }

    .buttons{
        display: flex;
        flex-basis: row;
        flex-wrap: wrap;
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

    @media only screen and (max-width: 970px) {
        .buttons {
            flex-direction: column;
            align-items: flex-start;
            margin-top: 2rem;
        }
    }
</style>

<div id="token-details" class="flex-column text-primary">
	<div class="hero-rec flex-column" style="background-image: url({hero_bg});">
        <div class="token-name flex-row flex-align-center text-body1">
            <TokenLogo tokenMeta={token} width={"40px"} margin="0 10px 0 0" />
            <h2>{token.tokenName}</h2>
        </div>
        <div class="text-overlay text-body1"> {token.tokenSymbol} </div>
        <div class="flex-row balance-total">
            <p class="text-huge">{balance}</p>
            <div on:click={handleRefresh} 
                id="refresh-icon"
                class="flex-column refresh-icon" 
                class:spinner={refreshing}>
                <RefreshIcon />
            </div>
        </div>  
        <div class="buttons flex-grow">
            {#if whitelabel.tokenDetails.buttons.send.show}
                <Button
                    id={'transfer-token-btn'} 
                    classes={'button__outlined button__overlay'}
                    name={whitelabel.tokenDetails.buttons.send.name}
                    padding={"12px"}
                    margin={'0 15px 15px 0'}
                    click={() => handleOpenTxWindow('transfer', undefined)}
                >
                    <div slot="icon-before">
                        <TransferIcon width="15px" color="var(--color-white)" />
                    </div>
                </Button> 
            {/if}
            {#if whitelabel.tokenDetails.buttons.approve.show}
                <Button
                    id={'approve-token-btn'} 
                    classes={'button__outlined button__overlay'}
                    name={whitelabel.tokenDetails.buttons.approve.name}
                    padding={"12px"}
                    margin={'0 15px 15px 0'}
                    click={() => handleOpenTxWindow('approve', undefined)}
                >
                    <div slot="icon-after">
                        <ApproveIcon width="15px" color="var(--color-white)" />
                    </div>
                </Button> 
            {/if}
            {#if whitelabel.tokenDetails.buttons.options.show}
                <Button
                    id={'modify-token-btn'}
                    classes={'button__outlined button__overlay'}
                    name={whitelabel.tokenDetails.buttons.options.name}
                    padding={"12px"}
                    margin={'0 15px 15px 0'}
                    click={() => openModal('TokenModify', token)}
                >
                    <div slot="icon-after">
                        <SettingsIcon width="15px" color="var(--color-white)" />
                    </div>
                </Button> 
            {/if}
        </div>
    </div>
    <div>
        {#each accountList as account}
            <Coin coin={account} {token}/>
            <!--
            <div class="flex-row flex-center-end" style="margin-right: 28px;">
                <button class="button__text details-button text-body2" on:click={() => handleOpenTxWindow(account, 'transfer')} >transfer</button>
                <button class="button__text details-button text-body2" on:click={() => handleOpenTxWindow(account, 'approve')} >approve</button>
                <button class="button__text details-button text-body2" on:click={() => handleOpenTxWindow(account, 'tansfer_from')} >transfer from</button>
            </div>
            -->
			<CoinDivider />
        {/each}
    </div>
    <!--
    {#if thisNetworkApproved && $currentNetwork.lamden}
        <Charms dappInfo={dappInfo} />
    {/if}

    <CoinHistory pendingTxList={pendingTxList()} {coin} {transactionsList} {fetchTransactions} /> 
    -->
</div>