<script>
	import { onMount, getContext } from 'svelte';

	//Stores
	import { 
			CoinStore,
			balanceTotal,
			breadcrumbs,
			currentNetwork,
			networkKey
		} from '../../js/stores/stores.js';

	//Components
	import { Coin, CoinEmpty, CoinDivider, Modal, Modals, Components }  from '../Router.svelte'
	const { Button } = Components;

	//Images
	import squares_bg from '../../img/backgrounds/squares_bg.png';
	import refresh from '../../img/menu_icons/icon_refresh.svg';
	import plus from '../../img/menu_icons/icon_plus.svg';


	//Utils
	import { decryptObject } from '../../js/utils.js';

	//Context
    const { switchPage, openModal } = getContext('app_functions');
	
	//Props
	export let name

	$: totalBalance = $balanceTotal[networkKey($currentNetwork)] ? $balanceTotal[networkKey($currentNetwork)] : 0;

	let refreshing = false;

	onMount(async () => {
		breadcrumbs.set([{name: 'Accounts', page: {name: ''}}]);
		handleRefresh();
		console.log($currentNetwork)
	});

	const handleRefresh = () => {
		chrome.runtime.sendMessage({type: 'balancesStoreUpdateAll', data: $currentNetwork.getNetworkInfo()})
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
	height: 417px;
	border-radius: 4px;
	margin-bottom: 18px;
    padding: 40px;
    background-size: cover;
    background-repeat: no-repeat;
}

.refresh-icon{
	margin-left: 10px;
    width: 40px;
    justify-content: center;
    height: 70px;
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
.balance-words{
	padding-left: 42px;
	margin: 14px 0;
	
}
.balance-total{
	padding-left: 42px;
	align-items: flex-start;
	flex-grow: 1;
}

.spinner{
	animation: rotation 4s infinite linear;
}

@keyframes rotation {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(-720deg);
  }
}

</style>

<div class="coinsmain text-primary">
	<div class="hero-rec" style="background-image: url({squares_bg});">
		<div class="balance-words text-body3">
			{`${$currentNetwork.currencySymbol}`}
		</div>
		<div class="balance-total">
			<div class="flex-row  text-title">
				{`${totalBalance.toLocaleString('en')}`}
				<div on:click={handleRefresh} 
					id="refresh-icon"
					class="flex-col refresh-icon clickable" 
					class:spinner={refreshing}>
					{@html refresh} 
				</div>
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