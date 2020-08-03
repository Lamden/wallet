<script>
	//Components
    import { NavLogo, NavControls }  from '../Router.svelte'

</script>

<style>
.nav{
    display: flex;
    flex-direction: row;
    position: fixed;
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
.spacer{
    flex-grow: 1;
}
</style>

<div class="nav text-primary">
    <NavLogo />
    <div class="spacer" />
    <NavControls />
</div>
