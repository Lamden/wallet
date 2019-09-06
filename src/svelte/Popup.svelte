<script>
    import { onMount} from 'svelte';

	onMount(() => {
		console.log('mounted')
		chrome.runtime.sendMessage({type:'expand'}, () => {
			console.log('error')
        })
	});
</script>