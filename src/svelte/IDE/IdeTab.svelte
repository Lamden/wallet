<script>
	//Stores
    import { FilesStore, currentNetwork } from '../../js/stores/stores.js';

    //Images
    import del from '../../img/menu_icons/icon_delete.svg';
    import connected from '../../img/menu_icons/icon_connected.svg';

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
    width: 14px;
    position: relative;
    top: 1px;
}

.connected-icon{
    margin-right: 5px;
    margin-left: 0;
}
.rename{
    background-color: #00000000;
    border: none;
}
</style>

<div class="tab-box flex-row" 
     class:selected={file.selected} 
     on:click={selectTab}
     title={file.type === 'online' ? `Contract is on ${$currentNetwork.name}` : ""}
     >

    {#if file.type === 'online'}
        <div class="icons connected-icon">{@html connected}</div>
    {/if}
    {#if !rename}
        <div on:dblclick={() => rename = true}>{`${file.name}`}</div>
    {:else}
        <input value={file.name} class="rename" type="text" on:keyup={saveName}/>
    {/if}
    {#if file.selected}
        <div class="icons" on:click={closeTab} title="Close Tab">{@html del}</div>
    {/if}
</div>