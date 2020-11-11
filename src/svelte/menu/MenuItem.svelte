<script>
    import { getContext  } from 'svelte';

    //Stores
	import { currentPage, needsBackup } from '../../js/stores/stores.js';

    //Context
    const { switchPage } = getContext('app_functions');

    //Props
    export let menuItem;
    export let iconLookup;

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

.item:hover > .floating-label{
    display: block;
    position: absolute;
    top: inherit;
    left: 50px;
    z-index: 100;
    width: fit-content;
    width: 110px;
    background-color: var(--bg-secondary);
    padding: 9px
}

.item:hover{
    filter: brightness(125%)
}

.floating-label{
    display: none;
}

.notselected:hover{
    background-color: var(--bg-secondary);
}

.logo{
    width: 18px;
    height: 18px;
    margin: 0 auto;
}

.name{
    display: none
}

.selected{
    background-color: var(--primary-color);
}

.warning{
    color: var(--font-warning);
}

@media (min-width: 900px) {
    .floating-label{
        display: none;
    }
    .item:hover > .floating-label{
        display: none;
        background-color: unset;
    }
    .name{
        display: block;
        font-size: 14px;
        width: 180px;
        line-height: 20px;
    }
    .logo{
        position: relative;
        top: -1px;
        width: 14px;
        height: 14px;
        margin-right: 15px;
    }
}
</style>


<div id={menuItem.id} 
     class="item" 
     class:selected={isSelected} 
     class:notselected={!isSelected} 
     on:click={ () => menuAction() }
    >
    <div class="logo">{@html iconLookup[menuItem.logo]}</div>
    <span class="name" class:warning={backupPage && $needsBackup}> {menuItem.name} </span>
    <div class="floating-label text-subtitle2 ">
        {menuItem.name}
    </div>
</div>

