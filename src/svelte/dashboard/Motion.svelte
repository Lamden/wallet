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
    <div class="wrap-second" on:click={handleCollapse}>
      <div
        bind:this={divElm}
        class="row-box flex-column text-body1 text-primar"
        class:active-bg={collapseStatus}
      >
        <div class="coin-main-row flex-row flex-align-center">
          <div class="name">
            <div class="collapse-btn">
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
            <!-- <div class="text weight-400 text-body1 text-primary">
                {formatAccountAddress(data.vk, 6, 4)}
            </div> -->
          </div>
          <div class="policy">{data.policy}</div>
          <div class="motion">{data.name}</div>
          <div class="result">{data.yays} yays / {data.nays} nays</div>
          <div class="status">{data.status}</div>
        </div>
        {#if collapseStatus}
          {#if data.desc}
          <div class="motion-info">{data.desc}</div>
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
                  {#if item.isNodeOwner && item.value === 0}
                    <button
                      id="history-btn"
                      class="button__small button__primary coin-btn flex-row"
                      on:click|stopPropagation={() => handleVote(item.vk)}
                    >
                      Vote
                    </button>
                  {/if}
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
  
    .text {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
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
    .name-box {
      line-height: 1.1;
    }
    .token-balance {
      margin-bottom: 0.25rem;
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
      font-size: 0.8em;
      margin-left: 12px;
      align-items: center;
    }
  
    .coin-btn > .icon {
      width: 12px;
      height: 12px;
      margin-left: 8px;
    }
  
    .dapps {
      margin: 14px 14px 0 14px;
      display: flex;
      align-items: center;
    }
  
    .dapps .avatar {
      display: inline-block;
      width: 23px;
      height: 23px;
      border-radius: 50%;
      border: 2px solid white;
      background: var(--bg-secondary);
      overflow: hidden;
      cursor: pointer;
    }
    .dapps .avatar:not(:first-child) {
      margin-left: -8px;
    }
  
    .dapps .avatar:hover {
      position: relative;
      width: 25px;
      height: 25px;
      z-index: 635;
    }
    .dapps .avatar img {
      width: 100%;
      height: 100%;
      max-width: 100%;
      max-height: 100%;
      vertical-align: middle;
    }
  
    .coinmenus {
      padding-left: 82px;
      margin-bottom: 1.5rem;
      margin-top: 0.8rem;
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
    .tokensnum {
      flex-basis: 200px;
      min-width: 76px;
    }
    .header-amount {
      margin-left: 242px;
    }
    .header-price {
      margin-left: 180px;
    }
    .fiatvalue {
      flex-basis: 200px;
      min-width: 100px;
    }
  </style>
  