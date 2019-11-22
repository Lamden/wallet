<script>
	import { onMount } from 'svelte';
	//Stores
	import {calcRemainingStorage, 
			coinList, 
			CoinStore, 
			numberOfCoins } from '../../js/stores/stores.js';

	//Components
	import { Coin, Modal, Modals }  from '../../js/router.js'
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
	background-image: url('./sqares_bg.svg');
	height: 430px;
	border-radius: 4px;
}
</style>

<div class="coinsmain">
	<div class="hero-rec">
	</div>
</div>


<button on:click={ () => showModal('CoinAdd') }> Add Coin </button>

{#each $CoinStore as coin, id}
	<Coin {coin} />
{/each}

{#if openModal}
	<Modal on:close="{() => closeModal()}">
        <svelte:component this={ Modals[currentModal]} {closeModal} {openModal}/>
	</Modal>
{/if}
