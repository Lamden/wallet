<script>
	import { scale } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
    //Props
    export let id;
    export let name = '';
    export let click;
    export let icon = '';
    export let iconWidth = '14px';
    export let iconPosition = 'before';
    export let iconInvert = false;
    export let width = 'unset';
    export let height = '42px';
    export let padding = '0 16px';
    export let margin = 'unset';
    export let classes = 'button__solid';
    export let styles = '';
    export let disabled = false;
    export let tabIndex;
    export let spellcheck = true;

    $: iconAfter = iconPosition === 'after' ? true : false;
</script>

<style>
button{
    display: flex;
    flex-direction: row;
    justify-content: center;
}

.label{
    text-align: center;
    width: 100%;
}

.label-left{
    margin: 0 0 0 11px; 
}

.label-right{
    margin: 0 11px 0 0; 
}

.icon-left {
    margin: 0 8px 0 0;   
}

.icon-right {
    margin: 0 0 0 8px;
}

.icon-after{
    flex-direction: row-reverse;
}

.icon-invert{
    filter: invert(1);
}
.disabled{
    color: grey;
}
.disabled.button__purple:hover{
    background: #461bc233;
}
.disabled.button__purple{
    background: #461bc233;
}

</style>

<button 
        class={`${disabled ? 'disabled ' : ''}${classes}`}
        id={id}
        on:click={click}
        disabled={disabled}
        style="min-width: fit-content; width: {width}; height: {height}; padding: {padding}; margin: {margin}; {styles}"
        class:icon-after={iconAfter}
        
        tabIndex={tabIndex}
        type="button"
        in:scale="{{duration: 500, delay: 0, opacity: 0, start: 0.75, easing: quintOut}}"
    >

    {#if icon !== ''}
        <div style={`width: ${iconWidth};`} 
            class:icon-left={!iconAfter} 
            class:icon-right={iconAfter}
            class:icon-invert={iconInvert}>{@html icon}</div>
    {/if}

    <div class="text-button" class:lable-left={iconAfter} class:lable-right={!iconAfter}> {name} </div>
 </button>