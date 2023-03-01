<script>
	import { getContext } from "svelte";

	//Images
	import logo_full from "../../img/logo_full.svg";

	//Context
	const { switchPage, firstRun } = getContext("app_functions");

	export let style = "fill: var(--font-primary)";

	$: clickable = !firstRun();

	const goHome = () => {
		if (clickable) switchPage("CoinsMain");
	};
</script>

<div class="box" {style}>
	<div class="brand" class:clickable on:click={() => goHome()}>
		<div class="logo">{@html logo_full}</div>
	</div>
</div>

<style>
	.box {
		position: relative;
		width: max-content;
	}

	.brand {
		position: absolute;
		top: 15px;
		left: 15px;
		align-items: center;
		width: max-content;
	}

	.logo {
		width: 240px;
		margin: 0 auto;
	}

	@media (max-width: 830px) {
		.box {
			width: 100%;
		}
		.logo {
			margin: 0;
		}
	}
</style>
