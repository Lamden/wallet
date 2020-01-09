<script>

	//Stores
    import { FilesStore, currentNetwork } from '../../js/stores/stores.js';

    //Images
    import { icons } from '../../js/images.js';
    const { del, connected } = icons;

    //Props
    export let file;
    export let index;

    let rename = false;

    function selectTab(){
        FilesStore.activeTab(index);
    }

    function closeTab(){
        FilesStore.deleteTab(index);
    }

    function renameTab(){
        if (file.type === 'local') rename = true;
    }

    function saveName(e){
        if (e.keyCode === 13) {
            FilesStore.changeName(e.target.value, index);
            rename = false;
        }
    }

</script>

<style>
.tab-box{
    padding: 10px;
    margin: 0 2px;
    border-radius: 5px 5px 0 0;
    background-color: var(--bg-color-grey);
    align-items: center;
}
.selected{
    background-color: var(--primary-color)
}
.icons{
    margin-left: 5px;
    height: 14px;
}

.connected-icon{
    margin-right: 5px;
}
.rename{
    background-color: #00000000;
    border: none;
}
</style>

<div class="tab-box flex-row" class:selected={file.selected} on:click={selectTab}>
    {#if file.type === 'online'}
        <img class="icons connected-icon" src={connected} alt="contract online" title={`Contract is on ${$currentNetwork.name}`} />
    {/if}
    {#if !rename}
        <div on:dblclick={() => rename = true}>{`${file.name}`}</div>
    {:else}
        <input value={file.name} class="rename" type="text" on:keyup={saveName}/>
    {/if}
    {#if file.selected}
        <img class="icons" src={del} alt="close tab" title="Close Tab" on:click={closeTab} />
    {/if}
</div>