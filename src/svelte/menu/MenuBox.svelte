<script>
    import { getContext  } from 'svelte';
    import { icons } from '../../js/images.js';

    //Stores
	import { currentPage, password } from '../../js/stores/stores.js';

    //Context
    const { switchPage } = getContext('switchPage');

    //Props
    export let menuItems;
    export let heading;
    

    function isSelected(page){
        return $currentPage.name === page;
    }

    function menuAction(item){
        if (item.page === "LockScreen") {
            password.set('');
            return
        }
        switchPage(item.page)
    }

</script>

<style>
.box{
    display: flex;
    flex-direction: column;
    background: rgba(38, 38, 38, 0.64);
    box-shadow: 0px 1px 2px rgba(8, 35, 48, 0.24), 0px 2px 6px rgba(8, 35, 48, 0.16);
    border-radius: 4px;
    margin-bottom: 7px;
}

.header{
    display: flex;
    flex-direction: row;
    align-content: center;
}

.header-chevron{
    width: 12px;
    margin: 0 9px 0 10px;
}

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

<div class="box">
    <div class="header">
        <img class="header-chevron" src={icons.chevronDown} alt="menu chevron" />
        <h3 > {heading} </h3>
    </div>
    
    {#each menuItems as item}
        <div class="item" class:selected={isSelected(item.page)} on:click={ () => menuAction(item) }>
            <img class="logo" src={item.logo} alt="menu item logo"/>
            <span class="name"> {item.name} </span>
        </div>
    {/each}
</div>