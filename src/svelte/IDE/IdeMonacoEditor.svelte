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

	let monaco;
	let container;
	let editor;
	let currentPositon;
	let methodLines = [];

	$: editorHeight = '554px';
	$: code = () => {return !editor ? '' : editor.getValue();}
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
				dispatch('loaded', true)
			}
		}
	})

	function createEditor(){
		editor = monaco.editor.create(
			container,
			{
				value: '',
				automaticLayout: true,
				fontLigatures: true,
				language: 'python',
				theme: 'vs-dark',
				fontFamily: "courier, monospace"
			}
		)

		editor.onMouseUp((e)=>{
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

		editor.onKeyUp((e) => {
			//if (e.keyCode === 3) updateCode();
		})

		editor.onDidChangeCursorPosition((e) => {
			if ($activeTab.type === 'local') updateCode();
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
</script>

<style>
.loading{
	justify-content: center;
	justify-items: center;
	align-content: center;
	align-items: center;
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
