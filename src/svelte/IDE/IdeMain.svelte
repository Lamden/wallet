<script>
	import { onMount, getContext } from 'svelte'
	
    //Stores
    import { breadcrumbs, currentNetwork, activeTab } from '../../js/stores/stores.js';

	//Components
	import { IdeErrorsBox, IdeMethods, IdeTabs, Components }  from '../../js/router.js';
	const { Button } = Components;

    //Context
    const { openModal } = getContext('app_functions');

	let lintErrors = undefined;
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
			console.log(res)
			lintErrors = res;
			console.log(lintErrors)
			//if (errorsList.length === 0 && callback) callback();
		})
		.catch(err => console.log(err))
	}

	function submit(){
		openModal('IdeModelSubmit', {
			'contractName': 'submission', 
            'methodName': 'submit_contract', 
            args: {
				name: {
					type: 'text',
					value: $activeTab.name
				},
				code:{
					type: 'text',
					value: $activeTab.code
				}
			}
		})
	}

	function reformatMethodObject(methods){
        methods.map(method => {
            if (!method.args) method.args = {};
            method.arguments.map((arg, index) => {
               if (!method.args[arg]) method.args[arg] = {type: "text", value: 'testing'}
            })
        })
        return [...methods]
	}

	function handleMethodClick(e){
		openModal('IdeModelMethodTx', e.detail)
	}

	function openNewTab(e){
		console.log(e)
	}
</script>

<style>
.buttons{
    background: var(--bg-color-grey);
    padding: 17px;
}

</style>

<div id="monaco_window" class="flex-column">
	{#if editorIsLoaded}
		<IdeTabs />
	{/if}

	<div class="editor-row">
		<Monaco 
			bind:this={monaco} 
			on:loaded={editorLoaded}
			on:openTab={openNewTab}
			on:clickMethod={handleMethodClick}
			{lintErrors}
		/>
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
		<IdeErrorsBox {lintErrors} />
	{/if}
	{#if editorIsLoaded && $activeTab.methods}
		<IdeMethods methods={reformatMethodObject($activeTab.methods)} />
	{/if}
</div>