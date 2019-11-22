<script>
	import { onMount } from 'svelte';
	//Stores
	import {calcRemainingStorage, 
			coinList, 
			CoinStore,
			numberOfCoins,
			breadcrumbs } from '../../js/stores/stores.js';

	//Components
	import { Coin, CoinDivider, Modal, Modals, Components }  from '../../js/router.js'
	const { Button } = Components;
	import { backgrounds } from '../../js/images.js';

	//Utils
	import { updateBalances } from '../../js/utils.js';
	
	//Props
	export let name

	let openModal = false;
	let currentModal = '';

	onMount(() => {
		//CoinStore.updateBalances($CoinStore);
		calcRemainingStorage();
		breadcrumbs.set([{name: 'Holdings', page: 'CoinsMain'}]);
	});


	function showModal(modal){
        currentModal = modal;
        openModal = true;
	}
	
	function closeModal(){
        openModal = false;
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
	align-items: flex-end;
	background-image: url('./sqares_bg.svg');
	height: 430px;
	border-radius: 4px;
	margin-bottom: 18px;
    padding: 40px;
    background-size: cover;
    background-repeat: no-repeat;
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
	justify-content: center;
}

.header-amount{
	flex-grow: 1;
}

.header-percent{
	justify-content: flex-end;
	margin-right: 28px;  
	width: 203px;
}
</style>

<div class="coinsmain">
	<div class="hero-rec">
		<Button name="Add Coin" click={() => showModal('CoinAdd')} icon='plus'/>
	</div>
	<div class="header header-text divider">
		<div class="header-name header-text">Name</div>
		<div class="header-amount header-text">Amount</div>
		<div class="header-percent header-text">Portfolio %</div>
	</div>
	{#each $CoinStore as coin, id}
		<Coin {coin} />
		<CoinDivider />
	{/each}
	
</div>

{#if openModal}
	<Modal on:close="{() => closeModal()}">
        <svelte:component this={ Modals[currentModal]} {closeModal} {openModal}/>
	</Modal>
{/if}
