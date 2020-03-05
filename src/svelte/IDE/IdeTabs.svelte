<script>
    import { getContext } from 'svelte'

	//Stores
    import { FilesStore, currentNetwork, networkKey } from '../../js/stores/stores.js';

	//Components
    import { IdeTab }  from '../Router.svelte'
    
    //Images
    import plus from '../../img/menu_icons/icon_plus.svg';

    //Context
    const { openModal } = getContext('app_functions');

    const addTab = () => {
        openModal('IdeModelNewTab');
    }

</script>

<style>
.new-button{
    display: flex;
    align-items: center;
}
.plus-icon{
    width: 20px;
    margin: 0 5px;
}
</style>

<div class="flex-row">
<div class="new-button" on:click={addTab}>
    <div class="plus-icon" >{@html plus}</div>
</div>
{#each $FilesStore as file, index}
    <IdeTab {file} {index} />
{/each}
</div>
