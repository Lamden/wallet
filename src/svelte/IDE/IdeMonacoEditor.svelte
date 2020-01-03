<script context="module">
  var monaco_promise;
  var _monaco;
  monaco_promise = import('../../js/monaco.js');
  monaco_promise.then(mod => {
    _monaco = mod.default;
  })
</script>

<script>
	import { onMount } from 'svelte';

	let monaco;
	let container;
	let editor;

	$: width = '100%';

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

	function createEditor(){
		editor = window.monaco.editor.create(
			container,
			{
				value: [
					'# Get started @ https://contracting.lamden.io/',
					'',
					'@export',
					'def first_method(value):',
					'	return value',
				].join('\n'),
				automaticLayout: true,
				language: 'python',
				theme: 'vs-dark'
			}
		)
		editor.onMouseUp(()=>{
			console.log('mouseClick')
		});

		editor.onKeyUp((e) => {
			if (e.keyCode === 3) console.log('enter');
		})
	}

	function handler(e){
		console.log(e.target.innerWidth)
		if (e.target.innerWidth)
		container.style.width = `${e.target.innerWidth - 402}px`;
	}
</script>

{#await monaco_promise}
	{'Loading Editor'}
{:then editor}
	<div class="monaco-container" bind:this={container} style={`height: 550px; text-align: left`} />
{/await}
<svelte:window on:resize={handler}/>
