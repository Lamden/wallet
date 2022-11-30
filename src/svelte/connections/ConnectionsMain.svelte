<script>
  import whitelabel from "../../../whitelabel.json";

  //Stores
  import { DappStore, currentNetwork } from "../../js/stores/stores.js";

  //Components
  import { Connection, ConnectionEmpty, CoinDivider } from "../Router.svelte";

  //Props
  export let name;

  $: dappStorage = $DappStore
    ? Object.values($DappStore)
        .filter((app) => !!app[`V${$currentNetwork.version}|${$currentNetwork.type}`])
        .map((app, index) => {
          app.id = index;
          return app;
        })
    : [];
</script>

<div class="connectionsmain text-primary">
  {#if dappStorage.length === 0}
    <ConnectionEmpty />
  {:else}
    <div
      class="header header-accounts header-text text-body1 divider weight-800"
    >
      {#if whitelabel.connections.connection_info.show}
        <div
          class:logo-space={whitelabel.connections.logo.show}
          class="header-name header-text"
        >
          {whitelabel.connections.connection_info.title}
        </div>
      {/if}
      {#if whitelabel.connections.account.show}
        <div class="header-account header-text">
          {whitelabel.connections.account.title}
        </div>
      {/if}
    </div>
    {#each dappStorage as dapp (dapp.id)}
      <Connection {dapp} />
      <CoinDivider percent={false} />
    {/each}
  {/if}
</div>

<style>
  .connectionsmain {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    max-width: 1552px;
  }
  .header {
    display: flex;
    flex-direction: row;
    width: 100%;
    padding: 0.5rem 0;
    margin-bottom: 0.5rem;
  }
  .header-accounts {
    margin-top: 2rem;
  }

  .divider {
    border-bottom: 1px solid var(--divider-light);
  }

  .header-text {
    display: flex;
    align-items: center;
  }

  .header-name {
    margin-left: 84px;
    flex-grow: 1;
    white-space: nowrap;
  }

  .header-account {
    justify-content: flex-end;
    white-space: nowrap;
  }

  @media (min-width: 550px) {
    .header-account {
      margin-right: 28px;
    }
  }
</style>
