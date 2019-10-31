<script>
	import { onMount } from 'svelte';
	//Stores
	import {calcRemainingStorage, 
			coinList, 
			CoinStore, 
			numberOfCoins, 
			currencyCode, 
			fiatWalletTotal, 
			MarketInfoStore } from '../../js/stores/stores.js';

	//Components
	import { Coin, Modal, Modals, CurrencyDropDown }  from '../../js/router.js'

	//Utils
	import { API, myFunc } from '../../js/api.js';
	import { updateBalances, toCurrencyFormat } from '../../js/utils.js';
	

	//Props
	export let name

	let openModal = false;
	let currentModal = '';
	let apiResult = '';

	onMount(() => {
		//CoinStore.updateBalances($CoinStore);
		calcRemainingStorage();
	});

	function checkAPI() {
		API('GET', 'status', '', {}).then(result => {apiResult = result})
	}


	function showModal(modal){
        currentModal = modal;
        openModal = true;
	}
	
	function closeModal(){
        openModal = false;
    }

</script>

<style>
</style>

<CurrencyDropDown />
<h1>{`You have ${$numberOfCoins} coins!`}</h1>

<h2> {`Total Wallet Value: ${ toCurrencyFormat( $fiatWalletTotal, $currencyCode ) }`} </h2>

<button on:click={ () => showModal('CoinAdd') }> Add Coin </button>

{#each $CoinStore as coin, id}
	<Coin {coin} />
{/each}

{#if openModal}
	<Modal on:close="{() => closeModal()}">
        <svelte:component this={ Modals[currentModal]} {closeModal} {openModal}/>
	</Modal>
{/if}
