<script>
	import { scale } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
    
	//Stores
    import { FilesStore, currentNetwork, clicked } from '../../js/stores/stores.js';

    //Icons
    import ConnectedIcon from '../icons/ConnectedIcon.svelte'
    import CloseIcon from '../icons/CloseIcon.svelte'

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
    margin: 5px;
    border-radius: 10px;
    background-color: var(--bg-secondary);
    align-items: center;
    border: 1px solid transparent;
    cursor: pointer;
    box-shadow: var(--box-shadow-1);
    -webkit-box-shadow: var(--box-shadow-1);
    -moz-box-shadow: var(--box-shadow-1);
}
.tab-box:hover{
    border: 1px dashed var(--font-accent);
    position: relative;
    top: -1px;
}
.selected{
    background-color: var(--primary-color);
    color: var(--color-white);
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
        <ConnectedIcon width="14px" margin="0 5px 0 0" color={file.selected ? "var(--color-white)" : "var(--font-primary)"} />
    {/if}
    {#if !rename}
        <div on:dblclick={() => rename = true}>{`${file.name}`}</div>
    {:else}
        <input id={`tab-${index}`} bind:value={tabName} class="rename" type="text" on:keyup={handleKeyUp}/>
    {/if}
    {#if file.selected}
        <div on:click={closeTab} title="Close Tab">
            <CloseIcon width="14px" margin="0 0 -3px 5px" color="var(--font-primary-dim)"/>
        </div>
    {/if}
</div>