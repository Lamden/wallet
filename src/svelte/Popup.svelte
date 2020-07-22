<script>
    import { onMount} from 'svelte';

	onMount(() => {
		chrome.tabs.query({}, function(tabs) {
			const foundTab = tabs.find((tab) => {
				if (typeof tab.url !== 'undefined') return tab.url.includes(`chrome-extension://${chrome.runtime.id}/app.html`)
				else return false
			});

			if (foundTab) chrome.tabs.remove(foundTab.id, openApp);
			else openApp()
		});
	});

	const openApp = () => {
		chrome.tabs.create({ url: '/app.html' });
	}
</script>