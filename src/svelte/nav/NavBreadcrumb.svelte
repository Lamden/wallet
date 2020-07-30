<script>
    import { getContext  } from 'svelte';

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
    width: fit-content;
    height: 100%;
    padding: 10px;
    box-sizing: border-box;
}

.words {
    width: 100%;
    margin-bottom: -4px;
    word-break: break-all;
    
}

.pointer{
    cursor: pointer;
}

.link:hover{
    text-decoration: underline;
}

.chevron {
    width: 12px;
    margin: 3px 5px 0;
}

.last{
    border-bottom: 4px solid var(--accent-color);
    margin-top: 4px;
}
</style>

{#if index !== 0}
    <div class="chevron">{@html chevronRight}</div>
{/if}
<div class="box" class:last={last} class:pointer={!last}>
    {#if crumb.page.name !== ''}
        <span class="words link text-body1" on:click={() => switchPage(crumb.page.name, crumb.page.data)}> {crumb.name} </span>
    {:else}
        <span class="words text-body1"> {crumb.name} </span>
    {/if}
</div>