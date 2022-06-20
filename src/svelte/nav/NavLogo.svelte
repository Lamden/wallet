<script>
  import { getContext } from "svelte";

  //Images
  import logo_full from "../../img/logo_full.svg";

  //Context
  const { switchPage, firstRun } = getContext("app_functions");

  export let style = "fill: var(--font-primary)";

  $: clickable = !firstRun();

  const goHome = () => {
    if (clickable) switchPage("CoinsMain");
  };
</script>

<div class="box flex-column" {style}>
  <div class="brand" class:clickable on:click={() => goHome()}>
    <div class="logo">{@html logo_full}</div>
  </div>
</div>

<style>
  .box {
    width: 354px;
    min-width: 200px;
    height: 100%;
    justify-content: center;
  }

  .brand {
    margin-bottom: 6px;
    align-items: center;
  }

  .logo {
    width: 240px;
    margin: 0 auto;
  }
</style>
