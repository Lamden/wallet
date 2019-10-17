<script>
	import { onMount } from 'svelte';
	//Stores
	import { calcRemainingStorage, coinList, CoinStore, allTotals } from '../../js/stores.js';

	//Components
	import { Coin, Modal, Modals }  from '../../js/router.js'

	//Utils
	import { API } from '../../js/api.js';
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
		API('GET', 'status').then(result => {apiResult = result})
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

<h1>{`You have ${$allTotals.coins} coins!`}</h1>

<h2> {`Total USD Value: ${toCurrencyFormat($allTotals.USD_value)}`} </h2>

<button on:click={ () => showModal('CoinAdd') }> Add Coin </button>

{#each $CoinStore as coin, id}
	<Coin {coin} />
{/each}

{#if openModal}
	<Modal on:close="{() => closeModal()}">
        <svelte:component this={ Modals[currentModal]} {closeModal} {openModal}/>
	</Modal>
{/if}