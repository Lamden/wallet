<script>
    import { getContext  } from 'svelte';

    //Stores
	import { currentPage, needsBackup } from '../../js/stores/stores.js';

    //Context
    const { switchPage } = getContext('app_functions');

    //Images
    import warningIcon from '../../img/menu_icons/icon_warning.svg'

    //Props
    export let menuItem;

    let feedbackURL = "https://docs.google.com/forms/d/e/1FAIpQLSf-X4wWIDLKAJc9tZBV7vZYYD3qyMGMxbTgij1ltmr8CfSxbw/viewform?usp=sf_link"

    $: isSelected = $currentPage.name === menuItem.page.name;
    $: backupPage = menuItem.name === 'Backup Wallet'

    const menuAction = () => {
        if (menuItem.page.name === "LockScreen") {
            chrome.runtime.sendMessage({type: 'lockWallet'});
            return
        }
        if (menuItem.page.name === 'Feedback'){
             window.open(feedbackURL, '_blank');
             return
        }
        switchPage(menuItem.page.name)
    }
</script>

<style>
.item{
    display:flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    cursor: pointer;
    margin: 2px 0;
    height: 32px;
    padding: 6px 0;
    border-radius: 3px;
}

.notselected:hover{
    background-color: var(--bg-color-grey);
}

.logo{
    position: relative;
    top: -1px;
    width: 14px;
    height: 14px;
    margin-right: 15px;
}

.name{
    display: none
}

.selected{
    background-color: #461BC2;
}
.warning-icon{
    width: 18px;
    margin-right: 29px;
    margin-left: -47px;
}

@media (min-width: 900px) {
    .name{
        display: block;
        font-size: 14px;
        width: 180px;
        line-height: 20px;
    }
}
</style>


<div id={menuItem.id} class="item" class:selected={isSelected} class:notselected={!isSelected} on:click={ () => menuAction() }>
    <div class="logo">{@html menuItem.logo}</div>
    <span class="name"> {menuItem.name} </span>
    {#if backupPage && $needsBackup}
        <div class="warning-icon">
            {@html warningIcon}
        </div>
    {/if}
</div>
