<script>
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    //Props
    export let label = '';
    export let placeholder = '';
    export let intputType = '';
    export let pattern;
    export let required = false;

    let thisInput;

    function dispatchChanged() {
        dispatch('changed', thisInput);
    }

</script>

<style>

label{
    position: relative;
    top: 8px;
    left: 12px;
    font-style: normal;
    font-weight: normal;
    font-size: 12px;
    line-height: 16px;
    background: var(--bg-color);
    padding: 0 4px;
}

input{
    display: flex;
    align-items: center;

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
    color: var(--font-color);

    letter-spacing: 0.44px;
}

input:focus{
    outline: none; 
    border: 1px solid var(--primary-color);

}

input::-webkit-input-placeholder { 
    font-style: normal;
    font-weight: normal;
    font-size: 16px;
    line-height: 24px;
    display: flex;
    align-items: center;
    letter-spacing: 0.44px;
    color: var(--font-color)
}
</style>

<div class="inputbox">
    <label> {label} </label>
    <input 
        bind:this={thisInput}
        on:change={() => dispatchChanged()}
        class="input:required:invalid input:focus:invalid"
        type="password"
        pattern={pattern}
        placeholder={placeholder}
        required={required}  />
</div>