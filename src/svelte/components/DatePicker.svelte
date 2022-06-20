<script>
  import Flatpickr from "./FlatPicker.svelte";
  import { createEventDispatcher, onMount } from "svelte";
  const dispatch = createEventDispatcher();

  //Utils
  import { encodeLocaleDateTime, encodeUTCDateTime } from "../../js/utils.js";

  export let dateISO = new Date(new Date()).toISOString();

  export let id = "";
  export let label = "";
  export let margin = "";
  export let placeholder;
  export let bgStyle = "primary";
  export let extraStyle = "";
  export let showLabel = true;

  let datePickerElm, lableElm;
  let showLocale = true;
  let labels = ["Year", "Month", "Day", "Hr", "Min", "Sec", "Mil"];
  let constraints = [
    { min: 1, max: 9999 },
    { min: 1, max: 12 },
    { min: 1, max: 31 },
    { min: 1, max: 24 },
    { min: 1, max: 60 },
    { min: 1, max: 60 },
    { min: 1, max: 1000 },
  ];
  let currDate = new Date().toString();
  let timeZone = currDate.substring(
    currDate.lastIndexOf("(") + 1,
    currDate.lastIndexOf(")")
  );

  $: dateValues = [];

  const options = {
    enableTime: true,
    time_24hr: true,
    enableSeconds: true,
    dateFormat: "Z",
    mode: "single",
  };

  onMount(() => {
    dateISO = new Date(new Date()).toISOString();
    dateValues = encodeLocaleDateTime(dateISO);
    dispatch("changed", dateISO);
  });

  const handleChange = (e) => {
    dateISO = e.detail[1];
    dateValues = showLocale
      ? encodeLocaleDateTime(dateISO)
      : encodeUTCDateTime(dateISO);
    dispatch("changed", dateISO);
  };

  const handleInputChange = (e, index) => {
    dateValues[index] = parseInt(e.target.value);
    if (e.target.value > constraints[index].max)
      dateValues[index] = constraints[index].max;
    if (e.target.value < constraints[index].min)
      dateValues[index] = constraints[index].min;
    determineISOdate(showLocale);
  };

  const determineISOdate = () => {
    let newDate;
    if (showLocale) {
      newDate = new Date(
        dateValues[0],
        dateValues[1] - 1,
        dateValues[2],
        dateValues[3],
        dateValues[4],
        dateValues[5],
        dateValues[6]
      );
      dateValues = encodeLocaleDateTime(newDate);
    } else {
      newDate = new Date(
        Date.UTC(
          dateValues[0],
          dateValues[1] - 1,
          dateValues[2],
          dateValues[3],
          dateValues[4],
          dateValues[5],
          dateValues[6]
        )
      );
      dateValues = encodeUTCDateTime(newDate);
    }

    dateISO = newDate.toISOString();
    dispatch("changed", dateISO);
  };

  const handleTimezonClick = (e) => {
    if (e.currentTarget === lableElm) {
      showLocale = !showLocale;
      dateValues = showLocale
        ? encodeLocaleDateTime(dateISO)
        : encodeUTCDateTime(dateISO);
      dispatch("changed", dateISO);
    }
  };
</script>

{#if showLabel}
  <label
    class="inputbox-label text-link"
    bind:this={lableElm}
    on:click={handleTimezonClick}
  >
    {label} <strong>{`(${showLocale ? timeZone : "UTC"})`}</strong>
  </label>
{/if}

<div
  class="flex-row date-picker"
  {id}
  style={`${
    margin ? `margin: ${margin};` : ""
  } background: var(--bg-${bgStyle}); ${extraStyle}`}
  on:click={handleTimezonClick}
  bind:this={datePickerElm}
>
  <Flatpickr
    {options}
    placeholder="optional placeholder"
    on:change={handleChange}
  />
  {#each dateValues as value, index}
    <div class="inputbox">
      <label class="inputbox-label"> {labels[index]} </label>
      <input
        class="mainbox input:required:invalid input:focus:invalid"
        type="number"
        bind:value={dateValues[index]}
        min={constraints[index].min}
        max={constraints[index].max}
        step={1}
        {placeholder}
        on:change={(e) => handleInputChange(e, index)}
      />
    </div>
    {#if index === 2} <strong class="text-secondary">/</strong> {/if}
  {/each}
</div>

<style>
  .date-picker {
    position: relative;
    justify-content: space-between;
    align-items: center;
    border: 1px solid var(--input-outline);
    padding: 0px 5px 10px 10px;
    border-radius: 4px;
    z-index: 0;
    cursor: pointer;
    background-color: inherit;
    min-width: fit-content;
  }

  .mainbox {
    text-align: center;
    padding: 6px;
    background-color: inherit;
  }
  .inputbox {
    width: 8%;
    z-index: 1;
    min-width: 50px;
    padding: 0 5px;
    background-color: inherit;
  }
  div > strong {
    position: relative;
    font-size: 1.6em;
    top: 8px;
  }
  label > strong:hover {
    position: relative;
    top: -1;
    color: var(--text-accent);
  }
  .inputbox-label {
    z-index: 1;
    background-color: inherit;
    width: fit-content;
  }
</style>
