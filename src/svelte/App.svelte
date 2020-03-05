<script>
	import { onMount, setContext } from 'svelte';
	import { themes } from '../js/themes.js'

	//Utils
	import { keysFromNew, pubFromPriv } from '../js/crypto/wallets.js';
		
	//Stores
	import {
			CoinStore,
			SettingsStore, 
			currentPage, 
			themeStyle, 
			password} from '../js/stores/stores.js';

	//Components
	import { Pages, FirstRun, Nav, Menu, Components, Modals }  from './Router.svelte'
	const { Modal, Loading } = Components;

	//Images
	import heart from '../img/menu_icons/icon_heart.svg';

	export let loaded;

	let showModal = false;
	let currentModal;
	let modalData;
	const fullPage = ['RestoreMain', 'BackupMain', 'FirstRunRestoreMain', 'FirstRunMain']

	$: walletIsLocked = true;
	$: firstRun = undefined;

	chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
		if (message.type === 'walletIsLocked') walletIsLocked = message.data;
	})

	onMount(() => {
		chrome.runtime.sendMessage({type: 'walletIsLocked'}, (locked) => {
			walletIsLocked = locked;
		})

		checkFirstRun();
		document.querySelector("html").style = themes[$themeStyle];
	});

	setContext('app_functions', {
		switchPage: (name, data) => switchPage(name, data),
		openModal: (modal, data) => openModal(modal, data),
		getModalData: () => {return modalData},
		closeModal: () => showModal = false,
		firstRun: () => firstRun ? true : false,
		appHome: () => switchPage('CoinsMain'),
		checkFirstRun: () => checkFirstRun()
	});

	const checkFirstRun = () => {
		chrome.runtime.sendMessage({type: 'isFirstRun'}, (isFirstRun) => {
			firstRun = isFirstRun;
			if (!firstRun && $currentPage.name === 'FirstRunMain'){
				SettingsStore.changePage({name: 'CoinsMain'})
			}
			firstRun ? SettingsStore.changePage({name: 'FirstRunMain'}) : null;
		})
	}

	const switchPage = (name, data) => {
		showModal = false;
		SettingsStore.changePage({name, data});
	}

	const getUsedLocalStorageSpace = () => {
  		return Object.keys(window.localStorage).map(function(key) { return localStorage[key].length;}).reduce(function(a,b) { return a+b;});
	};

	const openModal = (modal, data) => {
		currentModal = modal;
		modalData = data;
        showModal = true;
	}

	const closeModal = () => {
		showModal = false;
	}

</script>

<div class="container">
	{#if $loaded && typeof firstRun !== 'undefined'}
		{#if firstRun}
			<svelte:component this={Pages[$currentPage.name]}/>
		{:else}
			{#if !walletIsLocked}
				{#if fullPage.includes($currentPage.name)}
					<svelte:component this={Pages[$currentPage.name]}/>
				{:else}
					<Nav />
					<div class="main-layout">
						<div class="menu-pane">
							<Menu />
						</div>
						<div class="content-pane flex-column">
							<div class="components">
								<svelte:component this={Pages[$currentPage.name]}/>
							</div>
							<div class="footer-box">
								{'Made with'}
								<div class="heart">{@html heart}</div>
								{'by Lamden'}
							</div>
						</div>

						{#if showModal}
							<Modal>
								<svelte:component this={Modals[currentModal]} {modalData} {closeModal}/>
							</Modal>
						{/if}
					</div>
				{/if}
			{/if}
			{#if walletIsLocked}
				<svelte:component this={Pages['LockScreen']} {loaded}/>
			{/if}
		{/if}
	{:else}
		<Loading message="Loading Lamden Wallet" />
	{/if}
</div>


<style>
	:global(h1){
		font-style: normal;
		font-weight: normal;
		font-size: 24px;
		line-height: 28px;
	}

	:global(h2){
		font-style: normal;
		font-weight: normal;
		font-size: 16px;
		line-height: 24px;
	}

	:global(h3){
		font-style: normal;
		font-weight: normal;
		font-size: 13px;
		line-height: 10px;
	}

	:global(h4){
		font-style: normal;
		font-weight: normal;
		font-size: 20px;
		line-height: 20px;
		letter-spacing: 0.44px;
	}

	:global(h5){
		font-style: normal;
		font-weight: normal;
		font-size: 24px;
		line-height: 28px;
		margin: 10px 0;
	}

	:global(h6){
		font-style: normal;
		font-weight: 500;
		font-size: 20px;
		line-height: 28px;
		letter-spacing: 0.15px;
		margin: 16px 0;
	}

	:global(body){
		color: var(--font-primary);
		background-color: var(--bg-color);
	}

	.container {
		display:flex;
		padding-top: 97px;
		flex-grow: 1;
	}

	.main-layout{
		display: flex;
		flex-direction: row;
		justify-content: left;
		flex-grow: 1;
	}

	.menu-pane{
		min-width: 280px;
	}

	.content-pane{
		padding: 21px 61px 0;
		flex-grow: 1;
	}
	.components{
		flex-grow: 1;
	}

	.footer-box{
		display: flex;
		flex-direction: row;
		justify-content: center;
		min-height: 70px;
		align-items: flex-start;
		margin-top: 20px;
	}

	.heart{
		margin: 0 2px;
		position: relative;
		width: 13px;
		top: 1px;
	}
</style>
