

<script>
    import { createEventDispatcher, onMount, afterUpdate, beforeUpdate} from 'svelte';
    const dispatch = createEventDispatcher();

    //Props
    export let id;
    export let label;
    export let backgroundColor = label === '' ? 'transparent' : '';
    export let defaultText = 'None';
    export let items = [];
    export let styles = '';
    export let width = '100%';
    export let margin = 'unset'
    export let innerHeight = 'unset'
    export let classes = '';
    export let required = false;
    export let sideBox = false;

    //DOM Nodes
    let selectElm, customSelectElm, newSelectElm

    let hideBox = true;

    $: displayItems = [...items]

    onMount(()=>{
        if (selectElm.options){
            items.forEach((item, index) => {
                selectElm.options[index].selected = item.selected;
            })
            dispatchSelected();
        }
    })


    const dispatchSelected = ()  => {
        if (selectElm.selectedIndex >= 0) dispatch('selected', {id, selected: items[selectElm.selectedIndex]});
    }

    const handleClick = (option, index) => {
        selectElm.options[index].selected = true;
        dispatchSelected()
        toggleBox();
    }

    const toggleBox = () => {
        if (items.length > 0) hideBox = !hideBox;
    }

    const handleWindowClick = (event) => {
        if (!customSelectElm) return;
        if (customSelectElm.contains(event.target)) return;
        hideBox = true;
    }

</script>

<style>

label{
    position: relative;
    top: 8px;
    left: 9px;
    font-style: normal;
    font-weight: normal;
    font-size: 11px;
    line-height: 16px;
    padding: 0 4px;
    color: var(--font-primary);
}

.custom-select {
    position: relative;
    font-family: Arial;
}

.custom-select select {
    display: none;
}

.select-selected {
    border: 1px solid #e0e0e03d;
    border-radius: 4px;
}

.select-selected.open {
    border: 1px solid #e0e0e03d;
    border-radius: 4px 4px 0 0;
    overflow-x: hidden;
}

.select-selected:after {
    margin-top: 2px;
    content: "";
    border: 6px solid transparent;
    border-color: var(--font-primary-dark) transparent transparent transparent;
    position: absolute;
    top: 53%;
    right: 15px;
}

.select-selected.select-arrow-active:after {
    border-color: transparent transparent var(--font-primary-dark) transparent;
    margin-top: -5px;
}

.select-items div,.select-selected {
    max-width: 100%;

    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;

    box-sizing: border-box;
    transition: border 0.5s;
    padding: 12px 32px 12px 13px;
    font-style: normal;
    font-weight: normal;
    font-size: 1.1em; 
    line-height: 1; 
    color: var(--font-primary);
    letter-spacing: 0.44px;

    cursor: pointer;
    user-select: none;
}

.select-items {
    position: absolute;
    border: 1px solid #e0e0e03d;
    background-color: #262626;
    border-radius: 0 0 4px 4px;
    left: 0;
    right: 0;
    margin-top: -1px;
    z-index: 99;
}

.select-hide {
    display: none;
}

.select-items div:hover {
    background-color: #ffffff38;
    border-radius: 0px;
}

.same-as-selected {
    background-color: #ffffff18;
    border-radius: 0px;
}

</style>
<svelte:window on:click={(e) => handleWindowClick(e)} />
<div bind:this={customSelectElm} class={`custom-select ${classes}`} style={`width:${width}; margin:${margin}`}>
    <label style={`background: ${backgroundColor || 'var(--bg-color)'};`}>{label}</label>
    <select id={id} required={required} bind:this={selectElm}>
        {#each items as item, index}
            <option id={`coin-${index}`} value={index}>{item.name}</option>
        {/each}
    </select>
    {#if selectElm}
        <div bind:this={newSelectElm} 
             class="select-selected"
             style={`height: ${innerHeight}; width:${width}; ${styles}`}
             class:select-arrow-active={!hideBox}
             class:open={!hideBox}
             on:click={() => toggleBox()}
             >
            {selectElm.options.length > 0 ? displayItems[selectElm.selectedIndex].name : defaultText}
        </div>
        <div class="select-items" class:select-hide={hideBox}>
            {#each displayItems as item, index }
                <div class:same-as-selected={selectElm.selectedIndex === index}
                     on:click={() => handleClick(selectElm.options[index], index)}>
                     {item.name}
                </div>
            {/each}  
        </div>
    {/if}
</div>


