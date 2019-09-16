<script>
	import { onMount } from 'svelte';
	//Stores
	import { coinList, CoinStore, allTotals } from '../../js/stores.js';

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

	function checkAPI() {
		API('GET', 'status').then(result => {apiResult = result})
	}

	function createTransaction() {
		const path = 'ETH-TESTNET/0xFa29E36A7eb4dBaE9ed93D803e5Bf95ae9772A27/0xFa29E36A7eb4dBaE9ed93D803e5Bf95ae9772A27'
		const data = {value : 0.002}
		API('POST', 'p2p-transaction', path, data)
			.then(result => {console.log(result)})
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

<h1>{`You have ${$allTotals.majorTotals.coins} coins!`}</h1>

{$allTotals.majorTotals.wallets} wallet addresses

<h2> {`Total USD Value: ${toCurrencyFormat($allTotals.majorTotals.USD_value)}`} </h2>

<button on:click={ () => showModal('CoinAdd') }> Add Coin </button>

{#each $coinList as coin, id}
	<Coin coin={coin} />
{/each}

{#if openModal}
	<Modal on:close="{() => closeModal()}">
        <svelte:component this={ Modals[currentModal]} {closeModal} {openModal}/>
	</Modal>
{/if}