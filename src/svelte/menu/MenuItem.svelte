<script>
    import { getContext, beforeUpdate  } from 'svelte';
    import { icons } from '../../js/images.js';

    //Stores
	import { currentPage, password } from '../../js/stores/stores.js';

    //Context
    const { switchPage } = getContext('app_functions');

    //Props
    export let menuItem;

    let feedbackURL = "https://docs.google.com/forms/d/e/1FAIpQLSf-X4wWIDLKAJc9tZBV7vZYYD3qyMGMxbTgij1ltmr8CfSxbw/viewform?usp=sf_link"

    $: isSelected = $currentPage.name === menuItem.page;

    function menuAction(){
        if (menuItem.page.name === "LockScreen") {
            password.set('');
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
    margin: 8px 0;
    height: 32px;
}

.logo{
    position: relative;
    width: 14px;
    height: 14px;
    margin-right: 15px;
}

.name{
    font-size: 14px;
    width: 180px;
    line-height: 20px;
}

.selected{
    background-color: #461BC2;
}
</style>


<div class="item" class:selected={isSelected} on:click={ () => menuAction() }>
    <img class="logo" src={menuItem.logo} alt="menu item logo"/>
    <span class="name"> {menuItem.name} </span>
</div>
