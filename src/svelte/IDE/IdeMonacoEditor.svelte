<script context="module">
	let monaco_promise;
	let _monaco;
	monaco_promise = import('../../js/monaco.js');
	monaco_promise.then(mod => {
		_monaco = mod.default;
	})
</script>

<script>
	import { onMount, getContext, createEventDispatcher, afterUpdate } from 'svelte';
	const dispatch = createEventDispatcher();

	//Store
	import { CacheStore, currentNetwork, FilesStore, activeTab } from '../../js/stores/stores.js';

	//Components
	import { Components }  from '../Router.svelte'
	const { Loading } = Components;

	//Context
	const { checkContractExists, addContractTab } = getContext('editor_functions');

	//Props
	export let lintErrors = undefined;

	let monaco;
	let container;
	let editor;
	let errorList = [];
	let importList = [];
	let importErrors = [];
	let decorations = [];
	let crtlDown = false;
	let checkedContracts = {}

	$: editorHeight = '554px';
	$: activeTabCode = $activeTab.code;

  	onMount(() => {
		monaco_promise.then(async mod => {
			monaco = mod.default;
			createEditor();
		});
		return () => {
			editor.dispose();
		}
	});

	afterUpdate(() => {
		if (monaco && editor){
			if (editor.getValue() !== activeTabCode){
				let model = monaco.editor.createModel(activeTabCode, 'python');
				editor.updateOptions({ readOnly: $activeTab.type === 'local' ? false : true })
				editor.setModel(model)
				highlightImports();
				dispatch('loaded', true)
			}
			if (lintErrors) showErrors();
			decorations = editor.deltaDecorations(decorations, [...errorList, ...importList, ...importErrors])
		}
	})

	function createEditor(){
		editor = monaco.editor.create(
			container,
			{
				value: '',
				automaticLayout: true,
				scrollBeyondLastLine: false,
				fontLigatures: true,
				language: 'python',
				theme: 'vs-dark',
				fontFamily: "courier, monospace"
			}
		)

		editor.onMouseUp((e)=>{
			if (e.target.element.className.includes("import-contract")  && crtlDown) {
				let contractName = e.target.element.innerText;
				checkContractExists(contractName, {callback: addTab})
			}
			if (e.target.element){
				if (e.target.element.className.includes("cursor")){
					let positionInfo = editor.getModel().getWordAtPosition(e.target.position);
					if (positionInfo){
						let contractName = positionInfo.word;
						let lineContent = editor.getModel().getLineContent(e.target.position.lineNumber);
						let regex = new RegExp(`import\\s*${contractName}\\s*`);
						let matches = editor.getModel().findMatches(regex, true, true, true, null, true);
						if (matches.length > 0){
							matches.map(match =>{
								if (match.range.startColumn = e.target.position.lineNumber){
									checkContractExists(contractName, {callback: addTab})
								}
							})
						}
					}

				}
			}
			highlightImports()
		});

		editor.onKeyDown((e) => {
			if (e.browserEvent.key === 'Control') crtlDown = true;
		})

		editor.onKeyUp((e) => {
			if (e.browserEvent.key === 'Control') crtlDown = false;
			if (e.code === 'Space' || e.code === 'Enter'){
				if (e.target.value.includes("import")){
					highlightImports()
				}
			}
		})

		editor.onDidChangeCursorPosition((e) => {
			if (editor.getValue() !== activeTabCode){
				if ($activeTab.type === 'local') updateCode();
			}
		})

		container.style.width = `${window.innerWidth - 402}px`;
	}

	function updateCode(){
		FilesStore.updateCode(editor.getValue(), $activeTab.index);
	}

	function handler(e){
		container.style.width = `${e.target.innerWidth - 402}px`;
		container.style.fontFamily = "'Courier Prime', monospace"
	}

	function showErrors(){
		errorList = [];
		if (!lintErrors.violations){
			decorations = editor.deltaDecorations(decorations, []);
			return;
		};
		if (lintErrors.violations.args){
			if (lintErrors.violations.lineno){
				errorList.push({
					range: new monaco.Range(lintErrors.violations.lineno, 1, lintErrors.violations.lineno, lintErrors.violations.offset + 1), 
					options: { 
						hoverMessage: {value: `${lintErrors.violations.msg}: ${lintErrors.violations.text}`},
						inlineClassName: 'ide-errorline'
					}
				});
			}
		}else{
			if (Array.isArray(lintErrors.violations)){
				lintErrors.violations.map(error =>{
					let errorInfo = parseErrorString(error)
					if (errorInfo.lineNo !== 0) {
						errorList.push({
							range: new monaco.Range(errorInfo.lineNo,1,errorInfo.lineNo,10), 
							options: { 
								hoverMessage: {value: errorInfo.msg},
								linesDecorationsClassName: 'ide-errorline'
							}
						})
					}
				})
			}
		}
	}

	function parseErrorString(string){
		try {
			return {
				lineNo: parseInt(string.split(':', 1)[0].split(' ')[1]),
				msg:  string.split(':')[1]
			}
		} catch (e) {
			console.log(`could not parse error string "${string}" from lint endpoint. ${e}`)
		}

	}

	function highlightImports(){
		importList = [];
		importErrors = [];
		if (!checkedContracts[$currentNetwork.name]) checkedContracts[$currentNetwork.name] = {};
		const position = editor.getModel().findMatches(/import\s*(\w*)/, true, true, true, null, true);
		position.map(match =>{
			let contractName = match.matches[1]
			if (!CacheStore.contractExists(contractName, $currentNetwork.name)){
				if (!checkedContracts[$currentNetwork.name][contractName]){
					if (contractName.replace(/\s/g, "") !== ""){
						checkContractExists(contractName, {callback: handleContractExists, data: match});
					}
				} else {
					pushErrorDecoration(match, "Contract does not exist on the network");
				}
			}else{
				pushInputDecoration(match);
			}
		})
	}

	function pushInputDecoration(match){
		let lineNumber = match.range.startLineNumber;
		let startColumn = match.range.startColumn + 7;
		let endColumn = match.range.endColumn;
		importList.push({
			range: new monaco.Range(lineNumber, startColumn, lineNumber, endColumn), 
			options: { 
				hoverMessage: {
					value: "Open Contract in Editor (ctrl + click)", 
					isTrusted: true
				},
				inlineClassName: 'import-contract'
			}
		})
		decorations = editor.deltaDecorations(decorations, [...errorList, ...importList, ...importErrors])
	}

	function pushErrorDecoration(match, errorText){
		let lineNumber = match.range.startLineNumber;
		let startColumn = match.range.startColumn + 7;
		let endColumn = match.range.endColumn;
		importErrors.push({
			range: new monaco.Range(lineNumber, startColumn, lineNumber, endColumn), 
			options: { 
				hoverMessage: {value: errorText},
				inlineClassName: 'input-error'
			}
		});
		decorations = editor.deltaDecorations(decorations, [...errorList, ...importList, ...importErrors])
	}

	function handleContractExists(res, match){
		if (!res.code) {
			if (match.matches[1] !== "") {
				checkedContracts[$currentNetwork.name][match.matches[1]] = true;
				pushErrorDecoration(match, "Contract does not exist on the network");
				return;
			}
		}
		CacheStore.addContract(res.name, $currentNetwork.name)
		pushInputDecoration(match);
	}

	function addTab(res){
		if (!res.error) addContractTab(res.name, res.code)
	}
</script>

<style>
.loading{
	justify-content: center;
	justify-items: center;
	align-content: center;
	align-items: center;
}
:global(.input-error){
	background: #ff000054;
	padding: 1px 3px;
    cursor: pointer;
    border-radius: 3px;
}
:global(.ide-errorline){
	background: #ff000054;
}
:global(.import-contract){
    background: #2d2d2d;
    padding: 1px 3px;
    cursor: pointer;
    border-radius: 3px;
}
:global(.import-contract:hover){
    color: var(--primary-color);
	font-weight: bold;
}
</style>

{#await monaco_promise}
	<div class="loading" style={`width: 100%; height: ${editorHeight}`}>
		<Loading  message={'Loading Editor'}/>
	</div>
{:then editor}
	<div class="monaco-container" bind:this={container} style={`height: ${editorHeight}; text-align: left`} />
{/await}
<svelte:window on:resize={handler}/>
