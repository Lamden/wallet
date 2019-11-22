<script>
    import MenuBox from './MenuBox.svelte'

    import { icons } from '../../js/images.js';

    let menus = [
        {
            heading: 'Wallet',
            items:[
                {logo: icons.holdings, name: 'Holdings', page: 'CoinsMain'},
                {logo: icons.history, name: 'History', page: 'Transaction'},
                {logo: icons.devtools, name: 'Developer Tools', page: 'DevTools'},
            ]
        },
        {
            heading: 'Safety & Security',
            items:[
                {logo: icons.backup, name: 'Backup Wallet', page: 'BackupMain'},
                {logo: icons.restore, name: 'Restore Wallet', page: 'RestoreMain'},
                {logo: icons.signout, name: 'Sign out & Lock', page: 'LockScreen'},
            ]
        },
        {
            heading: 'About & Info',
            items:[
                {logo: icons.about, name: 'About', page: 'About'},
                {logo: icons.feedback, name: 'Give Feedback', page: 'FeedBack'},
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

<div class="menus">
    {#each menus as menu}
        <MenuBox heading={menu.heading} menuItems={menu.items} />
    {/each}

</div>