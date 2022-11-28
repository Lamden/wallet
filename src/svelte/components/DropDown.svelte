<script>
  import {
    createEventDispatcher,
    onMount,
    afterUpdate,
    beforeUpdate,
  } from "svelte";
  import TokenLogo from "./TokenLogo.svelte";
  import Identicons from "./Identicons.svelte";
  const dispatch = createEventDispatcher();

  //Props
  export let id;
  export let label;
  export let defaultText = "None";
  export let items = [];
  export let styles = "";
  export let width = "100%";
  export let maxWidth = "unset";
  export let margin = "unset";
  export let innerHeight = "unset";
  export let classes = "";
  export let required = false;
  export let sideBox = false;
  export let boxHeight = "242px";
  export let bgStyle = "primary";
  export let logoWidth = "20px";
  export let disabled = false;
  // if network dropdown
  export let network = false;

  export let labelcolor;

  //DOM Nodes
  let selectElm, customSelectElm, newSelectElm;

  let hideBox = true;

  $: displayItems = [...items];

  onMount(() => {
    if (selectElm.options) {
      items.forEach((item, index) => {
        selectElm.options[index].selected = item.selected;
      });
      dispatchSelected();
    }
  });

  const dispatchSelected = () => {
    if (selectElm.selectedIndex >= 0)
      dispatch("selected", { id, selected: items[selectElm.selectedIndex] });
  };

  export const handleClick = (option, index) => {
    selectElm.options[index].selected = true;
    dispatchSelected();
    toggleBox();
  };

  const toggleBox = () => {
    if (disabled) return;
    if (items.length > 0) hideBox = !hideBox;
  };

  const handleWindowClick = (event) => {
    if (!customSelectElm) return;
    if (customSelectElm.contains(event.target)) return;
    hideBox = true;
  };
</script>

<svelte:window on:click={(e) => handleWindowClick(e)} />
<div
  bind:this={customSelectElm}
  class={`custom-select ${classes}`}
  style={`width:${width}; margin:${margin}; max-width: ${maxWidth}; background: var(--bg-${bgStyle})`}
>
  {#if label}
    <label style={labelcolor ? `color: ${labelcolor}` : ""}>{label}</label>
  {/if}
  <select {id} {required} bind:this={selectElm} {disabled}>
    {#each items as item, index}
      <option id={`coin-${index}`} value={index}>{item.name}</option>
    {/each}
  </select>
  {#if selectElm}
    <div
      bind:this={newSelectElm}
      id={`${id}-currently-selected`}
      class="select-selected"
      style={`height: ${innerHeight}; width:${width}; ${styles}`}
      class:select-arrow-active={!hideBox}
      class:open={!hideBox}
      on:click={() => toggleBox()}
    >
      {#if selectElm.options.length > 0}
        {#if displayItems[selectElm.selectedIndex].token}
          <div>
            <TokenLogo
              margin="0 10px 0 0"
              tokenMeta={displayItems[selectElm.selectedIndex].value}
              width={logoWidth}
              alt=""
            />
          </div>
        {/if}
        {#if displayItems[selectElm.selectedIndex].value && displayItems[selectElm.selectedIndex].value.vk}
          <div>
            <Identicons
              margin="0 10px 0 0"
              iconValue={displayItems[selectElm.selectedIndex].value.vk}
            />
          </div>
        {/if}
        <div>
          {#if network && typeof displayItems[selectElm.selectedIndex].value.status != "undefined"}
            <span
              class="mark"
              class:online={displayItems[selectElm.selectedIndex].value.status}
            />
          {/if}
          {displayItems[selectElm.selectedIndex].name}
        </div>
      {:else}
        {defaultText}
      {/if}
    </div>
    <div
      class="select-items"
      class:select-hide={hideBox}
      style={`max-height: ${boxHeight};`}
    >
      {#each displayItems as item, index}
        <div
          id={`select-option-${index}`}
          class="items"
          class:same-as-selected={selectElm.selectedIndex === index}
          on:click={() => handleClick(selectElm.options[index], index)}
        >
          {#if item.token}
            <div>
              <TokenLogo
                margin="0 10px 0 0"
                tokenMeta={item.value}
                width={logoWidth}
                alt=""
              />
            </div>
          {/if}
          {#if item.value && item.value.vk}
            <div>
              <Identicons margin="0 10px 0 0" iconValue={item.value.vk} />
            </div>
          {/if}
          <div>
            {#if network && typeof item.value.status != "undefined"}
              <span class="mark" class:online={item.value.status} />
            {/if}
            {item.name}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  label {
    position: relative;
    top: 8px;
    left: 9px;
    font-style: normal;
    font-weight: normal;
    font-size: 11px;
    line-height: 16px;
    padding: 0 4px;
    color: var(--font-primary);
    background: inherit;
  }

  .custom-select {
    position: relative;
    font-family: Arial;
    background: inherit;
  }

  .custom-select select {
    display: none;
  }

  .select-selected {
    border: 1px solid var(--input-outline);
    border-radius: 4px;
    display: flex;
    align-items: center;
  }

  .select-selected.open {
    border: 1px solid var(--input-outline);
    border-radius: 4px 4px 0 0;
    overflow-x: hidden;
  }

  .select-selected:after {
    margin-top: 2px;
    content: "";
    border: 6px solid transparent;
    border-color: var(--font-primary-dim) transparent transparent transparent;
    position: absolute;
    top: 53%;
    right: 15px;
  }

  .select-selected.select-arrow-active:after {
    border-color: transparent transparent var(--font-primary-dim) transparent;
    margin-top: -5px;
  }

  .select-items > div,
  .select-selected {
    max-width: 100%;

    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;

    box-sizing: border-box;
    transition: border 0.5s;
    padding: 12px 32px 12px 13px;
    font-style: normal;
    font-size: 1.1em;
    line-height: 1;
    letter-spacing: 0.44px;

    cursor: pointer;
    user-select: none;
  }

  .select-items {
    position: absolute;
    border: 1px solid var(--input-outline);
    background-color: var(--bg-secondary);
    border-radius: 0 0 4px 4px;
    left: 0;
    right: 0;
    margin-top: -1px;
    z-index: 99;
    overflow-y: auto;
  }

  .select-hide {
    display: none;
  }

  .items {
    display: flex;
    align-items: center;
  }

  .items:hover {
    background-color: var(--bg-secondary-hover);
    border-radius: 0px;
  }

  .same-as-selected {
    font-weight: 600;
  }

  .mark {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 100%;
    margin-right: 4px;
    background: var(--error-color);
    vertical-align: middle;
  }
  .online {
    background: var(--success-color);
  }
</style>
