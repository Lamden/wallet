<script>
    import { onMount, afterUpdate } from 'svelte'
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

	//Components
    import { Components }  from '../Router.svelte';
    const { Button, InputBox, DropDown, DatePicker, TimeDelta} = Components;

    //Utils
    import { longFormTypes, typeToInputTypeMAP, defaultTypeValues } from '../../js/utils.js'    

    export let argumentInfo;
    export let index;
    export let backgroundColor;

    let inputElm;

    let InputBoxTypes = ['Any', 'str', 'float', 'int', 'dict', 'list']
    let DropDownTypes = ['bool']
    let DatePickerTypes = ['datetime.datetime', 'datetime']
    let TimeDeltaTypes = ['datetime.timedelta', 'timedelta']

    const handleDropDownSelection = (e) => {
        argumentInfo.value = e.detail.selected.value
        dispatch('argChanged')
    }

</script>

{#if InputBoxTypes.includes(argumentInfo.type)}
    <InputBox
        id={`kwarg-${index}`}
        bind:value={argumentInfo.value}
        bind:thisInput={inputElm}
        placeholder={defaultTypeValues[argumentInfo.type]}
        margin="0 0 1rem 0"
        label={`${argumentInfo.name.toUpperCase()} (${longFormTypes[argumentInfo.type]})`}
        inputType={typeToInputTypeMAP[argumentInfo.type]}
        {backgroundColor}
        on:changed={() =>  dispatch('argChanged')} /> 
{/if}

{#if DropDownTypes.includes(argumentInfo.type)}
    <DropDown
        items={defaultTypeValues[argumentInfo.type]} 
        id={`kwarg-${index}`}
        margin="0 0 1rem 0"
        {backgroundColor}
        label={`${argumentInfo.name.toUpperCase()} (${longFormTypes[argumentInfo.type]})`} 
        on:selected={handleDropDownSelection} />
{/if}

{#if DatePickerTypes.includes(argumentInfo.type)}
    <DatePicker 
        id={`kwarg-${index}`}
        bind:dateISO={argumentInfo.value}
        margin="0 0 1rem 0"
        {backgroundColor}
        label={`${argumentInfo.name.toUpperCase()} (${longFormTypes[argumentInfo.type]})`} 
        on:changed={() =>  dispatch('argChanged')}/>
{/if}

{#if TimeDeltaTypes.includes(argumentInfo.type)}
    <TimeDelta 
        id={`kwarg-${index}`}
        bind:milliseconds={argumentInfo.value}
        margin="0 0 1rem 0"
        {backgroundColor}
        label={`${argumentInfo.name.toUpperCase()} (${longFormTypes[argumentInfo.type]})`} 
        on:changed={() =>  dispatch('argChanged')}/>
{/if}