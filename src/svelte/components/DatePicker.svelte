<script> 
	import Flatpickr from './FlatPicker.svelte'; 
	import { createEventDispatcher, onMount } from 'svelte';
	const dispatch = createEventDispatcher();
	
	//Utils
    import { encodeLocaleDateTime, Encoder } from '../../js/utils.js'

	export let dateFormated = new Date().toLocaleString();
	export let dateISO = new Date(dateFormated).toISOString();

	export let id = '';
	export let label = '';
	export let margin = '';
	export let placeholder;
	export let backgroundColor = label === '' ? 'transparent' : '';

	let datePickerElm;
	let showLocale = true;
	let labels = ['Yr','Mon','Day','Hr','Min','Sec','Mil']
	let constraints = [
		{min: 1, max: 9999},
		{min: 1, max: 12},
		{min: 1, max: 31},
		{min: 1, max: 24},
		{min: 1, max: 60},
		{min: 1, max: 60},
		{min: 1, max: 1000},
	]
	let currDate = new Date().toString()
	let timeZone = currDate.substring(currDate.lastIndexOf("(") + 1, currDate.lastIndexOf(")"));

	$: dateValues = showLocale ? encodeLocaleDateTime(new Date(dateFormated)) : Encoder('datetime', dateFormated)



	const options = {
		enableTime: true,
		time_24hr: true,
		enableSeconds: true,
		dateFormat: 'Z',
		mode: "single"
	}

	onMount(() => {
		dateFormated = new Date().toString();
		dispatch('changed')
	})

	const handleChange = (e) => {
		dateFormated = e.detail[0][0].toString()
		dateISO = e.detail[1]
		dispatch('changed', e.detail)
	}

	const handleInputChange = (e, index) => {
		dateValues[index] = parseInt(e.target.value);
		if (e.target.value > constraints[index].max) dateValues[index] = constraints[index].max
		if (e.target.value < constraints[index].min) dateValues[index] = constraints[index].min
		dateISO = new Date(
			dateValues[0],
			dateValues[1],
			dateValues[2],
			dateValues[3],
			dateValues[4],
			dateValues[5],
			dateValues[6]
			).toString()
	}

	const handleTimezonClick = (e) => {
		if (e.target === datePickerElm) showLocale = !showLocale;
	}

</script> 

<style>
.date-picker{
	position: relative;
	justify-content: space-between;
	align-items: center;
	border: 1px solid #e0e0e03d;;
	padding: 0px 5px 10px 10px;
	border-radius: 4px;
	z-index: 0;
	cursor: pointer;
}

.mainbox{
	text-align: center;
	padding: 6px;
}
.inputbox{
	width: 8%;
    z-index: 1;
	min-width: 50px;
	padding: 0 5px;
}
div > strong{
	position: relative;
    font-size: 1.6em;
    top: 8px;
}
label > strong:hover{
	position: relative;
	top: -1;
	color: aqua;
}
.inputbox-label{
	z-index: 1;
	cursor: pointer;
}
</style>

<label  class="inputbox-label" 
		style={`background: ${backgroundColor || 'var(--bg-color)'};`}
		on:click={handleTimezonClick}
		> 
		{label} <strong class="outside-link">{`(${showLocale ? timeZone : 'UTC'})`}</strong>
</label>

<div class="flex-row date-picker"
	id={id}
	 style={margin ? `margin: ${margin};` : ''}
	 on:click={handleTimezonClick}
	 bind:this={datePickerElm}
	 > 
	<Flatpickr {options}
		placeholder="optional placeholder"
		on:change={handleChange} />
	{#each dateValues as value, index}
		<div class="inputbox">
			<label class="inputbox-label" style={`background: ${backgroundColor || 'var(--bg-color)'};`}> {labels[index]} </label>
			<input  class="mainbox input:required:invalid input:focus:invalid"
					type="number" 
					bind:value={dateValues[index]}
					min={constraints[index].min}
					max={constraints[index].max}
					step={1}
					placeholder={placeholder} 
					on:change={(e) => handleInputChange(e, index)}/>
		</div>
		{#if index === 2} <strong class="text-primary-dark">/</strong> {/if}
	{/each}
 </div>
