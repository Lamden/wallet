<script>
  //Components
  import { MenuItem } from "../Router.svelte";

  //Props
  export let menuItems;
  export let heading;
  export let icons;
</script>

<div class="box">
  <div class="header">
    <h3>{heading}</h3>
  </div>

  {#each menuItems as menuItem}
    {#if menuItem.show}
      <MenuItem {menuItem} {icons} />
    {/if}
  {/each}
</div>

<style>
  .box {
    display: flex;
    flex-direction: column;
    background: var(--bg-secondary);
    box-shadow: var(--box-shadow-2);
    -webkit-box-shadow: var(--box-shadow-2);
    -moz-box-shadow: var(--box-shadow-2);
    border-radius: 4px;
    margin-bottom: 7px;
  }

  .header {
    display: none;
  }

  @media (min-width: 1100px) {
    .header {
      display: flex;
      flex-direction: row;
      align-content: center;
      margin-left: 31px;
    }
  }
</style>
