<script>
	export let iconValue = "default";
	export let width = "20px"
	export let margin = '0 10px';

	let showIcons = false
	
	function jdenticonLoaded(){
		showIcons = true
	}
</script>

<svelte:head>
	<script src="./jdenticon.min.js" async on:load={jdenticonLoaded}></script>
</svelte:head>

{#if showIcons}
	<svg style={`margin: ${margin};`} data-jdenticon-value={iconValue} width={width} />
{/if}