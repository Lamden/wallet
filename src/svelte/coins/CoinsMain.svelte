<script>
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
	const { Button, Countdown } = Components;

	//Images
	import squares_bg from '../../img/backgrounds/squares_bg.png';
	import refresh from '../../img/menu_icons/icon_refresh.svg';
	import plus from '../../img/menu_icons/icon_plus.svg';

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
	border-bottom: 1px solid rgba(224, 224, 224, 0.16);
}

.header-text{
	display: flex;
	align-items: center;
    font-size: 14px;
    line-height: 20px;
}

.header-name{
    width: 234px;
    margin-left: 84px;
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
}
p{
    margin: 0;
}
.buttons{
	align-items: flex-end;
	flex-grow: 1;
}
</style>

<div class="coinsmain text-primary">
	<div class="hero-rec" style="background-image: url({squares_bg});">
		<Countdown />
		<div class="balance-words text-body1">
			{`${$currentNetwork.currencySymbol}`}
		</div>
		<div class="flex-row balance-total">
			<p class="text-huge">{`${displayBalance(totalBalance)}`}</p>
			<div on:click={handleRefresh} 
				id="refresh-icon"
				class="flex-col refresh-icon" 
				class:spinner={refreshing}>
				{@html refresh} 
			</div>

		</div>
		<div class="flex-row buttons">
			<Button id={'add-btn'}
				classes={'button__transparent button__blue'}
				name="Add Account"
				width={'155px'}
				margin={'0 20px 0 0'}
		 		click={() => openModal('CoinAdd')} 
				icon={plus}
				iconWidth={'19px'}
			/>
		</div>

	</div>
	{#if $currentNetwork}
		{#if $CoinStore.length === 0}
			<CoinEmpty />
		{:else}
			<div class="header header-text divider">
				<div class="header-name header-text">Account Name</div>
				<div class="header-amount header-text">Amount</div>
				<div class="header-percent header-text">Portfolio %</div>
			</div>
			{#each $CoinStore as coin, id}
				<Coin {coin} {id} />
				<CoinDivider />
			{/each}
		{/if}
	{/if}
</div>