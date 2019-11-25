<script>
    import { icons } from '../../js/images.js';

    //Props
    export let name;
    export let click;
    export let icon = '';
    export let width = 'unset';
    export let height = 'unset';
    export let padding = 'unset';
    export let margin = 'unset';
    export let style = 'button__solid';
    export let styles = '';
</script>

<style>

.label{
    text-align: center;
    width: 100%;
}

.icon {
    width: 16px;
    margin-right: 4px;
}
</style>

<button class={style}
        on:click={click}
        style="width: {width}; height: {height}; padding: {padding}; margin: {margin}; {styles}">
    {#if icon !== ''}
        <img class="icon" src={icons[icon]} alt='button logo' />
    {/if}
    <div class="label"> {name} </div>
 </button>