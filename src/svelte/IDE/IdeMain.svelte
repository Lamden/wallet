<script>
	import { onMount, setContext } from 'svelte'
	
    //Stores
    import { breadcrumbs } from '../../js/stores/stores.js';

	//Components
	import { IdeErrorsBox, IdeMonacoEditor, IdeTabs }  from '../../js/router.js'

	//Context
	setContext('tab_functions', {
        changeTab: (tab) => console.log(tab)
	});

	let errorsList = [];
	let editorIsLoaded = false;

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

	function editorLoaded(){
		editorIsLoaded = true;
	}

</script>

<div id="monaco_window" class="flex-column">
	{#if editorIsLoaded}<IdeTabs />{/if}
	<IdeMonacoEditor on:lint={handleLint} on:loaded={editorLoaded}/>
	<IdeErrorsBox {errorsList} />
</div>