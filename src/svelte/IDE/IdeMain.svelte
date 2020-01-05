<script>
	import { onMount } from 'svelte'
	
    //Stores
    import { breadcrumbs } from '../../js/stores/stores.js';

	//Components
	import { IdeErrorsBox, IdeMonacoEditor, IdeTabs }  from '../../js/router.js'

	let errorsList = [];
	let editorIsLoaded = false;

	onMount(() =>{
		breadcrumbs.set([{name: 'Smart Contracts', page: {name: ''}}]);
	})

	function handleLint(e){
		if (e.detail.violations === null){
			errorsList = [];
			return;
		}
		if (e.detail.violations === undefined){
			errorsList = [e.detail];
			return;
		}
		if (e.detail.violations.args !== undefined){
			errorsList = [`Line[${e.detail.violations.lineno}:${e.detail.violations.offset}]: ${e.detail.violations.msg}`];
			return;
		}
		errorsList = e.detail.violations;
	}

	function editorLoaded(){
		editorIsLoaded = true;
	}

</script>

<div id="monaco_window" class="flex-column">
	{#if editorIsLoaded}<IdeTabs />{/if}
	<IdeMonacoEditor on:lint={handleLint} on:loaded={editorLoaded}/>
	<IdeErrorsBox {errorsList} />
</div>