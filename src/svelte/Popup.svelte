<script>
    import { onMount} from 'svelte';

	onMount(() => {
		chrome.tabs.query({}, function(tabs) {
			let foundTab = tabs.find((tab) => {
				if (typeof tab.url !== 'undefined') return tab.url.includes(chrome.runtime.id)
				else return false
			});
			if (!foundTab) {
				chrome.tabs.create({ url: '/app.html' });
			}else{
				chrome.tabs.update(foundTab.id, {selected: true});
				window.close();
			}
		});
	});
</script>