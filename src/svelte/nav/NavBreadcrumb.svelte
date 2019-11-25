<script>
    import { getContext  } from 'svelte';

    //Stores
    import { currentPage } from '../../js/stores/stores.js';
    
    //Misc
    import { icons } from '../../js/images.js';

    //Context
    const { switchPage } = getContext('switchPage');

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
}

.link:hover{
    text-decoration: underline;
    cursor: pointer;
}

.chevron {
    width: 12px;
    min-height: 17px;
    margin-left: 18px;
}

.last{
    border-bottom: 4px solid var(--accent-color);
}
</style>

<div class="box" class:last={last}>
    {#if index !== 0}
        <img class="chevron" src={icons.chevronRight} alt="right chevron" />
    {/if}
    {#if crumb.page !== ''}
        <span class="words link text-body1" on:click={() => switchPage(crumb.page)}> {crumb.name} </span>
    {:else}
        <span class="words text-body1"> {crumb.name} </span>
    {/if}
</div>