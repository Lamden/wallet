<script>
    import { onMount } from 'svelte';

	//Stores
    import { breadcrumbs } from '../../js/stores/stores.js';
    
    //Components
	import { DevToolsDocumentation }  from '../../js/router.js'
            
	onMount(() => {
		breadcrumbs.set([{name: 'Developer Tools', page: 'DevToolsMain'}]);
	});

</script>


<DevToolsDocumentation />