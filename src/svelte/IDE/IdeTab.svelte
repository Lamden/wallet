<script>
	import { scale } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
    
	//Stores
    import { FilesStore, currentNetwork, clicked } from '../../js/stores/stores.js';

    //Images
    import del from '../../img/menu_icons/icon_delete.svg';
    import connected from '../../img/menu_icons/icon_connected.svg';

    //Props
    export let file;
    export let index;


    let tabName = file.name;
    let rename = false;

    const selectTab = () => {
        FilesStore.activeTab(index);
    }

    const closeTab = () => {
        FilesStore.deleteTab(index);
    }

    const renameTab = () => {
        if (file.type === 'local') rename = true;
    }

    const saveName = () => {
        FilesStore.changeName(tabName, index);
        rename = false;
    }

    clicked.subscribe(event => {
        if (rename && event.id !== `tab-${index}`) saveName();
    })

    const handleKeyUp = (e) => {
        if (e.keyCode === 13) {
            saveName();
        }    
    }

</script>

<style>
.tab-box{
    padding: 10px;
    margin: 2px;
    border-radius: 10px;
    background-color: var(--bg-secondary);
    align-items: center;
    border: 1px solid transparent;
    cursor: pointer;
}
.tab-box:hover{
    border: 1px dashed var(--font-accent);
    position: relative;
    top: -1px;
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
    background-color: var(--bg-secondary);
    border: 1px solid var(--font-accent);
    color: var(--font-primary);
}
</style>

<div class="tab-box flex-row" 
    class:selected={file.selected} 
    on:click={selectTab}
    title={file.type === 'online' ? `Contract is on ${$currentNetwork.name}` : ""}
    in:scale="{{duration: 1000, delay: 0, opacity: 0.0, start: 0.25, easing: quintOut}}"
    >

    {#if file.type === 'online'}
        <div class="icons connected-icon">{@html connected}</div>
    {/if}
    {#if !rename}
        <div on:dblclick={() => rename = true}>{`${file.name}`}</div>
    {:else}
        <input id={`tab-${index}`} bind:value={tabName} class="rename" type="text" on:keyup={handleKeyUp}/>
    {/if}
    {#if file.selected}
        <div class="icons" on:click={closeTab} title="Close Tab">{@html del}</div>
    {/if}
</div>