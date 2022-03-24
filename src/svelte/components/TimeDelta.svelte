<script>
  import { createEventDispatcher, onMount } from "svelte";
  const dispatch = createEventDispatcher();

  //Images
  import clock from "../../img/menu_icons/icon_clock.svg";

  export let milliseconds = 0;

  export let id = "";
  export let label = "";
  export let margin = "";
  export let placeholder;
  export let bgStyle;
  export let extraStyle;

  let timePickerElm;
  let timeBoxes = [
    { label: "Hours", value: 0 },
    { label: "Minutes", value: 0 },
    { label: "Seconds", value: 0 },
  ];

  onMount(() => {
    milliseconds = 0;
    dispatch("changed");
  });

  const handleInputChange = (e, index) => {
    if (e.target.value < 0) timeBoxes[index].value = 0;
    milliseconds = toMilliseconds();
    dispatch("changed");
  };

  const toMilliseconds = () => {
    return (
      parseInt(timeBoxes[0].value * 1000 * 60 * 60) +
      parseInt(timeBoxes[1].value * 1000 * 60) +
      parseInt(timeBoxes[2].value * 1000)
    );
  };
</script>

{#if label}
  <label class="inputbox-label">
    {label}
  </label>
{/if}

<div
  class="flex-row date-picker"
  {id}
  style={`${
    margin ? `margin: ${margin};` : ""
  } background: var(--bg-${bgStyle}); ${extraStyle}`}
  bind:this={timePickerElm}
>
  <div class="icon">
    {@html clock}
  </div>
  {#each timeBoxes as value, index}
    <div class="inputbox">
      <label class="inputbox-label"> {timeBoxes[index].label} </label>
      <input
        class="mainbox input:required:invalid input:focus:invalid"
        type="number"
        bind:value={timeBoxes[index].value}
        min="0"
        step="1"
        {placeholder}
        on:change={(e) => handleInputChange(e, index)}
      />
    </div>
  {/each}
</div>

<style>
  .date-picker {
    position: relative;
    justify-content: space-around;
    align-items: center;
    border: 1px solid var(--input-outline);
    padding: 0px 10px 10px 10px;
    border-radius: 4px;
    background: none;
    z-index: 0;
  }
  .mainbox {
    text-align: center;
    padding: 6px;
  }
  .inputbox {
    width: 15%;
    z-index: 1;
  }
  .icon {
    width: 30px;
    position: relative;
    align-self: flex-end;
    top: 2px;
  }
  .inputbox-label {
    z-index: 1;
  }
</style>
