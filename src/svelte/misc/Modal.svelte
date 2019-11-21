<script>
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

</script>

<style>
	.modal-background {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0,0,0,0.5);
	}

	.modal {
		display: grid;
		position: absolute;
		left: 50%;
		top: 50%;
		width: calc(100vw - 4em);
		max-width: 50em;
		max-height: calc(100vh - 4em);
		overflow: auto;
		transform: translate(-50%,-50%);
		padding: 1em;
		border-radius: 0.2em;
		background: var(--bg-color);
	}

	button {
		display: block;
	}
</style>

<div class='modal-background' on:click='{() => dispatch("close")}'></div>

<div class='modal'>
	<slot></slot>
	<button on:click='{() => dispatch("close")}'>close modal</button>
</div>