<script>
    import { getContext  } from 'svelte';

    //Stores
    import { currentPage } from '../../js/stores/stores.js';
    
    //Images
    import chevronRight from '../../img/menu_icons/icon_chevron-right.svg';

    //Context
    const { switchPage } = getContext('app_functions');

    export let crumb;
    export let index;
    export let last;
</script>

<style>
.box{
    display: flex;
    align-items: center;
    text-align: center;
    width: 180px;
}

.words {
    width: 100%;
    margin-bottom: -4px;
    
}

.pointer{
    cursor: pointer;
}

.link:hover{
    text-decoration: underline;
}

.chevron {
    width: 12px;
    margin-left: 18px;
    margin-top: 5px;
}

.last{
    border-bottom: 4px solid var(--accent-color);
    margin-top: 4px;
}
</style>

<div class="box" class:last={last} class:pointer={!last}>
    {#if index !== 0}
        <div class="chevron">{@html chevronRight}</div>
    {/if}
    {#if crumb.page.name !== ''}
        <span class="words link text-body1" on:click={() => switchPage(crumb.page.name, crumb.page.data)}> {crumb.name} </span>
    {:else}
        <span class="words text-body1"> {crumb.name} </span>
    {/if}
</div>