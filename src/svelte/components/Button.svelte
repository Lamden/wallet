<script>
    import { icons } from '../../js/images.js';

    //Props
    export let name;
    export let click;
    export let icon = '';
    export let type = 'solid';
    export let width = 'unset';
    export let height = 'unset';
    export let padding = 'unset';
    export let styles = '';
</script>

<style>

.transparent{
    display: flex;
    align-items: center;
    background-color: unset;
    border: unset;
    border: 1px solid rgb(255, 255, 255, 0.38);
    border-radius: 4px;
    color: #fff;
    padding: 13px 8px 13px 12px;
    letter-spacing: 0.75px;
    text-transform: uppercase;
    font-weight: 500;
    font-size: 14px;
    line-height: 16px;
}

.transparent:hover{
    background-color: rgba(255, 255, 255, 0.25);
}

.solid{
    display: flex;
    align-items: center;
    background-color: unset;
    border: unset;
    background: #303030;
    box-shadow: 0px 1px 8px rgba(0, 0, 0, 0.1), 0px 2px 4px rgba(0, 0, 0, 0.12), 0px 1px 2px rgba(0, 0, 0, 0.16);
    border-radius: 4px;
    font-style: normal;
    font-weight: 500;
    font-size: 14px;
    line-height: 16px;
    display: flex;
    align-items: center;
    text-align: center;
    letter-spacing: 0.75px;
    text-transform: uppercase;
    color: #FFFFFF;
}

.purple{
    background: #461BC2;
}

.label{
    text-align: center;
    width: 100%;
}

.icon {
    width: 16px;
    margin-right: 4px;
}
</style>

<button class={type}
        on:click={click}
        style="width: {width}; height: {height}; padding: {padding}; {styles}">
    {#if icon !== ''}
        <img class="icon" src={icons[icon]} alt='button logo' />
    {/if}
    <div class="label"> {name} </div>
 </button>