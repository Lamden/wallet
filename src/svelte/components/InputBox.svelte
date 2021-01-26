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
    export let height = 'unset';
    export let margin = 'unset';
    export let spellcheck = false;
    export let rows = '1'
    export let readonly = false
    export let autofocus = false;
    export let numberMin = "0.00000001"
    export let numberStep = "any"
    export let disabled = false;
    export let bgStyle = "primary"
    export let errorMsg = ""
    export let warningMsg = ""

    export let thisInput;

    const dispatchChanged = (e) => {
        dispatch('changed', e);
    }

    const dispatchKeyUp = (e) => {
        dispatch('keyup', e);
    }

    const dispatchScroll = (e) => {
        dispatch('scroll', e);
    }

        const dispatchMouseUp = (e) => {
        dispatch('mouseup', e);
    }

</script>

<div class="inputbox" style={`margin: ${margin}; width: ${width}; background: var(--bg-${bgStyle});`}>
    {#if label !== ""}
        <label class="inputbox-label"> {label} </label>
    {/if}

    {#if warningMsg}
        <div class="inputbox-message text-warning">{warningMsg}</div>
    {/if}

    {#if errorMsg}
        <div class="inputbox-message text-error">{errorMsg}</div>
    {/if}
    
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
            {disabled}
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
            {disabled}
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
            on:scroll={(e) => dispatchScroll(e)}
            on:mouseup={(e) => dispatchMouseUp(e)}
            class="mainbox textarea:required:invalid textarea:focus:invalid"
            style={`width: 100%; min-width: 100%; max-width: 100%; height: ${height}; font-family: 'Roboto', sans-serif; ${styles}`}
            pattern={pattern}
            placeholder={placeholder}
            readonly={readonly}
            required={required}
            spellcheck={spellcheck}
            {disabled}
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
            {disabled}
            autofocus={autofocus}  />
    {/if}
</div>