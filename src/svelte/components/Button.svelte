<script>
    import { icons } from '../../js/images.js';

    //Props
    export let name;
    export let click;
    export let icon = '';
    export let iconPosition = 'before';
    export let width = 'unset';
    export let height = 'unset';
    export let padding = 'unset';
    export let margin = 'unset';
    export let classes = 'button__solid';
    export let styles = '';
    export let disabled = false;

    $: iconAfter = iconPosition === 'after' ? true : false;
</script>

<style>

.button{
    display: flex;
    flex-direction: row;
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

.icon {
    width: 16px;
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
</style>

<button class={`${classes}`}
        on:click={click}
        disabled={disabled}
        style="width: {width}; height: {height}; padding: {padding}; margin: {margin}; {styles}"
        class:icon-after={iconAfter}
    >

    {#if icon !== ''}
        <img class="icon" class:icon-left={!iconAfter} class:icon-right={iconAfter} src={icons[icon]} alt='button logo' />
    {/if}

    <div class="text-button" class:lable-left={iconAfter} class:lable-right={!iconAfter}> {name} </div>
 </button>