<script>
    import MenuBox from './MenuBox.svelte'

    import { menuIcons } from '../../js/icons.js';

    let menus = [
        {
            heading: 'Wallet',
            items:[
                {logo: menuIcons.holdings, name: 'Holdings', page: 'CoinsMain'},
                {logo: menuIcons.history, name: 'History', page: 'Transaction'},
                {logo: menuIcons.devtools, name: 'Developer Tools', page: 'DevTools'},
            ]
        },
        {
            heading: 'Safety & Security',
            items:[
                {logo: menuIcons.backup, name: 'Backup Wallet', page: 'BackupMain'},
                {logo: menuIcons.restore, name: 'Restore Wallet', page: 'RestoreMain'},
                {logo: menuIcons.signout, name: 'Sign out & Lock', page: 'LockScreen'},
            ]
        },
        {
            heading: 'About & Info',
            items:[
                {logo: menuIcons.about, name: 'About', page: 'About'},
                {logo: menuIcons.feedback, name: 'Give Feedback', page: 'FeedBack'},
            ]
        },
    ]

</script>

<style>
.menus{
    display:flex;
    flex-direction: column;
    padding: 21px 66px 0px 40px;
}
</style>

<div class="menus">
    {#each menus as menu}
        <MenuBox heading={menu.heading} menuItems={menu.items} />
    {/each}

</div>