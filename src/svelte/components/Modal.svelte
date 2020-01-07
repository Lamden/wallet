<script>
	import { getContext } from 'svelte';
    import { fade } from 'svelte/transition';

	//Components
    import { Components }  from '../../js/router.js'
    const { Button } = Components;

	//Context
	const { closeModal } = getContext('app_functions');

</script>

<style>
.modal-background {
	position: fixed;
	background-size: cover;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: url(./squares_bg.png);
	opacity: 0.8;
	z-index: 30;
}

.modal {
	display: flex;
	flex-direction: column;
	align-items: center;
	position: absolute;
	overflow: visible;
	left: 50%;
	/*top: calc(100vh - 45vh); */
	/*max-height: calc(100vh - 4em);*/
	transform: translate(-50%, 0px);
	padding: 30px 55px;
	margin: 90px 0;
	background: var(--bg-color);
	box-shadow: 0px 1px 48px rgba(0, 0, 0, 0.12), 0px 16px 32px rgba(0, 0, 0, 0.12), 0px 12px 24px rgba(0, 0, 0, 0.12);
	border-radius: 4px;
	z-index: 60;
}

</style>

<div in:fade="{{ duration: 200 }}" out:fade="{{ duration: 200 }}" class='modal-background' on:click={() => closeModal()}></div>
<div in:fade="{{ duration: 200 }}" out:fade="{{ duration: 200 }}" class='modal'>
	<slot></slot>
</div>

