<script>
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    //Props
    export let id;
    export let styles = ''; 
    export let value;
    export let label = '';
    export let placeholder = '';
    export let inputType = 'text';
    export let pattern;
    export let required = false;
    export let width = '100%';
    export let height = '46px';
    export let margin = 'unset';
    export let backgroundColor = '';
    export let spellcheck = false;
    export let rows = '1'
    export let readonly = false
    export let autofocus = false;
    export let numberMin = "0.00000001"
    export let numberStep = "any"

    export let thisInput;

    const dispatchChanged = (e) => {
        dispatch('changed', e);
    }

    const dispatchKeyUp = (e) => {
        dispatch('keyup', e);
    }

</script>

<style>
label{
    position: relative;
    top: 8px;
    left: 9px;
    font-style: normal;
    font-weight: normal;
    font-size: 11px;
    line-height: 16px;
    padding: 0 4px;
    color: var(--font-primary);
}

.mainbox{
    display: flex;
    align-items: center;
    width: 100%;
    min-height: 42px;

    background: none;
    border: 1px solid #e0e0e03d;
    box-sizing: border-box;
    transition: border 0.5s;
    border-radius: 4px;
    padding: 10px 12px;

    font-style: normal;
    font-weight: normal;
    font-size: 16px;
    line-height: 24px;
    color: var(--font-primary);
    letter-spacing: 0.44px;
}

.mainbox:focus{
    outline: none; 
    border: 1px solid var(--primary-color);
}

.mainbox::-webkit-input-placeholder { 
    font-style: normal;
    font-weight: normal;
    font-size: 16px;
    line-height: 24px;
    display: flex;
    align-items: center;
    letter-spacing: 0.44px;
    color: var(--font-primary-dark);
}

/* Chrome, Safari, Edge, Opera */
.mainbox::-webkit-outer-spin-button,
.mainbox::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
.mainbox[type=number] {
  -moz-appearance:textfield;
}

.mainbox:-webkit-autofill,
.mainbox:-webkit-autofill:hover, 
.mainbox:-webkit-autofill:focus
 {
  border: 1px solid #e0e0e03d;
  -webkit-text-fill-color: var(--font-primary);
  box-shadow: 0 0 0px 1000px var(--bg-color) inset;
}

</style>
<div class="inputbox" style={`margin: ${margin}; width: ${width};`}>

    <label style={`background: ${backgroundColor || 'var(--bg-color)'};`}> {label} </label>
    {#if inputType === "password"}
        <!-- svelte-ignore a11y-autofocus -->
        <input
            id={id}
            bind:value={value}
            bind:this={thisInput}
            on:change={(e) => dispatchChanged(e)}
            on:keyup={(e) => dispatchKeyUp(e)}
            class="mainbox input:required:invalid input:focus:invalid"
            style={`width: 100%; height: ${height}; ${styles}`}
            type="password"
            pattern={pattern}
            placeholder={placeholder}
            required={required}
            spellcheck={spellcheck}
            autofocus={autofocus}  />
    {/if}
    {#if inputType === "number"}
        <!-- svelte-ignore a11y-autofocus -->
        <input
            id={id}
            bind:value={value}
            bind:this={thisInput}
            on:change={(e) => dispatchChanged(e)}
            on:keyup={(e) => dispatchKeyUp(e)}
            class="mainbox input:required:invalid input:focus:invalid"
            style={`width: 100%; height: ${height}; ${styles}`}
            type="number"
            min={numberMin}
            step={numberStep}
            placeholder={placeholder}
            required={required}
            autofocus={autofocus}  />
    {/if}
    {#if inputType === "textarea"}
        <!-- svelte-ignore a11y-autofocus -->
        <textarea
            id={id}
            rows={rows}
            bind:value={value}
            bind:this={thisInput}
            on:change={(e) => dispatchChanged(e)}
            on:keyup={(e) => dispatchKeyUp(e)}
            class="mainbox textarea:required:invalid textarea:focus:invalid"
            style={`width: 100%; height: ${height}; font-family: 'Roboto', sans-serif; ${styles}`}
            pattern={pattern}
            placeholder={placeholder}
            readonly={readonly}
            required={required}
            spellcheck={spellcheck}
            autofocus={autofocus}  />
    {/if}
    {#if inputType === 'text'}
        <!-- svelte-ignore a11y-autofocus -->
        <input
            id={id}
            bind:value={value}
            bind:this={thisInput}
            on:change={(e) => dispatchChanged(e)}
            on:keyup={(e) => dispatchKeyUp(e)}
            class="mainbox input:required:invalid input:focus:invalid"
            style={`width: 100%; height: ${height}; ${styles}`}
            pattern={pattern}
            placeholder={placeholder}
            required={required}
            spellcheck={spellcheck}
            autofocus={autofocus}  />
    {/if}
</div>