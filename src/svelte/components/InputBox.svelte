<script>
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  //Props
  export let id;
  export let styles = "";
  export let value;
  export let label = "";
  export let placeholder = "";
  export let inputType = "text";
  export let pattern;
  export let required = false;
  export let width = "100%";
  export let height = "unset";
  export let margin = "unset";
  export let spellcheck = false;
  export let rows = "1";
  export let readonly = false;
  export let autofocus = false;
  export let numberMin = "0.00000001";
  export let numberStep = "any";
  export let disabled = false;
  export let bgStyle = "primary";
  export let errorMsg = "";
  export let warningMsg = "";
  export let disabledPWShowBtn = true;
  export let thisInput;
  export let autoComplete = "off";

  let pwShow = false;

  const dispatchChanged = (e) => {
    dispatch("changed", e);
  };

  const dispatchKeyUp = (e) => {
    dispatch("keyup", e);
  };

  const dispatchScroll = (e) => {
    dispatch("scroll", e);
  };

  const dispatchMouseUp = (e) => {
    dispatch("mouseup", e);
  };

  const dispatchInput = (e) => {
    dispatch("input", e);
  };

  const handleShow = () => {
    if (pwShow) {
      thisInput.type = "password";
    } else {
      thisInput.type = "text";
    }
    pwShow = !pwShow;
  };

  $: showtext = pwShow ? "Hide" : "Show";
</script>

<div
  class="inputbox"
  style={`margin: ${margin}; width: ${width}; background: var(--bg-${bgStyle});`}
>
  {#if label !== ""}
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label class="inputbox-label"> {label} </label>
  {/if}

  {#if warningMsg}
    <div class="inputbox-message text-warning">{warningMsg}</div>
  {/if}

  {#if errorMsg}
    <div class="inputbox-message text-error">{errorMsg}</div>
  {/if}

  {#if inputType === "password"}
    <!-- svelte-ignore a11y-autofocus -->
    <input
      {id}
      bind:value
      bind:this={thisInput}
      on:change={(e) => dispatchChanged(e)}
      on:keyup={(e) => dispatchKeyUp(e)}
      class="mainbox input:required:invalid input:focus:invalid"
      style={`width: 100%; height: ${height}; ${styles}`}
      type="password"
      {pattern}
      {placeholder}
      {required}
      {spellcheck}
      {disabled}
      {autoComplete}
      {autofocus}
    />
    {#if !disabledPWShowBtn}
      <span class="password-btn" on:click={handleShow}>{showtext}</span>
    {/if}
  {/if}
  {#if inputType === "number"}
    <!-- svelte-ignore a11y-autofocus -->
    <input
      {id}
      bind:value
      bind:this={thisInput}
      on:change={(e) => dispatchChanged(e)}
      on:keyup={(e) => dispatchKeyUp(e)}
      on:input={(e) => dispatchInput(e)}
      class="mainbox input:required:invalid input:focus:invalid"
      style={`width: 100%; height: ${height}; ${styles}`}
      type="number"
      min={numberMin}
      step={numberStep}
      {placeholder}
      {required}
      {disabled}
      {autoComplete}
      {autofocus}
    />
    <slot name="button" />
  {/if}
  {#if inputType === "textarea"}
    <!-- svelte-ignore a11y-autofocus -->
    <textarea
      {id}
      {rows}
      bind:value
      bind:this={thisInput}
      on:change={(e) => dispatchChanged(e)}
      on:keyup={(e) => dispatchKeyUp(e)}
      on:scroll={(e) => dispatchScroll(e)}
      on:mouseup={(e) => dispatchMouseUp(e)}
      class="mainbox textarea:required:invalid textarea:focus:invalid"
      style={`width: 100%; min-width: 100%; max-width: 100%; height: ${height}; font-family: 'Roboto', sans-serif; ${styles}`}
      {pattern}
      {placeholder}
      {readonly}
      {required}
      {spellcheck}
      {disabled}
      {autofocus}
    />
  {/if}
  {#if inputType === "text"}
    <!-- svelte-ignore a11y-autofocus -->
    <input
      {id}
      bind:value
      bind:this={thisInput}
      on:change={(e) => dispatchChanged(e)}
      on:keyup={(e) => dispatchKeyUp(e)}
      class="mainbox input:required:invalid input:focus:invalid"
      style={`width: 100%; height: ${height}; ${styles}`}
      {pattern}
      {placeholder}
      {required}
      {spellcheck}
      {disabled}
      {autoComplete}
      {autofocus}
    />
  {/if}
</div>

<style>
  .password-btn {
    position: absolute;
    right: 0;
    top: 50%;
    margin-right: 8px;
    text-decoration: underline;
    color: #5cc8e2;
    cursor: pointer;
  }
</style>
