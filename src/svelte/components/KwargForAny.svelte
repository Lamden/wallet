<script>
  import { createEventDispatcher, onMount } from "svelte";
  import { FilesStore, activeTab } from "../../js/stores/stores";
  const dispatch = createEventDispatcher();

  //Components
  import { Components } from "../Router.svelte";
  const { Button, InputBox, DropDown, DatePicker, TimeDelta } = Components;

  import lamden from "lamden-js";
  const { Encoder } = lamden;

  //Utils
  import {
    longFormTypes,
    typeToInputTypeMAP,
    defaultTypeValues,
  } from "../../js/utils.js";

  export let argumentInfo;
  export let index;
  export let bgStyle = "primary";

  let inputElm;
  let selectedType;

  let InputBoxTypes = ["str", "float", "int", "dict", "list"];
  let DropDownTypes = ["bool"];
  let DatePickerTypes = ["datetime.datetime", "datetime"];
  let TimeDeltaTypes = ["datetime.timedelta", "timedelta"];

  let currDate = new Date().toString();
  let timeZone = currDate.substring(
    currDate.lastIndexOf("(") + 1,
    currDate.lastIndexOf(")")
  );

  const handleDropDownSelection = (e) => {
    argumentInfo.value = e.detail.selected.value;
    handleChange();
  };

  const handleChange = () => {
    argumentInfo.selectedType = selectedType;
    dispatch("argChanged");
  };

  const setSlectedType = (type) => {
    FilesStore.setAnyArgumentType(argumentInfo.name, type, $activeTab.index);
    selectedType = type;
    argumentInfo.value = undefined;
  };

  onMount(() => {
    if ($activeTab.anyArgumentType) {
      selectedType = $activeTab.anyArgumentType[argumentInfo.name];
    } else {
      selectedType = "str";
    }
  });
</script>

<div class="box" id={`kwarg-${index}`} style={`background: ${bgStyle}`}>
  <div class="title">
    {`${argumentInfo.name.toUpperCase()} (${longFormTypes[selectedType]})`}
    {#if DatePickerTypes.includes(selectedType)}
      <strong>{`(${timeZone})`}</strong>
    {/if}
  </div>
  <div class="box-labels">
    <div
      class="label"
      class:selected={selectedType === "str"}
      on:click={() => {
        setSlectedType("str");
      }}
    >
      str
    </div>
    <div
      class="label"
      class:selected={selectedType === "float"}
      on:click={() => {
        setSlectedType("float");
      }}
    >
      float
    </div>
    <div
      class="label"
      class:selected={selectedType === "int"}
      on:click={() => {
        setSlectedType("int");
      }}
    >
      int
    </div>
    <div
      class="label"
      class:selected={selectedType === "dict"}
      on:click={() => {
        setSlectedType("dict");
      }}
    >
      dict
    </div>
    <div
      class="label"
      class:selected={selectedType === "list"}
      on:click={() => {
        setSlectedType("list");
      }}
    >
      list
    </div>
    <div
      class="label"
      class:selected={selectedType === "bool"}
      on:click={() => {
        setSlectedType("bool");
      }}
    >
      bool
    </div>
    <div
      class="label"
      class:selected={selectedType === "datetime"}
      on:click={() => {
        setSlectedType("datetime");
      }}
    >
      datetime
    </div>
    <div
      class="label"
      class:selected={selectedType === "timedelta"}
      on:click={() => {
        setSlectedType("timedelta");
      }}
    >
      timedelta
    </div>
  </div>

  {#if InputBoxTypes.includes(selectedType)}
    <InputBox
      id={`kwarg-${index}`}
      {bgStyle}
      styles="border:none;line-height: 16px;"
      bind:value={argumentInfo.value}
      placeholder={defaultTypeValues[selectedType]}
      inputType={typeToInputTypeMAP[selectedType]}
      on:changed={handleChange}
    />
  {/if}
  {#if DropDownTypes.includes(selectedType)}
    <DropDown
      {bgStyle}
      styles="padding:12px;border:none;"
      items={defaultTypeValues[selectedType]}
      id={`kwarg-${index}`}
      on:selected={handleDropDownSelection}
    />
  {/if}

  {#if DatePickerTypes.includes(selectedType)}
    <DatePicker
      {bgStyle}
      showLabel={false}
      extraStyle="padding:0px 5px 10px 10px;border:none;"
      id={`kwarg-${index}`}
      bind:dateISO={argumentInfo.value}
      on:changed={handleChange}
    />
  {/if}

  {#if TimeDeltaTypes.includes(selectedType)}
    <TimeDelta
      {bgStyle}
      id={`kwarg-${index}`}
      extraStyle="border:none;"
      bind:milliseconds={argumentInfo.value}
      on:changed={handleChange}
    />
  {/if}
</div>

<style>
  .box {
    position: relative;
    margin: 0 0 1rem 0;
    width: 100%;
    background: var(--bg-secondary);
    border: 1px solid var(--input-outline);
    border-radius: 4px;
    font-size: 1.1em;
    line-height: 1;
    color: var(--font-primary);
    letter-spacing: 0.44px;
    box-sizing: border-box;
    transition: border 0.5s;
  }
  .box:focus {
    border: 1px solid var(--primary-color);
  }
  .title {
    z-index: 666;
    position: absolute;
    left: 10px;
    top: -8px;
    background: var(--bg-secondary);
  }
  .box-labels {
    z-index: 666;
    position: absolute;
    display: flex;
    right: 20px;
    top: -8px;
    background: var(--bg-secondary);
  }
  .label {
    text-transform: uppercase;
    color: var(--accent-color);
    text-decoration: underline;
    margin-right: 4px;
    cursor: pointer;
  }
  .label:last-child {
    margin-right: 0;
  }
  .label:hover {
    margin-top: 1px;
    color: var(--accent-color-dim);
  }
  .label.selected {
    margin-top: 1px;
    color: var(--accent-color-dim);
  }
</style>
