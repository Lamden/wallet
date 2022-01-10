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
    //Images
	import cautionIcon from '../../img/menu_icons/icon_caution_circle.svg'
	import vaultLogo from '../../img/vault_logo.svg'

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
    let orderingLocked = false;

    let buttons = [
        {id: "home-btn", name: 'ok', click: () => closeModal(), class: 'button__solid button__primary'},
    ]
    
    $: netKey = networkKey($currentNetwork)
    $: tokens = $TokenStore[netKey] || []
    $: token = tokens.find(f => f.contractName === $SettingsStore.currentPage.data.contractName) || $SettingsStore.currentPage.data;
    $: balance = displayBalance(stringToFixed(getTokenTotalBalance(netKey, token.contractName, $tokenBalanceTotal), 8))
    $: accountList = createAccountList(netKey, $TokenBalancesStore).filter( c => c.sk !== "watchOnly" && c.type !== "vault"  )
    $: coinsTracked = createAccountList(netKey, $TokenBalancesStore).filter( c => c.sk === "watchOnly" )
    $: vaults = createAccountList(netKey, $TokenBalancesStore).filter(c => c.type === "vault");
    $: vaultExist = vaults.length > 0;

	onMount(() => { 
        null
    });

    const createAccountList = (netKey) => {
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

    const handleReorderAccount = (e, coins) => {
		let { id, direction } = e.detail
		if (direction == "up" && !orderingLocked){
			orderingLocked = true;
			chrome.runtime.sendMessage({type: 'accountsReorderUp', data: id}, (success) => {
				if (id !== 0) scrollWindow(-90)
				orderingLocked = false;
			})
		}

		if (direction == "down" && !orderingLocked){
			orderingLocked = true;
			chrome.runtime.sendMessage({type: 'accountsReorderDown', data: id}, (success) => {
				if (id + 1 < coins.length)scrollWindow(90)
				orderingLocked = false;
			})
		}
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

    .header{
        display: flex;
        flex-direction: row;
        width: 100%;
        padding: 0.5rem 0;
        margin-bottom: 0.5rem;
    }
    .header-accounts-tracked{
        margin-top: 4rem;
    }
    .divider{
        border-bottom: 1px solid var(--divider-light);
    }

    .header-text{
        display: flex;
        align-items: center;
    }

    .header-name{
        width: 234px;
    }

    .header-amount{
        padding-left: 15px;
        flex-grow: 1;
    }

    .header-msg{
        padding-left: 15px;
        flex-grow: 1;
        font-size: 14px;
        white-space: nowrap;
    }

    .header-percent{
        justify-content: flex-end;
        margin-right: 28px;  
        width: 203px;
    }
    .logo-space{
        margin-left: 129px;
    }

    @media only screen and (max-width: 970px) {
        .buttons {
            flex-direction: column;
            align-items: flex-start;
            margin-top: 2rem;
        }
    }
    .warning-icon{
        width: 20px;
        margin-left: 10px;
        min-width: 20px;
        cursor: pointer;
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
    {#if vaultExist && vaults.length > 0}
        <div class="header header-vault header-text text-body1 weight-800">
            <div class="header-name header-text">
                My Vault Accounts
                <div class="warning-icon">{@html vaultLogo}</div>
            </div>
        </div>
        {#each vaults as coin (coin.vk) }
            <Coin {coin} {token} refreshTx={handleRefresh} on:reorderAccount={handleReorderAccount}/>
        {/each}
    {/if}
    {#if accountList.length !== 0}
        <div class="header header-accounts header-text text-body1 divider ">
            {#if whitelabel.mainPage.account_info.show}
                <div class="header-name header-text">
                    {whitelabel.mainPage.account_info.title}
                    <div class="warning-icon" on:click={() => openModal("CoinLegacyModal")}>{@html cautionIcon}</div>
                </div>
            {/if}
            {#if whitelabel.mainPage.amount.show}
                <div class="header-amount header-text">{whitelabel.mainPage.amount.title}</div>
            {/if}
        </div>	
        {#each accountList as coin (coin.id) }
            <Coin {coin} {token} refreshTx={handleRefresh} on:reorderAccount={(e) => { handleReorderAccount(e, accountList) }}/>
        {/each}
    {/if}
    {#if coinsTracked.length > 0}
        <div class="header header-accounts-tracked header-text text-body1 divider ">
            <div class="header-name header-text">
                Watched Accounts
                <div class="warning-icon" on:click={() => openModal("CoinWatchedModal")}>{@html cautionIcon}</div>
            </div>
            <div class="header-msg header-text text-accent">You do not own the private keys for these accounts</div>
        </div>	
        {#each coinsTracked as coin (coin.id) }
            <Coin {coin} {token} refreshTx={handleRefresh} on:reorderAccount={(e) => { handleReorderAccount(e, accountList) }}/>
            <CoinDivider />
        {/each}
    {/if}
</div>