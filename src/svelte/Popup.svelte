<script>
	import { onMount } from 'svelte';
	import { CoinStore, SettingsStore, currentPage, themeStyle, loggedIn } from '../js/stores.js';
	import { themes } from '../js/themes.js'

	//Components
	import { Components }  from '../js/router.js'	

	CoinStore.useLocalStorage();
	SettingsStore.useLocalStorage();


	onMount(() => {
		document.querySelector("html").style = themes[$themeStyle];

		  addEventListener("unload", function (event) {
    		alert('unloaded')
  		}, true);
	});
	
	function expand() {
		chrome.runtime.sendMessage({type:'expand'}, () => {
			console.log('error')
		})
	}

	function switchPage(page, data) {
		data = data || {}
		let newStore = $SettingsStore;
		newStore.currentPage.name = page;
		newStore.currentPage.data = data;
		SettingsStore.set(newStore);
	}

	function toggleTheme() {
		let newStore = $SettingsStore;
		newStore.themeStyle = $SettingsStore.themeStyle === 'dark' ? 'light' : 'dark';
		SettingsStore.set(newStore);
		document.querySelector("html").style = themes[$themeStyle];
	}

	function logout() {
        loggedIn.set(false);
	}

</script>

<div class="container">
	{#if !$loggedIn}
		<section class="invisible-scrollbar lockscreen">
			<svelte:component this={Components['LockScreen']}/>
		</section>	
	{/if}

	{#if $loggedIn}
		<nav>
			<div class="soflexy">
				<button on:click={ () => switchPage('CoinsMain') }> CoinsMain </button>
				<button on:click={ () => switchPage('SwapsMain') }> SwapsMain </button>
				<button on:click={ () => logout() }> Log Out </button>
			</div>
			<div class='controls soflexy'>
				<button on:click={ () => toggleTheme() }> Toggle Theme </button>
				<button on:click={ CoinStore.reset }> Reset Coins </button>
				<button on:click={ () => expand() }> Expand </button>
			</div>		
			
		</nav>

		<section class="invisible-scrollbar content">
			<svelte:component this={Components[$currentPage.name]} {switchPage}}/>
		</section>
	{/if}
</div>

<style>
	:global(h1){
		color: var(--primary-color);
	}

	:global(h2){
		color: var(--secondary-color);
	}

	:global(body){
		color: var(--font-color);
		background-color: var(--bg-color);
	}

	nav{
		background-color: var(--heading-color);
    	padding: 10px;
	}

	.controls{
		padding: 0 20px 0 20px;
	}

	.soflexy{
		display: grid;
    	grid-auto-flow: column;
	}

	.container {    
		display: flex;
  		flex: 1 1 auto;
  		flex-direction: column;
	}

	section {
    	display: flex;
    	flex: 1 1 auto;
	}

	section.lockscreen{
		justify-content: center;
		align-items: center;
	}

	section.content {
		justify-content: start;
		flex-direction: column;
	}



</style>