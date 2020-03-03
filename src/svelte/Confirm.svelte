<script>
	import { onMount, setContext } from 'svelte';
	import { themes } from '../js/themes.js'

    //Images
    import lamden_logo from '../img/nav/lamden_logo_new.svg';
    import lamden_words from '../img/nav/lamden_words.svg';

	//Components
	import ApproveConnection from './confirms/ApproveConnection.svelte'
	import ApproveTransaction from './confirms/ApproveTransaction.svelte'
	
	setContext('confirm_functions', {
		approve: () => sendApprove(),
		close:() => closePopup()
	});

	const componentMap = {
		ApproveConnection, 
		ApproveTransaction
	}
	let confirmData;

	onMount(() => {
		chrome.runtime.sendMessage({type: 'getConfirmInfo'}, (response) => {
			console.log(response)
			if (response) confirmData = response
		})
		document.querySelector("html").style = themes['dark'];
	});

	function sendApprove(){
		chrome.runtime.sendMessage({type: 'approveConfirm'})
		closePopup()
	}

	function closePopup(){
		window.close();
	}
</script>

<style>
	:global(body){
		color: var(--font-primary);
		background-color: var(--bg-color);
	}

	:global(h1){
		font-style: normal;
		font-weight: normal;
		font-size: 24px;
		line-height: 28px;
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
<div class="flex-column container">
	<div class="box flex-row">
		<div class="logo" >{@html lamden_logo}</div>
		<div class="words">{@html lamden_words}</div>
	</div>
	{#if confirmData}
		<svelte:component this={componentMap[confirmData.type]} {confirmData}/>
	{/if}
</div>

