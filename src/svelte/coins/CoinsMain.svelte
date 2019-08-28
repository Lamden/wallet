<script> 
	import { CoinStore, coinList, numberOfCoins, testCoins, totalUsdBal } from '../../js/stores.js';
	import { API } from '../../js/api.js';
	
	//Components
	import Coin from './Coin.svelte';

	export let name
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

</script>

<style>
</style>

<h1>You have {$numberOfCoins} coins!</h1>
<h2> Total USD Value: ${$totalUsdBal.toFixed(2)}</h2>
{#each $coinList as coin, id}
	<Coin coin={coin[1]} />
{/each}

