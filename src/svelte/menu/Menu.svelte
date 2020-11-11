<script>
    import whitelabel from '../../../whitelabel.json'
    
    import { fly } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
    
    //Components
    import { MenuBox }  from '../Router.svelte'
    
    //Images
    import about from '../../img/menu_icons/icon_about.svg';
    import backup from '../../img/menu_icons/icon_backup.svg';
    import devtools from '../../img/menu_icons/icon_devtools.svg';
    import feedback from '../../img/menu_icons/icon_feedback.svg';
    import history from '../../img/menu_icons/icon_history.svg';
    import holdings from '../../img/menu_icons/icon_holdings.svg';
    import restore from '../../img/menu_icons/icon_restore.svg';
    import signout from '../../img/menu_icons/icon_signout.svg';
    import ide from '../../img/menu_icons/icon_ide.svg';
    import swap from '../../img/menu_icons/icon_swap.svg';

    const iconLookup = {
        "about": about,
        "backup": backup,
        "devtools": devtools,
        "feedback": feedback,
        "history": history,
        "holdings": holdings,
        "restore": restore,
        "signout": signout,
        "ide": ide,
        "swap": swap
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
            <MenuBox heading={menu.heading} menuItems={menu.items} {iconLookup}/>
        {/if}
    {/each}
</div>