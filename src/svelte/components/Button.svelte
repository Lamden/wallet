<script>
    import { icons } from '../../js/images.js';

    //Props
    export let name;
    export let click;
    export let icon = '';
</script>

<style>
button{
    display: flex;
    align-items: center;
    background-color: unset;
    width: 145px;
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

.label{
    text-align: center;
    width: 100%;
}

.icon {
    width: 16px;
    margin-right: 4px;
}
</style>

<button on:click={click}>
    {#if icon !== ''}
        <img class="icon" src={icons[icon]} alt='button logo' />
    {/if}
    <div class="label"> {name} </div>
 </button>