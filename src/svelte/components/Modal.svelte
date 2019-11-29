<script>
	import { getContext } from 'svelte';

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
		position: absolute;
		left: 50%;
		top: 50%;
		width: calc(100vw - 4em);
		max-width: 50em;
		max-height: calc(100vh - 4em);
		overflow: auto;
		transform: translate(-50%,-50%);
		padding: 33px 55px;
		background: var(--bg-color);
		box-shadow: 0px 1px 48px rgba(0, 0, 0, 0.12), 0px 16px 32px rgba(0, 0, 0, 0.12), 0px 12px 24px rgba(0, 0, 0, 0.12);
		border-radius: 4px;
	}

	button {
		display: block;
	}
</style>

<div class='modal-background' on:click={() => closeModal()}></div>

<div class='modal' style="overflow: visible;">
	<slot></slot>
	<button on:click={() => closeModal()}>close modal</button>
</div>