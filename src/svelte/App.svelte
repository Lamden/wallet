<script>
	import { onMount, setContext } from 'svelte';
	import { themes } from '../js/themes.js'

	//Utils
	import { keysFromNew, pubFromPriv } from '../js/crypto/wallets.js';
		
	//Stores
	import {CoinStore,
			symbolList,
			SettingsStore, 
			HashStore,
			currentPage, 
			themeStyle, 
			loggedIn, 
			firstRun, 
			calcRemainingStorage,
			breadcrumbs} from '../js/stores/stores.js';

	//Components
	import { Pages, FirstRun, Nav, Menu }  from '../js/router.js'	

	onMount(() => {
		CoinStore.useLocalStorage();
		SettingsStore.useLocalStorage();
		$breadcrumbs = [$currentPage.name, "CoinDetails"];
		HashStore.useLocalStorage();
		calcRemainingStorage();
		document.querySelector("html").style = themes[$themeStyle];
		$firstRun ? $SettingsStore.currentPage = { name: 'FirstRunIntro', data: {} } : null;
	});

	setContext('switchPage', {
		switchPage: (name, data) => switchPage(name, data),
	});

	function switchPage(name, data) {
		console.log($currentPage)
		console.log(name)
		data = data || {};
		$SettingsStore.currentPage = {name, data};
		console.log($currentPage)
	}

	function showKeys(){
		const key = pubFromPriv('lamden', 'TAU', "")
		console.log(key)
	}

	function toggleTheme() {
		$SettingsStore.themeStyle = $SettingsStore.themeStyle === 'dark' ? 'light' : 'dark';
		document.querySelector("html").style = themes[$themeStyle];
	}

	function logout() {
        loggedIn.set(false);
	}
	function getUsedLocalStorageSpace() {
  		return Object.keys(window.localStorage).map(function(key) { return localStorage[key].length;}).reduce(function(a,b) { return a+b;});
	};

</script>

<div class="container">
	<Nav />
	<div class="main-layout">
		<div class="menu-pane">
			<Menu />
		</div>
		<div class="content-pane">
			<svelte:component this={Pages[$currentPage.name]} {switchPage}}/>
		</div>			
	</div>

	<!--
	<nav>
		<div class="soflexy">
			<button on:click={ () => switchPage('CoinsMain') }> CoinsMain </button>
			<button on:click={ () => switchPage('BackupMain') }> Backup </button>
			<button on:click={ () => switchPage('RestoreMain') }> Restore </button>
			<button on:click={ () => logout() }> Log Out </button>
		</div>
		<div class='controls soflexy'>
			<button on:click={ () => toggleTheme() }> Toggle Theme </button>
			<button on:click={() =>  CoinStore.reset() }> Reset Coins </button>
			<button on:click={() => CoinStore.updateBalances($CoinStore)}> Refresh Balances </button>
			<button on:click={() => showKeys() }> Lamden Keys </button>
		</div>
	</nav>
	-->
</div>

<style>
	:global(h1){
		color: var(--font-color);
		font-weight: normal;
		font-size: 24px;
		line-height: 28px;
	}

	:global(h2){
		color: var(--font-color);
		font-weight: normal;
		font-size: 16px;
		line-height: 24px;
	}

	:global(h3){
		color: var(--font-color);
		font-weight: 400;
		font-size: 13px;
		line-height: 10px;
	}

	:global(body){
		color: var(--font-color);
		background-color: var(--bg-color);
	}

	.container {
		display:flex;
		padding-top: 97px;
	}

	.main-layout{
		display: flex;
		flex-direction: row;
		justify-content: left;
	}

	.menu-pane{
		min-width: 346px;
	}

	.content-pane{
		width: 100%;
	}
</style>
