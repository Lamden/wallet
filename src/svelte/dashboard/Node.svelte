<script>
  import whitelabel from "../../../whitelabel.json";

  import {
    getContext,
    createEventDispatcher,
  } from "svelte";
  //Stores
  import {
    currentNetwork,
    networkKey,
    SettingsStore,
  } from "../../js/stores/stores.js";

  //Components

  import { Components } from "../Router.svelte";
  const { Identicons } = Components;

  //Utils
  import {
    formatAccountAddress,
    copyToClipboard
  } from "../../js/utils.js";

  //Icons
  import CheckmarkIcon from "../icons/CheckmarkIcon.svelte";
  import CopyIcon from "../icons/CopyIcon.svelte";
  import DirectionalChevronIcon from "../icons/DirectionalChevronIcon.svelte";
  import PlusIcon from '../../img/menu_icons/icon_plus.svg';
  import arrowIn from "../../img/arrow_in.svg";
  import arrowOut from "../../img/arrow_out.svg";
    import NodeDetails from "./NodeDetails.svelte";

  // Props
  export let data;
  export let collapse = false;

  let divElm;

  let copied = false;

  $: collapseStatus = collapse;

  $: direction = collapseStatus ? "down" : "right";

  //Context
  const { switchPage, openModal } = getContext("app_functions");

  $: netKey = networkKey($currentNetwork);

  const handleCollapse = () => {
    collapseStatus = !collapseStatus;
  };

  const handleAddressCopy = () => {
    copyToClipboard(data.vk);
    copied = true;
    setTimeout(() => (copied = false), 2000);
  };

  const handleRegister = () => {
    openModal("NodeTx", {
      account: data.vk,
      txInfo: {
        contractName: "elect_masternodes",
        methodName: "register",
        kwargs: {},
      }
    });
  };

  const handleUnRegister = () => {
    openModal("NodeTx", {
      account: data.vk,
      txInfo: {
        contractName: "elect_masternodes",
        methodName: "unregister",
        kwargs: {},
      }
    });
  };

  const openNewMotionModal = () => {
        openModal("AddNewMotion", { account: data.vk });
  };

</script>

<div class="wrap">
  <div class="wrap-second">
    <div
      bind:this={divElm}
      class="row-box flex-column text-body1"
    >
      <div class="coin-main-row flex-row flex-align-center">
        <div class="name">
          <div class="collapse-btn" on:click={handleCollapse}>
            <DirectionalChevronIcon
              strokeWidth={2.75}
              {direction}
              width="16px"
              color="var(--font-primary)"
            />
          </div>
          {#if whitelabel.mainPage.logo.show}
            <div class="logowrap">
              <div class="logo flex-center-center">
                <Identicons margin="0" iconValue={data.vk} width="27px" />
              </div>
            </div>
          {/if}
          <div class="text weight-400 text-body1 text-primary">
                {formatAccountAddress(data.vk, 6, 4)}
          </div>
        </div>
        <div class="text weight-400 type">
          <span>{data.type}<span>
        </div>
        <div class="text weight-400 status">
          <span>{data.status === "node" ? "Node Member" : data.status}<span>
        </div>
      </div>
      {#if collapseStatus}
        <NodeDetails vk={data.vk} />
        <div class="flex-row coinmenus">
          <div class="coin-btns">
            <button
              class="button__small address coin-btn flex-row button__primary"
              class:success={copied}
              on:click|stopPropagation={handleAddressCopy}
              title="copy account address"
            >
              {formatAccountAddress(data.vk, 7, 0)}
              <div class="icon-copy">
                {#if !copied}
                  <CopyIcon width="9px" color="var(--color-white)" />
                {:else}
                  <CheckmarkIcon width="10px" color="var(--success-color)" />
                {/if}
              </div>
            </button>
            {#if data.status === "unregister"}
              <button
                id="history-btn"
                class="button__small button__primary coin-btn flex-row"
                on:click|stopPropagation={handleRegister}
              >
                Register
                <div class="icon">{@html arrowIn}</div>
              </button>
            {:else if data.status === "candidate"}
              <button
                id="history-btn"
                class="button__small button__primary coin-btn flex-row"
                on:click|stopPropagation={handleUnRegister}
              >
                UnRegister
                <div class="icon">{@html arrowOut}</div>
              </button>
            {:else}
              <button
                id="history-btn"
                class="button__small button__primary coin-btn flex-row"
                on:click|stopPropagation={openNewMotionModal}
              >
                Create Motion
                <div class="icon">{@html PlusIcon}</div>
              </button>
            {/if}
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .coin-btns {
    flex-wrap: wrap;
    display: flex;
  }
  .wrap {
    width: 100%;
    height: 100%;
    margin: 0.5rem 0;
    box-sizing: border-box;
    border-radius: 6px;
    background-image: linear-gradient(#a26bfa, #4f06c6);
  }
  .wrap-second {
    background-color: var(--bg-primary);
    margin: 2px;
    box-sizing: border-box;
    border-radius: 6px;
  }
  .row-box {
    padding: 0.625rem 0 0.625rem 0px;
    box-sizing: border-box;
  }

  .text {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
  }

  .logowrap {
    flex-basis: 80px;
    justify-content: center;
    display: flex;
  }

  .logo {
    width: 43px;
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    padding: 5px;
    background: black;
    border-radius: 999px;
    border: 3px solid var(--color-grey-3);
  }

  .name {
    flex-basis: 258px;
    min-width: 160px;
    display: flex;
    align-items: center;
  }

  .type {
    flex-basis: 240px;
    min-width: 160px;
    justify-content: start;
  }

  .status {
    flex-basis: 200px;
    min-width: 63px;
  }

  .address {
    background: var(--primary-color);
    cursor: pointer;
    border-radius: 16px;
  }
  .address:hover {
    background: var(--bg-secondary-hover);
  }
  .address.success {
    color: var(--success-color);
    border: 1px solid var(--success-color);
  }
  .icon-copy {
    width: 10px;
    height: 10px;
    margin-left: 8px;
    margin-bottom: 4px;
  }
  .coin-btn {
    padding: 8px 14px;
    margin-left: 14px;
    font-size: 0.8em;
    align-items: center;
    margin-top: 14px;
  }

  .coin-btn > .icon {
    width: 12px;
    height: 12px;
    margin-left: 8px;
  }

  .coinmenus {
    padding-left: 12px;
    margin-bottom: 1.5rem;
    margin-top: 0.6rem;
  }

  .collapse-btn {
    cursor: pointer;
    flex-basis: 44px;
    justify-content: end;
    display: flex;
  }
</style>
