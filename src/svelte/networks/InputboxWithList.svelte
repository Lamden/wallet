<script>
    import addbtnIcon from '../../img/misc/add_btn.svg';
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    //Props
    export let id;
    export let styles = ''; 
    export let value = [];
    export let label = '';
    export let placeholder = '';
    export let pattern;
    export let width = '100%';
    export let height = '38px';
    export let margin = 'unset';
    export let spellcheck = false;
    export let autofocus = false;
    export let disabled = false;
    export let bgStyle = "primary"
    export let errorMsg = ""
    export let warningMsg = ""
    export let thisInput;
    export let autoComplete = "off";
    export let ping;

    let inputValue;
    let valid = false;

    const dispatchChanged = (e) => {
        thisInput.setCustomValidity('')
        inputValue = e.currentTarget.value.trim();
        valid = inputValue !== '' && thisInput.checkValidity(); 
        if (!valid) thisInput.reportValidity();
    }

    const add = () => {
        let index = value.findIndex(val => val === inputValue);
        if (index === -1){
            if (valid) {
                value[value.length] = inputValue;
                inputValue = null;
            }
        } else {
            thisInput.setCustomValidity('Already Exists');
            thisInput.reportValidity();
        }
    }

    const deleteItem = (i) => {
        let index = value.findIndex(val => val === i);
        if (index !== -1){
            value.splice(index, 1)
            value = [...value]
        }
    }

</script>

<style>
    .input-box{
        position: absolute;
    }
    .inputbox-label{
        z-index: 1;
        position: absolute;
        top: -7px;
    }
    .input-box{
        position: relative;
    }
    .input-box .add-btn{
        position: absolute;
        right: 0;
        top: 0;
        border-radius: 4px;
        background: var(--secondary-color);
    }
    .input-box .add-btn-primary{
        background: var(--primary-color);
    }
    .input-box .add-btn .icon{
        position: absolute;
        left: 50%;
        top: 50%;
        width: 14px;
        height: 14px;
        transform: translate(-50%,-50%);
    }
    .item{
        margin-top: 2px;
        width: 100%;
        overflow: hidden;
    }
    .mark{
        display: inline-block;
        width: 8px;
        height: 8px;
        border-radius: 100%;
        margin-right: 10px;
        background: var(--error-color);
        vertical-align: middle;
    }
    .online{
        background: var(--success-color);
    }
    .mainbox{
        height: 100px;
        max-height: 100px;
        overflow-y: auto;
        align-items: flex-start;
        margin-top: 0.8rem;
    }
    .item .text-btn{
        display: none;
    }
    .item:hover .text-btn{
        display: inline;
        color: var(--accent-color);
        cursor: pointer;
    }
</style>
<div class="inputbox" style={`margin: ${margin}; width: ${width}; background: var(--bg-${bgStyle});`}>
    {#if label !== ""}
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <label class="inputbox-label"> {label} </label>
    {/if}

    {#if warningMsg}
        <div class="inputbox-message text-warning">{warningMsg}</div>
    {/if}

    {#if errorMsg}
        <div class="inputbox-message text-error">{errorMsg}</div>
    {/if}
    <!-- svelte-ignore a11y-autofocus -->
    <div class="input-box">
        <input
            id={id}
            bind:value={inputValue}
            bind:this={thisInput}
            on:change={(e) => dispatchChanged(e)}
            class="mainbox input:required:invalid input:focus:invalid"
            style={`width: 100%; height: ${height}; ${styles}`}
            pattern={pattern}
            placeholder={placeholder}
            spellcheck={spellcheck}
            type='url'
            {disabled}
            {autoComplete}
            autofocus={autofocus}  />
        <div class="add-btn" class:add-btn-primary={valid} style={`width: ${height}; height: ${height}`} on:click={add}>
            <div class="icon">{@html addbtnIcon}</div>
        </div>
    </div>
    {#if value && value.length > 0}
        <div class="mainbox flex-column" id={`mainbox-${id}`}>
            {#each value as item, index}
                <div id={index} class="item">
                    {#await ping(item)}
                        <span class="mark"/>
                    {:then res} 
                        <span class="mark" class:online={res}/>
                    {/await}
                    {item} <span on:click={() => deleteItem(item)} class="text-btn">delete</span>
                </div>
            {/each}
        </div>
    {/if}
</div>