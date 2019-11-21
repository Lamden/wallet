<script>
	import { onMount } from 'svelte';
	//Stores
	import {calcRemainingStorage, 
			coinList, 
			CoinStore, 
			numberOfCoins } from '../../js/stores/stores.js';

	//Components
	import { Coin, Modal, Modals }  from '../../js/router.js'

	//Utils
	import { updateBalances } from '../../js/utils.js';
	
	//Props
	export let name

	let openModal = false;
	let currentModal = '';

	onMount(() => {
		//CoinStore.updateBalances($CoinStore);
		calcRemainingStorage();
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
</style>

<h1>{`You have ${$numberOfCoins} coins!`}</h1>

<button on:click={ () => showModal('CoinAdd') }> Add Coin </button>

{#each $CoinStore as coin, id}
	<Coin {coin} />
{/each}

{#if openModal}
	<Modal on:close="{() => closeModal()}">
        <svelte:component this={ Modals[currentModal]} {closeModal} {openModal}/>
	</Modal>
{/if}
