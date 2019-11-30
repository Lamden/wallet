<script>
	import { getContext } from 'svelte';

	//Components
    import { Components }  from '../../js/router.js'
    const { Button } = Components;

	//Context
	const { closeModal } = getContext('app_functions');

</script>

<style>
	.modal-background {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: url(./squares_bg.png);
    	opacity: 0.8;
	}

	.modal {
		display: flex;
		flex-direction: column;
		align-items: center;
		position: absolute;
		overflow: visible;
		left: 50%;
		top: 50%;
		width: calc(100vw - 4em);
		max-width: 50em;
		max-height: calc(100vh - 4em);
		transform: translate(-50%,-50%);
		padding: 30px 55px;
		background: var(--bg-color);
		box-shadow: 0px 1px 48px rgba(0, 0, 0, 0.12), 0px 16px 32px rgba(0, 0, 0, 0.12), 0px 12px 24px rgba(0, 0, 0, 0.12);
		border-radius: 4px;
	}

</style>

<div class='modal-background' on:click={() => closeModal()}></div>

<div class='modal'>
	<slot></slot>
</div>