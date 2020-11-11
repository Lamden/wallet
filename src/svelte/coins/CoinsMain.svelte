<script>
	import whitelabel from '../../../whitelabel.json'

	import { onMount, getContext } from 'svelte';
	
	//Stores
	import { 
			CoinStore,
			balanceTotal,
			currentNetwork,
			networkKey
		} from '../../js/stores/stores.js';

	//Components
	import { Coin, CoinEmpty, CoinDivider, Modal, Modals, Components }  from '../Router.svelte'
	const { Button } = Components;

	//Images
	import hero_bg from '../../img/backgrounds/hero_bg.png';
	import plus from '../../img/menu_icons/icon_plus.svg';

	import RefreshIcon from '../icons/RefreshIcon.svelte'

	//Utils
	import { displayBalance } from '../../js/utils.js';

	//Context
    const { switchPage, openModal } = getContext('app_functions');
	
	//Props
	export let name

	$: totalBalance = $balanceTotal[networkKey($currentNetwork)] ? $balanceTotal[networkKey($currentNetwork)] : '0';

	let refreshing = false;

	onMount(() => {
		handleRefresh();
	});

	const handleRefresh = () => {
		if (refreshing) return
		chrome.runtime.sendMessage({type: 'balancesStoreUpdateAll', data: $currentNetwork.getNetworkInfo()})
		refreshing = true
		setTimeout(() => {
			refreshing = false
		}, 2000);
	}

</script>

<style>
.coinsmain{
	display: flex;
	flex-direction: column;
}

.hero-rec{
	position: relative;
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	height: 346px;
	border-radius: 4px;
	margin-bottom: 18px;
    padding: 40px;
    background-size: cover;
    background-repeat: no-repeat;
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
	height: 40px;
}

.divider{
	border-bottom: 1px solid var(--divider-light);
}

.header-text{
	display: flex;
	align-items: center;
    font-size: 14px;
    line-height: 20px;
}

.header-name{
    width: 234px;
}

.header-amount{
	padding-left: 15px;
	flex-grow: 1;
}

.header-percent{
	justify-content: flex-end;
	margin-right: 28px;  
	width: 203px;
}
.balance-total{
	align-items: center;
	color: var(--font-overlay);
}
.balance-words{
	color: var(--font-overlay);
}
p{
    margin: 0;
}
.buttons{
	align-items: flex-end;
	flex-grow: 1;
}
.logo-space{
	margin-left: 84px;
}
</style>

<div class="coinsmain text-primary">
	<div class="hero-rec" style="background-image: url({hero_bg});">
		<div class="balance-words text-body1">
			{`${$currentNetwork.currencySymbol}`}
		</div>
		<div class="flex-row balance-total">
			<p class="text-huge">{`${displayBalance(totalBalance)}`}</p>
			<div on:click={handleRefresh} 
				id="refresh-icon"
				class="flex-col refresh-icon" 
				class:spinner={refreshing}>
				<RefreshIcon />
			</div>

		</div>
		<div class="flex-row buttons">
			{#if whitelabel.mainPage.buttons.add_account.show}
				<Button id={'add-btn'}
					classes={'button__transparent button__overlay'}
					name={whitelabel.mainPage.buttons.add_account.name}
					width={'155px'}
					margin={'0 20px 0 0'}
					click={() => openModal('CoinAdd')} 
					icon={plus}
					iconWidth={'19px'}
				/>
			{/if}
		</div>

	</div>
	{#if $currentNetwork}
		{#if $CoinStore.length === 0}
			<CoinEmpty />
		{:else}
			<div class="header header-text divider">
				{#if whitelabel.mainPage.account_info.show}
					<div class:logo-space={whitelabel.mainPage.logo.show} class="header-name header-text">{whitelabel.mainPage.account_info.title}</div>
				{/if}
				{#if whitelabel.mainPage.amount.show}
					<div class="header-amount header-text">{whitelabel.mainPage.amount.title}</div>
				{/if}
				{#if whitelabel.mainPage.portfolio.show}
					<div class="header-percent header-text">{whitelabel.mainPage.portfolio.title}</div>
				{/if}
			</div>
			{#each $CoinStore as coin, id}
				<Coin {coin} {id} />
				<CoinDivider />
			{/each}
		{/if}
	{/if}
</div>