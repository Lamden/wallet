

<script>
    import { createEventDispatcher, onMount} from 'svelte';
    const dispatch = createEventDispatcher();

    //Props
    export let id;
    export let label;
    export let initial = '';
    export let items = [];
    export let styles = '';
    export let classes = '';
    export let required = false;

    //DOM Nodes
    let selectElm, customSelectElm, newSelectElm

    let hideBox = true;

    onMount(()=>{
        selectElm.options[0].selected = true;
    })

    function dispatchSelected(selected) {
            let selectedIndex = initial === '' ? selectElm.selectedIndex : selectElm.selectedIndex - 1;
            dispatch('selected', {id, selected: items[selectedIndex]});
    }

    function handleClick(option, index){
        selectElm.options[index].selected = true;
        dispatchSelected()
        toggleBox();
    }

    function toggleBox(){
        hideBox = !hideBox;
    }

</script>

<style>

label{
    position: relative;
    top: 8px;
    left: 12px;
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

.select-selected:after {
    position: absolute;
    content: "";
    top: 36px;
    right: 25px;
    width: 0px;
    height: 0;
    border: 6px solid transparent;
    border-color: var(--font-primary-dark) transparent transparent transparent;
}

.select-selected.select-arrow-active:after {
    border-color: transparent transparent var(--font-primary-dark) transparent;
    top: 28px;
}

.select-items div,.select-selected {
    display: flex;
    align-items: center;
    width: 100%;

    background: none;
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
    background-color: var(--bg-color);
    top: 100%;
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

<div bind:this={customSelectElm} class={`custom-select ${classes}`} style={`width:100%; ${styles}`}>
    <label>{label}</label>
    <select required={required} bind:this={selectElm}>
        {#if initial !== ''}
            <option value={0}>{initial}</option>
        {/if}
        {#each items as item, index}
            <option value={initial === '' ? index : index + 1}>{item.name}</option>
        {/each}
    </select>
    {#if selectElm}
        <div bind:this={newSelectElm} 
             class="select-selected"
             class:select-arrow-active={!hideBox}
             on:click={() => toggleBox()}
             >
            {selectElm.options[selectElm.selectedIndex].innerHTML}
        </div>
        <div class="select-items" class:select-hide={hideBox}>
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


