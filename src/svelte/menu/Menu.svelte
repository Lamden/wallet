<script>
    //Components
    import { MenuBox }  from '../../js/router.js'
    
    //Images
    import { icons } from '../../js/images.js';

    let menus = [
        {
            heading: 'Wallet',
            items:[
                {id:"holdings", logo: icons.holdings, name: 'Holdings', page: {name: 'CoinsMain'}},
                {id:"history", logo: icons.history, name: 'History', page: {name: 'HistoryMain'}},
                {id:"devtools", logo: icons.devtools, name: 'Developer Tools', page: {name: 'DevToolsMain'}},
                {id:"smart-contracts", logo: icons.smartcontract, name: 'Smart Contracts', page: {name: 'IdeMain'}},
            ]
        },
        {
            heading: 'Safety & Security',
            items:[
                {id:"backup", logo: icons.backup, name: 'Backup Wallet', page: {name: 'Backup'}},
                {id:"restore", logo: icons.restore, name: 'Restore Wallet', page: {name: 'Restore'}},
                {id:"lock", logo: icons.signout, name: 'Sign out & Lock', page: {name: 'LockScreen'}},
            ]
        },
        {
            heading: 'About & Info',
            items:[
                {id:"about", logo: icons.about, name: 'About', page: {name: 'About'}},
                {id:"feedback", logo: icons.feedback, name: 'Give Feedback', page: {name: 'Feedback'}},
            ]
        },
    ]

</script>

<style>
.menus{
    display:flex;
    flex-direction: column;
    padding: 21px 0px 0px 40px;
}
</style>

<div class="menus text-primary">
    {#each menus as menu}
        <MenuBox heading={menu.heading} menuItems={menu.items} />
    {/each}

</div>