<script>
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
    import smartcontract from '../../img/menu_icons/icon_smartcontract.svg';

    let menus = [
        {
            heading: 'Wallet',
            items:[
                {id:"holdings", logo: holdings, name: 'Holdings', page: {name: 'CoinsMain'}},
                {id:"history", logo: history, name: 'History', page: {name: 'HistoryMain'}},
                {id:"devtools", logo: devtools, name: 'Developer Tools', page: {name: 'DevToolsMain'}},
                {id:"smart-contracts", logo: smartcontract, name: 'Smart Contracts', page: {name: 'IdeMain'}},
            ]
        },
        {
            heading: 'Safety & Security',
            items:[
                {id:"backup", logo: backup, name: 'Backup Wallet', page: {name: 'Backup'}},
                {id:"restore", logo: restore, name: 'Restore Wallet', page: {name: 'Restore'}},
                {id:"lock", logo: signout, name: 'Sign out & Lock', page: {name: 'LockScreen'}},
            ]
        },
        {
            heading: 'About & Info',
            items:[
                {id:"about", logo: about, name: 'About', page: {name: 'About'}},
                {id:"feedback", logo: feedback, name: 'Give Feedback', page: {name: 'Feedback'}},
            ]
        },
    ]

</script>

<style>
.menus{
    padding: 21px 0px 0px 40px;
    width: 46px;
    
}

@media (min-width: 900px) {
    .menus{
        width: unset;
    }
}

</style>

<div class="menus flex-column text-primary">
    {#each menus as menu}
        <MenuBox heading={menu.heading} menuItems={menu.items} />
    {/each}
</div>