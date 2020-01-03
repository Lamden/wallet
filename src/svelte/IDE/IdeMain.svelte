<script>
	import { onMount } from 'svelte'
	
    //Stores
    import { breadcrumbs } from '../../js/stores/stores.js';

	//Components
	import { IdeErrorsBox, IdeMonacoEditor }  from '../../js/router.js'

	let errorsList = [];

	onMount(() =>{
		breadcrumbs.set([{name: 'Smart Contracts', page: {name: ''}}]);
	})

	function handleLint(e){
		if (e.detail.violations === null){
			errorsList = [];
			console.log(errorsList)
			return;
		}
		if (e.detail.violations === undefined){
			errorsList = [e.detail];
			console.log(errorsList)
			return;
		}
		if (e.detail.violations.args !== undefined){
			errorsList = [`Line[${e.detail.violations.lineno}:${e.detail.violations.offset}]: ${e.detail.violations.msg}`];
			console.log(errorsList)
			return;
		}
		errorsList = e.detail.violations;
		console.log(errorsList)
	}

</script>

<div id="monaco_window" class="flex-column">
	<IdeMonacoEditor on:lint={handleLint}/>
	<IdeErrorsBox {errorsList} />
</div>