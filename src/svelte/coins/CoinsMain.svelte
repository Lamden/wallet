<script>
	import { onMount, getContext } from 'svelte';

	//Stores
	import {SettingsStore, 
			coinList, 
			CoinStore,
			balanceTotal,
			numberOfCoins,
			breadcrumbs,
			password,
			currentNetwork,
			NetworksStore, needsBackup } from '../../js/stores/stores.js';

	//Components
	import { Coin, CoinEmpty, CoinDivider, Modal, Modals, Components }  from '../Router.svelte'
	const { Button } = Components;

	//Images
	import squares_bg from '../../img/backgrounds/squares_bg.png';
	import refresh from '../../img/menu_icons/icon_refresh.svg';
	import plus from '../../img/menu_icons/icon_plus.svg';

	//Utils
	import { updateBalances, decryptObject } from '../../js/utils.js';

	//Context
    const { switchPage, openModal } = getContext('app_functions');
	
	//Props
	export let name

	let totalBalance = $balanceTotal[$currentNetwork.url] ? $balanceTotal[$currentNetwork.url] : 0;

	let refreshing = false;

	onMount(async () => {
		breadcrumbs.set([{name: 'Holdings', page: {name: ''}}]);
		console.log(await $currentNetwork.API.getTauBalance('270add00fc708791c97aeb5255107c770434bd2ab71c2e103fbee75e202aa15e'))
	});

	function handleRefresh(){
		chrome.runtime.sendMessage({type: 'coinStoreUpdateAllBalances', data: $currentNetwork.getNetworkInfo()})
		refreshing = true
		setTimeout(() => {
			refreshing = false
		}, 1000);
	}

</script>

<style>
.coinsmain{
	display: flex;
	flex-direction: column;
}

.hero-rec{
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	height: 430px;
	border-radius: 4px;
	margin-bottom: 18px;
    padding: 40px;
    background-size: cover;
    background-repeat: no-repeat;
}

.refresh-icon{
	margin-left: 10px;
	width: 40px;
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
.buttons{
	flex-grow: 1;
    display: flex;
    justify-content: flex-end;
    flex-direction: column;
}
.balance-words{
	padding-left: 42px;
	margin: 14px 0;
}
.balance-total{
	padding-left: 42px;
	align-items: center;
}

.spinner{
	animation: rotation 2s infinite linear;
}

@keyframes rotation {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(359deg);
  }
}

</style>

<div class="coinsmain text-primary">
	<div class="hero-rec" style="background-image: url({squares_bg});">
		<div class="balance-words text-body3">
			{`TAU`}
		</div>
		<div class="flex-row balance-total text-title">
			{`${totalBalance.toLocaleString('en')}`}
			<div on:click={handleRefresh} 
				 class="refresh-icon clickable" 
				 class:spinner={refreshing}>
				 {@html refresh} 
			</div>
		</div>
		<div class="buttons">
			<Button id={'add-btn'}
				classes={'button__transparent button__blue'}
				name="Add Wallet"
				width={'155px'}
		 		click={() => openModal('CoinAdd')} 
				icon={plus}/>
		</div>
	</div>
	<div class="header header-text divider">
		<div class="header-name header-text">Name</div>
		<div class="header-amount header-text">Amount</div>
		<div class="header-percent header-text">Portfolio %</div>
	</div>
	{#if $currentNetwork}
		{#if $CoinStore.length === 0}
			<CoinEmpty />
		{:else}
			{#each $CoinStore as coin, id}
				<Coin {coin} {id} />
				<CoinDivider />
			{/each}
		{/if}
	{/if}
</div>