<script>
	import { onMount, onDestroy, setContext } from 'svelte';

    //Images
    import lamden_logo from '../img/nav/lamden_logo_new.svg';
    import lamden_words from '../img/nav/lamden_words.svg';

	//Components
	import ApproveConnection from './confirms/ApproveConnection.svelte'
	import ApproveTransaction from './confirms/ApproveTransaction.svelte'
	import CurrencyApproval from './confirms/CurrencyApproval.svelte'
	
	setContext('confirm_functions', {
		approveApp: () => sendApproveApp(),
		setTrusted: (trusted) => trustedApp = trusted,
		setFunding: (funding) => setFundingInfo(funding),
		approveTx: () => sendApprovetx(),
		close:() => closePopup(),
		openNewTab: (url) => openNewTab(url),
		logoFormat: (logo) => fixLogo(logo) 
	});

	const componentMap = {
		ApproveConnection, 
		ApproveTransaction,
		CurrencyApproval
	}
	let confirmData;
	
	let confirmed = false;
	let trustedApp = false;
	let fundingInfo = false;

	onMount(() => {		
		chrome.runtime.sendMessage({type: 'getConfirmInfo'}, (response) => {
			if (response) confirmData = response
		})

		return () => {
			window.removeEventListener("beforeunload", sendRejection);
		}
	});

	const confirm = () => confirmed = true;

	const setFundingInfo = (funding) => {
		fundingInfo = funding
	}

	const sendApproveApp = () => {
		confirm();
		chrome.runtime.sendMessage({type: 'approveDapp', data: {trustedApp, fundingInfo}})
		closePopup()
	}

	const sendApprovetx = () => {
		confirm();
		chrome.runtime.sendMessage({type: 'approveTransaction'})
		closePopup()
	}

	const closePopup = () => {
		window.close();
	}

	const openNewTab = (url) => {
		window.open(url, '_blank');
	}

	const sendRejection = () => {
		if (!confirmed) chrome.runtime.sendMessage({type: 'denyPopup', data: confirmData.type})
	}

	const fixLogo = (logo) => logo.substring(0, 1) === '/' ? logo.substring(1, logo.length) : logo

	window.addEventListener("beforeunload", sendRejection);
</script>

<style>
	:global(h2){
		margin-bottom: 1rem;
		text-align: center;
	}

	:global(.dapp-name){
    	margin-bottom: 0.25rem;
		align-items: center;
		
	}

	:global(.dapp-name-text){
		font-size: 23px;
	}

	.container{
		width: -webkit-fill-available;
	}

	.box{
		width: 100%;
		height: 80px;
		align-items: center;
		border-bottom: 1px solid gray;
	}

	.logo {
		width: 32px;
		margin-right: 15.5px;
		margin-left: 20px;
	}

	.words {
		width: 90px;
	}
</style>

{#if confirmData}
	<div class="flex-column container">
		<div class="box flex-row">
			<div class="logo" >{@html lamden_logo}</div>
			<div class="words">{@html lamden_words}</div>
		</div>
		<svelte:component this={componentMap[confirmData.type]} {confirmData}/>
	</div>
{/if}
