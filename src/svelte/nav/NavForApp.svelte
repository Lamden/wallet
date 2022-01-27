<script>
    import whitelabel from '../../../whitelabel.json'

    import { getContext, onMount } from 'svelte';
    //Images
    import nav_bg from '../../img/backgrounds/nav_bg.png';

    	//Stores
	import { CoinStore,TokenStore,balanceTotal,currentNetwork,networkKey,SettingsStore } from '../../js/stores/stores.js';

    //Icons
	import RefreshIcon from '../icons/RefreshIcon.svelte'
	import PlusIcon from '../icons/PlusIcon.svelte'

	//Components
    import { NavLogo, NavControls, Components }  from '../Router.svelte'
    const { Button } = Components;

    //Context
    const { openModal } = getContext('app_functions');

    //Utils
	import { displayBalance } from '../../js/utils.js';

    $: totalBalance = $balanceTotal[networkKey($currentNetwork)] ? $balanceTotal[networkKey($currentNetwork)] : '0';

    let refreshing = false;

    const handleRefresh = () => {
		if (refreshing) return
		chrome.runtime.sendMessage({type: 'updateAccountAndTokenBalances'})
		refreshing = true
		setTimeout(() => {
			refreshing = false
		}, 2000);
	}
    
</script>

<style>
    .nav{
        display: flex;
        flex-direction: row;
        position: fixed;
        left: 0%;
        right: 0%;
        top: 0%;
        bottom: 0%;
        right: 0;
        height: 212px;
        background-color: var(--bg-primary);
        z-index: 29;
        border-bottom: 1px solid var(--divider-light);
        max-width: 1920px;
        background-repeat: no-repeat;
        background-size: 100% 200%;
        background-position: 0 10%;
        justify-content: space-between;
    }

    @media (min-width: 1920px) {
		.nav {
			margin: 0 auto;
		}
    }

    .balance-total{
        align-items: center;
        color: var(--font-overlay);
    }
    .balance-words{
        color: var(--font-overlay);
    }
    p{
        margin: 5px 0 0 0; 
    }
    .refresh-icon{
        width: 40px;
        cursor: pointer;
    }
    .details{
        margin-top: 30px;
    }
    .btns{
        margin-top: 1.25rem;
    }
    .mask{
        width: 100%;
        height: 100%;
        background: var(--bg-primary);
        opacity: 0.5;
        position: absolute;
        z-index: -1;
    }
</style>

<div class="nav text-primary" style="background-image: url({nav_bg});">
    <div class="mask"></div>
    <NavLogo style={`justify-content: flex-start; margin-top: 30px`}/>

    <div class="flex-column flex-align-center details">
        <div class="balance-words text-body1">
            {`Total ${$currentNetwork.currencySymbol} in Accounts`}
        </div>
        <div class="flex-row balance-total">
            <p class="text-huge">{`${displayBalance(totalBalance)}`}</p>
            <div on:click={handleRefresh} 
                id="refresh-icon"
                class="flex-column refresh-icon" 
                class:spinner={refreshing}>
                <RefreshIcon />
            </div>
        </div>
        <div class="btns">
            <Button
                id={'add-btn'} 
                styles={'border: none;'}
                classes={'button__outlined button__overlay'}
                name={whitelabel.mainPage.buttons.add_account.name}
                click={() => openModal('CoinAdd')}
            >
                <div slot="icon-before">
                    <PlusIcon width="15px" color="var(--color-white)" />
                </div>
            </Button> 
        </div> 
    </div>

    {#if whitelabel.nav.showNetworkBox}
        <NavControls style={`height: 80px;margin: 2rem 61px 2rem 0 `}/>
    {/if}
</div>
