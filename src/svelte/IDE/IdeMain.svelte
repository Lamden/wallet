<script>
	import { onMount } from 'svelte'
	
    //Stores
    import { breadcrumbs } from '../../js/stores/stores.js';

	//Components
	import { IdeErrorsBox, IdeMonacoEditor }  from '../../js/router.js'

	onMount(() =>{
		breadcrumbs.set([{name: 'Smart Contracts', page: {name: ''}}]);
	})

	let errorsList = ["Line:1:3 - Error", "Line:2:30- Error as well"]
</script>

<div id="monaco_window" class="flex-column">
	<IdeMonacoEditor />
	<IdeErrorsBox {errorsList} />
</div>