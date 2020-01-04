<script>
	//Stores
    import { FilesStore } from '../../js/stores/stores.js';

	//Components
    import { IdeTab }  from '../../js/router.js'
    
    //Images
    import { icons } from '../../js/images.js';
    const { plus } = icons;

    function addTab(){
        FilesStore.addNewTab();
    }

</script>

<style>
.new-button{
    display: flex;
    align-items: center;
}
.plus-icon{
    height: 20px;
    margin: 0 5px;
}
</style>

<div class="flex-row">
<div class="new-button" on:click={addTab}>
    <img class="plus-icon" src={plus} alt="new-button" />
</div>
{#each $FilesStore as file, index}
    <IdeTab {file} {index} />
{/each}
</div>
