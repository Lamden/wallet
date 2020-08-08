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
    background: #262626;
    box-shadow: 0px 1px 2px #0823303d, 0px 2px 6px #08233029;
    border-radius: 4px;
    margin-bottom: 7px;
}

.header{
    display: none;

}

@media (min-width: 900px) {
    .header{
        display: flex;
        flex-direction: row;
        align-content: center;
        margin-left: 31px;
    }
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