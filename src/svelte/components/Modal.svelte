<script>
	import { getContext, onMount } from 'svelte';
    import { fade } from 'svelte/transition';

	//Components
    import { Components }  from '../Router.svelte'
    const { Button } = Components;

	//Context
	const { closeModal } = getContext('app_functions');

	let previousScrollSpot = {x: 0, y: 0};

	onMount(() => {
		previousScrollSpot.x = window.pageXOffset
		previousScrollSpot.y = window.pageYOffset
		window.scrollTo(0,0);

		return () => {
			window.scrollTo(previousScrollSpot.x, previousScrollSpot.y);
		}
	})

</script>

<style>
.modal-background {
	position: fixed;
	background-size: cover;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: url(./hero_bg.png);
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
	margin: 20px 0;
	background: var(--bg-primary);
	box-shadow: var(--box-shadow-4);
    -webkit-box-shadow: var(--box-shadow-4);
    -moz-box-shadow: var(--box-shadow-4);
	border-radius: 4px;
	z-index: 60;
}

</style>

<div in:fade="{{ duration: 200 }}" out:fade="{{ duration: 200 }}" class='modal-background' on:click={() => closeModal()}></div>
<div in:fade="{{ duration: 200 }}" out:fade="{{ duration: 200 }}" class='modal'>
	<slot></slot>
</div>

