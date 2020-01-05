<script context="module">
	var monaco_promise;
	var _monaco;
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

	$: editorHeight = '554px';
	$: code = () => {return !editor ? '' : editor.getValue();}
	$: activeTabCode = $activeTab.code;

	onMount(() => {
		if (_monaco) {
			monaco_promise.then(mod => {
				window.monaco = _monaco;
				createEditor();
			});
		} else {
			monaco_promise.then(mod => {
				window.monaco = mod.default;
				createEditor();
			});
		}
		return () => {
			editor.dispose()
		}
	});

	afterUpdate(() => {
		if (window.monaco && editor){
			if (editor.getValue() !== activeTabCode){
				let model = window.monaco.editor.createModel(activeTabCode, 'python');
				editor.setModel(model)	
			}
		}
	})

	function createEditor(){
		editor = window.monaco.editor.create(
			container,
			{
				value: '',
				automaticLayout: true,
				language: 'python',
				theme: 'vs-dark'
			}
		)
		editor.onMouseUp(()=>{
			//updateCode();
		});

		editor.onKeyUp((e) => {
			//if (e.keyCode === 3) updateCode();
		})

		editor.onDidChangeCursorPosition((e) => {
			updateCode();
		})
		let model = window.monaco.editor.createModel($activeTab.code, 'python');
		editor.setModel(model)

		dispatch('loaded', true)
	}

	function updateCode(){
		FilesStore.updateCode(editor.getValue(), $activeTab.index);
	}

	function handler(e){
		container.style.width = `${e.target.innerWidth - 402}px`;
	}

	function lint(){
		let data = {
			name: 'testing',
			code: code()
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
			dispatch('lint', res)
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
</style>

{#await monaco_promise}
	<div class="loading" style={`width: 100%; height: ${editorHeight}`}>
		<Loading  message={'Loading Editor'}/>
	</div>
{:then editor}
	<div class="monaco-container" bind:this={container} style={`height: ${editorHeight}; text-align: left`} />
	<button on:click={lint} >lint</button>
{/await}
<svelte:window on:resize={handler}/>
