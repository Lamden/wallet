<script>
	import { onMount, getContext, setContext } from 'svelte'
	
    //Stores
    import { breadcrumbs, currentNetwork, activeTab, FilesStore } from '../../js/stores/stores.js';

	//Components
	import { IdeErrorsBox, IdeMethods, IdeTabs, Components }  from '../Router.svelte';
	const { Button, Loading } = Components;
	import { Monaco } from '../components/Monaco.svelte'

    //Context
	const { openModal } = getContext('app_functions');
	setContext('editor_functions', {
		checkContractExists: (contractName, options) => checkContractExists(contractName, options),
		addContractTab: (contractName, contractCode) => getMethods(contractName, contractCode)
    });

	let lintErrors = {validations: null};
	let editorIsLoaded = false;

	import MonacoWindow from './IdeMonacoEditor.svelte';
  
	let monaco;
	let monacoComponent;

	onMount(() =>{
		breadcrumbs.set([{name: 'Smart Contracts', page: {name: ''}}]);
		//console.log(Monaco)
		Monaco.then(mod => {
			//console.log(mod)
			if (mod){
				monaco = mod;
				editorIsLoaded = true;
			}
		})
		return () => {
			editorIsLoaded = false;
		}
	})

	function editorLoaded(){
		editorIsLoaded = true;
		if ($activeTab.type === 'local') lint();
	}

	function lint(callback){
		let data = {
			name: $activeTab.name,
			code: $activeTab.code
		}
		fetch(`${$currentNetwork.ip}:${$currentNetwork.port}/lint`, {
			method: 'POST',
			headers: {
			'Content-Type': 'application/json'
			},
            body: JSON.stringify(data)
        })
		.then(res => res.json())
		.then(res => {
			lintErrors = res;
			if (!callback) return;
			callback(res);
		})
		.catch(err => console.log(err))
	}

	function submit(res){
		if (res.violations === null){
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

	function checkContractExists(contractName, options){
		fetch(`${$currentNetwork.ip}:${$currentNetwork.port}/contracts/${contractName}`)
			.then(res => res.json())
			.then(res => {
				try{
					options.callback(res, !options.data ? undefined : options.data);
				} catch (e) {
					return false;
				}
			})
			.catch(err => console.log(err))
	}
	
    function getMethods(contractName, contractCode){
        fetch(`${$currentNetwork.ip}:${$currentNetwork.port}/contracts/${contractName}/methods`)
            .then(res => res.json())
            .then(res => {
                FilesStore.addFile(contractName, contractCode, res.methods, currentNetwork);
            })
            .catch(err => console.log(err))
	}
	
	function loaded(){
		console.log('loaded')
	}
</script>

<style>
.buttons{
    background: var(--bg-color-grey);
    padding: 10px 17px;
}

</style>

{#if editorIsLoaded}
	<div id="monaco_window" class="flex-column">
		
			<IdeTabs {checkContractExists}/>

		<div class="editor-row">

			<MonacoWindow 
				bind:this={monacoComponent}
				{monaco}
				on:loaded={editorLoaded}
				{checkContractExists}
				on:clickMethod={handleMethodClick}
				{lintErrors}
			/>

			{#if editorIsLoaded && $activeTab.type === 'local'}
				<div class="buttons flex-row">
					{#if $activeTab.type === 'local'}
						<Button 
							id={'contractTab-btn'} 
							classes={'button__transparent'}
							name="Check Contract"
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
		{#if editorIsLoaded && $activeTab.type === 'local'}
			<IdeErrorsBox {lintErrors} />
		{/if}
		{#if editorIsLoaded && $activeTab.methods}
			<IdeMethods methods={reformatMethodObject($activeTab.methods)} />
		{/if}
	</div>
{:else}
	<div class="loading" style={`width: 100%; height: 500px;`}>
		<Loading  message={'Loading Editor'}/>
	</div>
{/if}