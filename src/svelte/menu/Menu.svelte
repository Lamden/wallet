<script>
    //Components
	import { MenuBox }  from '../../js/router.js'

    import { icons } from '../../js/images.js';

    let menus = [
        {
            heading: 'Wallet',
            items:[
                {logo: icons.holdings, name: 'Holdings', page: {name: 'CoinsMain'}},
                {logo: icons.history, name: 'History', page: {name: 'HistoryMain'}},
                {logo: icons.devtools, name: 'Developer Tools', page: {name: 'DevToolsMain'}},
            ]
        },
        {
            heading: 'Safety & Security',
            items:[
                {logo: icons.backup, name: 'Backup Wallet', page: {name: 'BackupMain'}},
                {logo: icons.restore, name: 'Restore Wallet', page: {name: 'RestoreMain'}},
                {logo: icons.signout, name: 'Sign out & Lock', page: {name: 'LockScreen'}},
            ]
        },
        {
            heading: 'About & Info',
            items:[
                {logo: icons.about, name: 'About', page: {name: 'About'}},
                {logo: icons.feedback, name: 'Give Feedback', page: {name: 'Feedback'}},
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