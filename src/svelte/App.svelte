<script>
	import whitelabel from '../../whitelabel.json'
	import { onMount, onDestroy, setContext, beforeUpdate } from 'svelte';
	import { fade } from 'svelte/transition';

	//Utils
	import { keysFromNew, pubFromPriv } from '../js/crypto/wallets.js';
		
	//Stores
	import { SettingsStore, currentPage, clicked, currentThemeName } from '../js/stores/stores.js';

	//Components
	import { Pages, FirstRun, Nav, Menu, Components, Modals }  from './Router.svelte'
	const { Modal, Loading } = Components;

	//Images
	import heart from '../img/menu_icons/icon_heart.svg';

	export let loaded;
	export let refreshed;

	let showModal = false;
	let currentModal;
	let modalData;
	const fullPage = ['RestoreMain', 'BackupMain', 'FirstRunRestoreMain', 'FirstRunMain', 'SwapsMain', 'ContinueSwap']
	const redirect = {
		'ContinueSwap': 'Swaps',
		'SwapsMain': 'Swaps',
		'BackupMain': 'Backup',
		'RestoreMain': 'Restore',
		'FirstRunRestoreMain': 'FirstRunMain'
	}

	$: walletIsLocked = true;
	$: firstRun = undefined;

	const walletIsLockedListener = (message, sender, sendResponse) => {
		if (message.type === 'walletIsLocked') {
			//Make sure the wallet was actually unlocked by the user
			chrome.runtime.sendMessage({type: 'walletIsLocked'}, (locked) => {
				walletIsLocked = locked;
			})
		}
	}

	chrome.runtime.onMessage.addListener(walletIsLockedListener)

	onMount(() => {
		chrome.runtime.sendMessage({type: 'walletIsLocked'}, (locked) => {
			walletIsLocked = locked;
		})
		checkFirstRun();
	});

	beforeUpdate(() => {
		if (SettingsStore.initialized() && refreshed){
			if (typeof redirect[$currentPage.name] !== 'undefined' && refreshed) {
				switchPage(redirect[$currentPage.name])
			}
			refreshed = false;
		}
	})

	onDestroy(() =>{
        chrome.runtime.onMessage.removeListener(walletIsLockedListener)
    })

	setContext('app_functions', {
		switchPage: (name, data) => switchPage(name, data),
		openModal: (modal, data) => openModal(modal, data),
		getModalData: () => {return modalData},
		closeModal: () => showModal = false,
		firstRun: () => firstRun ? true : false,
		appHome: () => switchPage('CoinsMain'),
		checkFirstRun: () => checkFirstRun(),
		themeToggle: themeToggle
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

	function themeToggle() {
		let body = document.getElementById("theme-toggle")
		let lighttheme = getThemeSetting()
		if (!lighttheme) {
			body.classList.add("light");
			currentThemeName.set('light')  
		}
		else {
			body.classList.remove("light");
			currentThemeName.set('dark')
		}
		localStorage.setItem("lighttheme", !lighttheme)
	}

	function themeSet() {
		let body = document.getElementById("theme-toggle")
		let lighttheme = getThemeSetting()
		if (lighttheme) {
			body.classList.add("light");
			currentThemeName.set('light')
		}else currentThemeName.set('dark')
	}

	function getThemeSetting() {
		return JSON.parse(localStorage.getItem("lighttheme"))
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
							<div class="components" in:fade="{{delay: 0, duration: 500}}">
								<svelte:component this={Pages[$currentPage.name]}/>
							</div>
							{#if whitelabel.footer.show}
								<div class="footer-box">
									{#if whitelabel.footer.text === "lamden_default"}
										{'Made with'}
										<div class="heart">{@html heart}</div>
										{'by Lamden'}
									{:else}
										{whitelabel.footer.text}
									{/if}
								</div>
							{/if}
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
		<Loading message={`Loading ${whitelabel.companyName} Wallet`} />
	{/if}
</div>
<svelte:window on:click={(e) => clicked.set(e.target)} />


<style>
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
		width: 83px;
		min-width: 83px;
		z-index: 29;
	}

	.content-pane{
		padding: 21px 61px 0;
		flex-grow: 1;
		box-sizing: border-box;
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
		margin: 0 4px;
		position: relative;
		width: 13px;
		top: 1px;
	}

	@media (min-width: 900px) {
		.menu-pane{
			width: 280px;
			min-width: 280px;
		}
	}
</style>
