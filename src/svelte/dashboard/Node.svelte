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
              width={"100%"}
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
        </div>
        <div class="details flex-row flex-just-space-between flex-grow-1">
          <div class="weight-400 text-body1 text-primary">
                {data.nickname}
          </div>
          <div class="weight-400">
            <span>{data.status === "node" ? "Node Member" : data.status}<span>
          </div>
        </div>

      </div>
      {#if collapseStatus}
        <NodeDetails vk={data.vk} />
        <div class="flex-row coinmenus">
          <div class="coin-btns">
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
    padding: 0.625rem 20px;
    box-sizing: border-box;
  }

  .logowrap {
    justify-content: center;
    display: flex;
  }

  .logo {
    width: 43px;
    margin: 0 20px;
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    padding: 5px;
    background: black;
    border-radius: 999px;
    border: 3px solid var(--color-grey-3);
  }

  .name {
    display: flex;
    align-items: center;
  }
  .coin-btn {
    padding: 4px 11px;
    margin-left: 14px;
    align-items: center;
    margin-top: 14px;
  }

  .coin-btn > .icon {
		width: var(--text-body3);
		height: var(--text-body3);
    margin-left: 8px;
  }

  .coinmenus {
    margin-bottom: 1rem;
  }

  .collapse-btn {
    cursor: pointer;
    width: var(--text-body1);
		height: var(--text-body1);
  }

</style>
