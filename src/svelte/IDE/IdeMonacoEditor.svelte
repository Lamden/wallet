<script context="module">
	let monaco_promise;
	let _monaco;
	monaco_promise = import('../../js/monaco.js');
	monaco_promise.then(mod => {
		_monaco = mod.default;
	})
</script>

<script>
	import { onMount, createEventDispatcher, afterUpdate } from 'svelte';
	const dispatch = createEventDispatcher();

	//Store
	import { currentNetwork, FilesStore, activeTab } from '../../js/stores/stores.js';

	//Components
	import { Components }  from '../../js/router.js'
	const { Loading } = Components;

	//Props
	export let lintErrors = undefined;

	let monaco;
	let container;
	let editor;
	let currentPositon;
	let methodLines = [];
	let errorList = [];
	let importList = [];
	let decorations = [];
	let crtlDown = false;

	$: editorHeight = '554px';
	$: code = () => {return !editor ? '' : editor.getValue();}
	$: activeTabCode = $activeTab.code;
	$: formatting = [...errorList, ...importList];

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
				//if ($activeTab.type === 'online') highlightImports();
				highlightImports();
				dispatch('loaded', true)
			}
			if (lintErrors) showErrors();
			decorations = editor.deltaDecorations(decorations, [...errorList, ...importList])
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
				dispatch('openTab', e.target.element.innerText)
			}
			
			if ($activeTab.type === 'local') return
			let selection = editor.getSelection();
			if (!e.target.position) return;
			if (!selection) return;
			if (selection.startColumn !== selection.endColumn) return;
			methodLines.map(lines => {
				if (e.target.position.lineNumber === lines.lineNum) {
					let txInfo = {
						contractName: $activeTab.name,
						methodName: lines.method.name,
						args: lines.method.arguments
					}
 					dispatch('clickMethod', txInfo)
				}
			})
		});

		editor.onKeyDown((e) => {
			if (e.keyCode === 5) crtlDown = true;
		})

		editor.onKeyUp((e) => {
			if (e.keyCode === 5) crtlDown = false;
		})

		editor.onDidChangeCursorPosition((e) => {
			if (editor.getValue() !== activeTabCode){
				highlightImports()
				if ($activeTab.type === 'local') updateCode();
			}
		})

		container.style.width = `${window.innerWidth - 419}px`;
	}

	function updateCode(){
		FilesStore.updateCode(editor.getValue(), $activeTab.index);
	}

	function handler(e){
		container.style.width = `${e.target.innerWidth - 419}px`;
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
					console.log(errorInfo)
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
		const position = editor.getModel().findMatches(/import\s*(\w*)/, true, true, true, null, true);
		position.map(match =>{
			checkContractExists(match)
		})
	}

	function checkContractExists(match){
		console.log(match)
		let contractName = match.matches[1]
		fetch(`http://${$currentNetwork.ip}:${$currentNetwork.port}/contracts/${contractName}`)
			.then(res => res.json())
			.then(res => {
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
				decorations = editor.deltaDecorations(decorations, [...errorList, ...importList])
				//getMethods(res.name, res.code);
			})
			.catch(err => console.log(err))
    }

    function getMethods(contractName, contractCode){
        fetch(`http://${$currentNetwork.ip}:${$currentNetwork.port}/contracts/${contractName}/methods`)
            .then(res => res.json())
            .then(res => {
                FilesStore.addExistingContract(contractName, contractCode, res.methods, currentNetwork.name);
            })
            .catch(err => console.log(err))
    }

</script>

<style>
.loading{
	justify-content: center;
	justify-items: center;
	align-content: center;
	align-items: center;
}
:global(.ide-errorline){
	background: #ff00004f;
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
