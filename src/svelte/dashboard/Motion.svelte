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
  
    //Images
    import arrowIn from "../../img/arrow_in.svg";
    import arrowOut from "../../img/arrow_out.svg";
    import History from "../../img/history.svg";
  
    import SettingsIcon from "../icons/SettingsIcon.svelte";
    
    //Utils
  import {
    displayBalance,
    stringToFixed,
    getTokenBalance,
    toBigNumber,
    calcValue,
    formatAccountAddress,
  } from "../../js/utils.js";

    //Components
  
    import { Components } from "../Router.svelte";
    const { Identicons, TokenLogo } = Components;
  
    //Icons
    import DirectionalChevronIcon from "../icons/DirectionalChevronIcon.svelte";
  
    import Lamden from "lamden-js";
    import MenuItem from "../menu/MenuItem.svelte";
    const { Encoder } = Lamden;
  
    const dispatch = createEventDispatcher();
  
    // Props
    export let data;
    export let collapse = false;
  
    let divElm;
  
    $: collapseStatus = collapse;
  
    $: direction = collapseStatus ? "down" : "right";
  
    //Context
    const { switchPage, openModal } = getContext("app_functions");
  
    const handleCollapse = () => {
      collapseStatus = !collapseStatus;
      dispatch("collapseChange", { vk: '', value: collapseStatus });
    };

    const handleVote = (account) => {
      openModal("Vote", {data, account});
    };
  </script>
  
  <div class="wrap">
    <div class="wrap-second">
      <div
        bind:this={divElm}
        class="row-box flex-column text-body1 text-primar"
        class:active-bg={collapseStatus}
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
            <div class="logowrap">
              <div class="logo flex-center-center">
                <Identicons margin="0" iconValue={data.policy} width="27px" />
              </div>
            </div>
          </div>
          <div class="policy">{data.policy}</div>
          <div class="motion">{data.name}</div>
          <div class="result">{data.yays} yays / {data.nays} nays</div>
          <div class="status">{data.status === 1 ? "Open" : "Closed"}</div>
        </div>
        {#if collapseStatus}
          {#if data.desc}
          <div class="motion-info">{@html data.desc}</div>
          {/if}
          <div class="header header-text votes">
              <div class="header-name header-text">Votes</div>
          </div>
          <div class="votelist">
            {#each data.positions as item }
              <div class="vote">
                <div class="logo2">
                  <Identicons margin="0" iconValue={item.vk} width="27px" />
                </div>
                <div class="vote-name">
                  {formatAccountAddress(item.vk, 6, 4)}
                </div>
                <div class="vote-res">
                  <div>{item.value === 0 ? "➖" : item.value === 1 ? "❌" : "✔️" }</div>
                  {#if data.status === 1 && item.isNodeOwner && item.value === 0}
                    <button
                      id="history-btn"
                      class="button__small button__primary coin-btn flex-row"
                      on:click|stopPropagation={() => handleVote(item.vk)}
                    >
                      Vote
                    </button>
                  {/if}
                  <button
                  id="history-btn"
                  class="button__small button__primary coin-btn flex-row"
                  on:click|stopPropagation={() => handleVote(item.vk)}
                >
                  Vote
                </button>
                </div>
              </div>
            {/each}
          </div> 

        {/if}
      </div>
    </div>
  </div>
  
  <style>
    .motion-info {
      margin-top: 1rem;
      margin-left: 5rem;
    }
    .vote-res {
      width: 240px;
      display: flex;
      align-items: center;
    }
    .vote-name {
      width: 184px;
    }
    .votes {
      margin-top: 1.5rem;
    }
    .vote {
      display: flex;
      align-items: center;
      padding: 1rem 28px 0 0;
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
  
    .logowrap {
      flex-basis: 111px;
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
  
    .logo2 {
      width: 30px;
      margin-right: 44px;
      box-sizing: border-box;
      display: flex;
      justify-content: center;
      padding: 2px;
      background: black;
      border-radius: 999px;
      border: 2px solid var(--color-grey-3);
    }

    .name {
      flex-basis: 340px;
      min-width: 160px;
      display: flex;
      align-items: center;
    }
    .policy {
      flex-basis: 240px;
      min-width: 100px;
      justify-content: center;
    }
    .motion {
      flex-basis: 240px;
      min-width: 100px;
      justify-content: center;
    }
  
    .status {
      flex-basis: 240px;
      min-width: 100px;
      justify-content: center;
    }
  
    .result {
      flex-basis: 240px;
      min-width: 100px;
      justify-content: center;
    }
    .coin-btn {
      padding: 8px 14px;
      font-size: 0.8em;
      margin-left: 12px;
      align-items: center;
    }
    .header-text {
      display: flex;
      align-items: center;
    }
    .header {
      display: flex;
      flex-direction: row;
      width: 100%;
      padding: 0.5rem 80px;
      margin-bottom: 0.5rem;
      font-weight: 800;
      background: rgba(170, 170, 170, 0.1);
      box-sizing: border-box;
    }
    .active-bg {
      background: linear-gradient(
        95.08deg,
        rgba(162, 107, 250, 0.1) 2.49%,
        rgba(79, 6, 198, 0.1) 97.19%
      );
    }
    .collapse-btn {
      cursor: pointer;
      flex-basis: 44px;
      justify-content: end;
      display: flex;
    }
    .votelist {
      padding-left: 80px;
      margin-bottom: 2rem;
    }
  </style>
  