<script>
	import { onMount, getContext } from 'svelte'
	
    //Stores
    import { breadcrumbs, currentNetwork, activeTab } from '../../js/stores/stores.js';

	//Components
	import { IdeErrorsBox, IdeTabs, Components }  from '../../js/router.js';
	const { Button } = Components;

    //Context
    const { openModal } = getContext('app_functions');

	let errorsList = [];
	let editorIsLoaded = false;

	import Monaco from './IdeMonacoEditor.svelte';
  
	let monaco;
	
	onMount(() =>{
		breadcrumbs.set([{name: 'Smart Contracts', page: {name: ''}}]);

		return () => {
			editorIsLoaded = false;
		}
	})

	function editorLoaded(){
		editorIsLoaded = true;
	}

	function lint(callback){
		let data = {
			name: $activeTab.name,
			code: $activeTab.code
		}
		fetch(`http://${$currentNetwork.ip}:${$currentNetwork.port}/lint`, {
			method: 'POST',
			headers: {
			'Content-Type': 'application/json'
			},
            body: JSON.stringify(data)
        })
		.then(res => res.json())
		.then(res => {
			handleLint(res)
			if (errorsList.length === 0 && callback) callback();
		})
		.catch(err => console.log(err))
	}

	function handleLint(res){
		if (res.violations === null){
			errorsList = [];
			return;
		}
		if (res.violations === undefined){
			errorsList = [res];
			return;
		}
		if (res.violations.args !== undefined){
			if (res.violations.lineno){
				errorsList = [`Line[${res.violations.lineno}:${res.violations.offset}]: ${res.violations.msg}`];
			}else{
				errorsList = res.violations.args;
			}
			return
		}
		errorsList = res.violations;
	}

	function submit(){
		openModal('IdeModelSubmit')
	}
</script>

<style>
.buttons{
	position: relative;
    top: -62px;
    left: 20px;
}

</style>

<div id="monaco_window" class="flex-column">
	{#if editorIsLoaded}
		<IdeTabs />
	{/if}

	<div class="editor-row">
		<Monaco bind:this={monaco} on:lint={handleLint} on:loaded={editorLoaded}/>
		{#if editorIsLoaded}
			<div class="buttons flex-row">
				{#if $activeTab.type === 'local'}
					<Button 
						id={'contractTab-btn'} 
						classes={'button__transparent'}
						name="Check Errors"
						margin={'0 10px 3px 0'}
						height={'42px'}
						click={() => lint()}
					/>
					<Button 
						id={'contractTab-btn'} 
						classes={'button__transparent button__blue'}
						name="Submit to Network"
						height={'42px'}
						click={() => lint(submit)}
					/>
				{/if}
			</div>
		{/if}
	</div>
	{#if editorIsLoaded}
		<IdeErrorsBox {errorsList} />
	{/if}
</div>