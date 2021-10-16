<script>
    import whitelabel from '../../../whitelabel.json'
    
    import { fly } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
    
    //Components
    import { MenuBox }  from '../Router.svelte'

    //Icons
    import AccountsIcon from '../icons/menu/AccountsIcon.svelte'
    import IdeIcon from '../icons/menu/IdeIcon.svelte'
    import SwapIcon from '../icons/menu/SwapIcon.svelte'
    import DevToolsIcon from '../icons/menu/DevToolsIcon.svelte'
    import BackupIcon from '../icons/menu/BackupIcon.svelte'
    import RestoreIcon from '../icons/menu/RestoreIcon.svelte'
    import SignOutIcon from '../icons/menu/SignOutIcon.svelte'
    import AboutIcon from '../icons/menu/AboutIcon.svelte'
    import FeedbackIcon from '../icons/menu/FeedbackIcon.svelte'
    import AppIcon from '../icons/menu/AppIcon.svelte'

    const icons = {
        account: AccountsIcon,
        app: AppIcon,
        ide: IdeIcon,
        swap: SwapIcon,
        devtools: DevToolsIcon,
        backup: BackupIcon,
        restore: RestoreIcon,
        signout: SignOutIcon,
        about: AboutIcon,
        feedback: FeedbackIcon
    }

    let menus = whitelabel.menu

</script>

<style>
.menus{
    position: fixed;
    padding: 21px 0px 0px 40px;
    width: 46px;
}

@media (min-width: 900px) {
    .menus{
        width: 240px;
    }
}

</style>

<div class="menus flex-column text-primary" in:fly="{{delay: 0, duration: 500, x: -50, y: 0, opacity: 0.0, easing: quintOut}}">
    {#each menus as menu}
        {#if menu.show}
            <MenuBox heading={menu.heading} menuItems={menu.items} {icons}/>
        {/if}
    {/each}
</div>