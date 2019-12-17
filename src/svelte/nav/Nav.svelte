<script>
    //Stores
    import { breadcrumbs } from '../../js/stores/stores.js';

    //Components
    import NavLogo from './NavLogo.svelte';
    import NavBreadcrumb from './NavBreadcrumb.svelte';
    import NavControls from './NavControls.svelte';

</script>

<style>
.nav{
    display: flex;
    flex-direction: row;
    position: absolute;
    left: 0%;
    right: 0%;
    top: 0%;
    bottom: 0%;
    right: 0;
    height: 97px;
    background-color: var(--bg-color);
    z-index: 50;
    border-bottom: 1px solid #3D3D3D;
}

.breadcrumbs{
    display: flex;
    width: 75%;
}
</style>

<div class="nav text-primary">
    <NavLogo />
    <div class="breadcrumbs">
        {#each $breadcrumbs as crumb, index}
            <NavBreadcrumb crumb={crumb} {index} last={($breadcrumbs.length -1) === index}/>
        {/each}
    </div>
    <!-- To return one day <NavControls />-->
</div>
