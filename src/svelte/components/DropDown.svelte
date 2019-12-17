

<script>
    import { createEventDispatcher, onMount} from 'svelte';
    const dispatch = createEventDispatcher();

    //Props
    export let id;
    export let label;
    export let defaultText = 'None';
    export let items = [];
    export let styles = '';
    export let width = '100%';
    export let innerHeight = '46px'
    export let classes = '';
    export let required = false;
    export let sideBox = false;

    //DOM Nodes
    let selectElm, customSelectElm, newSelectElm

    let hideBox = true;

    $: selctedBoxTop = `${parseInt(innerHeight.split('px')[0]) + 15}px`;

    onMount(()=>{
        if (selectElm.options){
            items.forEach((item, index) => {
                selectElm.options[index].selected = item.selected;
            })
            dispatchSelected();
        }
    })

    function dispatchSelected() {
        if (selectElm.selectedIndex >= 0) dispatch('selected', {id, selected: items[selectElm.selectedIndex]});
    }

    function handleClick(option, index){
        selectElm.options[index].selected = true;
        dispatchSelected()
        toggleBox();
    }

    function toggleBox(){
        if (items.length > 0) hideBox = !hideBox;
    }

    function handleWindowClick(event) {
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
    font-size: 12px;
    line-height: 16px;
    background: var(--bg-color);
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
    background-color: rgba(0, 0, 0, 0.1);
    border: 1px solid #e0e0e03d;
}

.select-selected.open {
    background-color: rgba(0, 0, 0, 0.1);
    border: 1px solid #e0e0e03d;
    border-radius: 4px 4px 0 0;
}

.select-selected:after {
    display: flex;
    align-items: center;
    margin-top: 3px;
    content: "";
    width: 0px;
    height: 0;
    border: 6px solid transparent;
    border-color: var(--font-primary-dark) transparent transparent transparent;
}

.select-selected.select-arrow-active:after {
    border-color: transparent transparent var(--font-primary-dark) transparent;
    margin-bottom: 8px;
    margin-top: 0px;
}

.select-items div,.select-selected {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    min-height: 42px;

    box-sizing: border-box;
    transition: border 0.5s;
    border-radius: 4px;
    padding: 10px 12px;

    font-style: normal;
    font-weight: normal;
    font-size: 16px;
    line-height: 24px;
    color: var(--font-primary);
    letter-spacing: 0.44px;

    cursor: pointer;
    user-select: none;
}

.select-items {
    position: absolute;
    border: 1px solid #e0e0e03d;
    border-radius: 0 0 4px 4px;
    background-color: var(--bg-color);
    left: 0;
    right: 0;
    z-index: 99;
}

.select-hide {
    display: none;
}

.select-items div:hover, .same-as-selected {
    background-color: #ffffff08;
}

</style>
<svelte:window on:click={(e) => handleWindowClick(e)} />
<div bind:this={customSelectElm} class={`custom-select ${classes}`} style={`width:${width}; `}>
    <label>{label}</label>
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
            {selectElm.options.length > 0 ? selectElm.options[selectElm.selectedIndex].innerHTML : defaultText}
        </div>
        <div class="select-items" style={`top: ${selctedBoxTop}`} class:select-hide={hideBox}>
            {#each selectElm.options as option, index }
                <div class:same-as-selected={selectElm.selectedIndex === index}
                     on:click={() => handleClick(option, index)}
                     >
                     {option.innerHTML}
                </div>
            {/each}  
        </div>
    {/if}
</div>


