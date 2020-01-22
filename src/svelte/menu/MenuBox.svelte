<script>
    //Components
	import { MenuItem }  from '../Router.svelte'

    //Props
    export let menuItems;
    export let heading;

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
    margin-left: 31px;
}
</style>

<div class="box">
    <div class="header">
        <h3 > {heading} </h3>
    </div>
    
    {#each menuItems as menuItem}
        <MenuItem {menuItem} />
    {/each}
</div>