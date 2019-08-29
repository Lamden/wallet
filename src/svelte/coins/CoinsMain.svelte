<script>
	//Stores
	import { CoinStore, coinList, coinTotals, testCoins } from '../../js/stores.js';

	//Components
	import { Coin, Modal, Modals }  from '../../js/router.js'

	//Utils
	import { API } from '../../js/api.js';

	//Props
	export let name

	let openModal = false;
	let currentModal = '';
	let apiResult = ''

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

</script>

<style>
</style>

<h1>You have {$coinTotals.coins} coins!</h1>
{$coinTotals.wallets} wallet addresses
<h2> Total USD Value: {$coinTotals.USD_value}</h2>
<button on:click={ () => showModal('CoinAdd') }> Add Coin </button>
{#each $coinList as coin, id}
	<Coin coin={coin[1]} />
{/each}

{#if openModal}
	<Modal on:close="{() => openModal = false}">
        <svelte:component this={ Modals[currentModal] }/>
	</Modal>
{/if}

