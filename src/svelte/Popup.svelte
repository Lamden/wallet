<script>
    import { onMount} from 'svelte';

	onMount(() => {
		chrome.runtime.sendMessage({type:'expand'}, () => {
			console.log('error')
        })
	});
</script>