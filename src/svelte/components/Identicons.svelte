<script>
	export let iconValue = "default";
	export let width = "20px"
	export let margin = '0 10px';

	$: value = iconValue;

</script>

<svg style={`margin: ${margin};`} data-jdenticon-value={value} width={width} />