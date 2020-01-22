<script>
    import { onMount } from 'svelte';

	//Stores
    import { breadcrumbs } from '../../js/stores/stores.js';
    
    //Components
	import { DevToolsDocumentation, DevToolsNetworks }  from '../Router.svelte'
            
	onMount(() => {
		breadcrumbs.set([{name: 'Developer Tools', page: {name: ''}}]);
	});

</script>

<DevToolsNetworks />
<DevToolsDocumentation />