<script>
	import { onMount, getContext, setContext } from 'svelte'
	
    //Stores
    import { currentNetwork, activeTab, FilesStore, NetworksStore } from '../../js/stores/stores.js';

	//Components
	import { IdeErrorsBox, IdeMethods, IdeGetVariable, IdeTabs, Components }  from '../Router.svelte';
	const { Button, Loading, Kwarg } = Components;
	import { Monaco } from '../components/Monaco.svelte'
	import MonacoWindow from './IdeMonacoEditor.svelte';

    //Context
	const { openModal } = getContext('app_functions');
	setContext('editor_functions', {
		checkContractExists: async (contractName, options) => await getContract(contractName, options),
		addContractTab: async (contractName, contractCode) => await addFileToStore(contractName, contractCode)
    });

	let lintErrors = {violations: null};
	let editorIsLoaded = false;  
	let monaco;
	let monacoComponent;
	let CONTRACTING_API = "https://testnet.lamden.io/contracting"

	onMount(() =>{
		Monaco.then(mod => {
			if (mod){
				monaco = mod;
				editorIsLoaded = true;
			}
		})

		return () => {
			editorIsLoaded = false;
		}
	})

	const editorLoaded = () => {
		editorIsLoaded = true;
		if ($activeTab.type === 'local') lint();
	}

	const lint = async (callback) => {
		const sendCallback = (data) => {
			if (Object.prototype.toString.call(callback) === '[object Function]') callback(data)
		}
		if ($activeTab.code === '') {
			sendCallback({violations: null})
			lintErrors = {violations: null}
		}else{
			let response = fetch(`${CONTRACTING_API}/lint`,{
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify({
					name: $activeTab.name, 
					code: $activeTab.code
				})
			})
			.catch(err => console.log({err}))
			.then(res => res.json())
			.then(json =>{
				sendCallback(json)
				lintErrors = json
			})
		}
	}

	const submit = (res) => {
		if (res.violations === null && $activeTab.code !== ''){
			openModal('IdeModelSubmit', {
				'contractName': 'submission', 
				'methodName': 'submit_contract', 
				kwargs: {
					name: $activeTab.name,
					code:$activeTab.code
				}
			})
		}
	}

	const handleMethodClick = (e) => {
		openModal('IdeModelMethodTx', e.detail)
	}

	const getContract = async (contractName, options) => {
		let contractInfo = await $currentNetwork.API.getContractInfo(contractName)
		if (contractInfo) options.callback(contractInfo, !options.data ? undefined : options.data);
	}
	
    const addFileToStore = async (contractName, contractCode) => {
		let methods =  await $currentNetwork.API.getContractMethods(contractName)
		FilesStore.addFile(contractName, contractCode, methods, $currentNetwork);
	}
</script>

<style>
.buttons{
    background: var(--bg-secondary);
    padding: 10px 17px;
	border-radius: 4px;
}
.editor-row{
	box-shadow: var(--box-shadow-2);
    -webkit-box-shadow: var(--box-shadow-2);
    -moz-box-shadow: var(--box-shadow-2);
}
</style>

{#if editorIsLoaded}
	<div id="monaco_window" class="flex-column">
		
			<IdeTabs />

		<div class="editor-row">
			<MonacoWindow 
				bind:this={monacoComponent}
				{monaco}
				on:loaded={editorLoaded}
				on:clickMethod={handleMethodClick}
				{lintErrors}
			/>
			{#if editorIsLoaded && $activeTab.type === 'local'}
				<div class="buttons flex-row" >
					{#if $activeTab.type === 'local'}
						<Button 
							id={'check-contract-btn'} 
							classes={'button__outlined button__accent'}
							name="Check Contract"
							margin={'0 10px 3px 0'}
							height={'42px'}
							click={lint}
						/>
						<Button 
							id={'submit-contract-btn'} 
							classes={'button__outlined button__accent'}
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
			<IdeGetVariable contractName={$activeTab.name}/>
			<IdeMethods methods={$activeTab.methods} />
		{/if}
	</div>
{:else}
	<div class="loading" style={`width: 100%; height: 500px;`}>
		<Loading  message={'Loading Editor'}/>
	</div>
{/if}