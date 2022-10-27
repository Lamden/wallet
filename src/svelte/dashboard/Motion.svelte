<script>
    import whitelabel from "../../../whitelabel.json";
  
    import {
      getContext,
      afterUpdate,
      createEventDispatcher,
    } from "svelte";
  
    //Stores
    import {
      currentNetwork,
      BalancesStore,
      balanceTotal,
      networkKey,
      TokenBalancesStore,
      DappStore,
      TokenStore,
      PriceStore,
      TauPrice,
      SettingsStore,
    } from "../../js/stores/stores.js";
  
    //Images
    import arrowIn from "../../img/arrow_in.svg";
    import arrowOut from "../../img/arrow_out.svg";
    import History from "../../img/history.svg";
  
    import SettingsIcon from "../icons/SettingsIcon.svelte";
  
    //Components
  
    import { Token, Components } from "../Router.svelte";
    const { Identicons, TokenLogo } = Components;
  
    //Utils
    import {
      formatAccountAddress,
      displayBalance,
      stringToFixed,
      getTokenBalance,
      copyToClipboard,
      toBigNumber,
      calcValue,
    } from "../../js/utils.js";
  
    //Icons
    import CheckmarkIcon from "../icons/CheckmarkIcon.svelte";
    import CopyIcon from "../icons/CopyIcon.svelte";
    import DirectionalChevronIcon from "../icons/DirectionalChevronIcon.svelte";
  
    import Lamden from "lamden-js";
    const { Encoder } = Lamden;
  
    const dispatch = createEventDispatcher();
  
    // Props
    export let coin;
    export let token;
    export let refreshTx;
    export let collapse = false;
  
    let divElm;
  
    let copied = false;
  
    $: currentFiat = $SettingsStore.fiat;
    $: fiatGraphSymbol = whitelabel.fiat[currentFiat];
    $: collapseStatus = collapse;
  
    $: direction = collapseStatus ? "down" : "right";
  
    //Context
    const { switchPage, openModal } = getContext("app_functions");

    $: addressLookupURL = $currentNetwork.blockExplorer;
    $: onMainnet = $currentNetwork.type === "mainnet" ? true : false;
    $: netKey = networkKey($currentNetwork);
    $: balance = BalancesStore.getBalance($currentNetwork, '');
    $: balanceStr = balance ? displayBalance(stringToFixed(balance, 8)) : "0";
    $: balanceValue = calcValue(balance, $TauPrice);
    $: percent =
      typeof $balanceTotal[netKey] === "undefined" ? "" : '';
  
    $: tokenBalance = 0
    $: tokenBalanceTruncated = stringToFixed(tokenBalance.toString(), 8);
    $: tokenBalanceString = displayBalance(tokenBalanceTruncated);
    $: tokenPrice =
      token && token.contractName
        ? $PriceStore[token.contractName]
          ? $PriceStore[token.contractName]["value"]
          : "0"
        : "0";
    $: tokenValue = calcValue(
      tokenBalance,
      calcValue(tokenPrice, $TauPrice, null)
    );
    $: totalValue = getTotalValue(
      tokenList,
      coin,
      balance,
      $TauPrice,
      $PriceStore,
      $currentNetwork,
      $TokenBalancesStore
    );
  
    $: tokenList = getTokens(netKey, '', $TokenStore, $TokenBalancesStore);
  
    const getTotalValue = (
      tokenList,
      coin,
      balance,
      tauPrice,
      PriceStore,
      currentNetwork,
      TokenBalancesStore
    ) => {
      if (
        !tokenList ||
        !coin ||
        !tauPrice ||
        !PriceStore ||
        !currentNetwork ||
        currentNetwork.type === "testnet" ||
        !TokenBalancesStore
      ) {
        return "0";
      }
      let value = Encoder("bigNumber", "0");
      tokenList.forEach((token) => {
        let tokenbalance = getTokenBalance(
          networkKey(currentNetwork),
          '',
          token.contractName,
          TokenBalancesStore
        );
        let tokenprice = PriceStore[token.contractName]
          ? PriceStore[token.contractName]["value"]
          : "0";
        let tokenvalue = calcValue(
          tokenbalance,
          calcValue(tokenprice, tauPrice, null, false),
          null,
          false
        );
        value = value.plus(tokenvalue);
      });
      value = value.plus(calcValue(balance, tauPrice, null, false));
      return value.toFormat(2, {
        decimalSeparator: ".",
        groupSeparator: ",",
        groupSize: 3,
      });
    };
  
    const handleReorderUp = () => {
      dispatch("reorderAccount", { id: coin.id, direction: "up" });
    };
    const handleReorderDown = () => {
      dispatch("reorderAccount", { id: coin.id, direction: "down" });
    };
  
    const handleSend = () => {
      if (token) {
        openModal("TokenLamdenSend", {
          token,
          coin,
          txMethod: "transfer",
          refreshTx: () => refreshTx(),
        });
      } else {
        openModal("CoinLamdenSend", { coin, refreshTx: () => refreshTx() });
      }
    };
  
    const handleReceive = () => {
      openModal("CoinLamdenReceive", { coin });
    };
  
    const handleCollapse = () => {
      collapseStatus = !collapseStatus;
      dispatch("collapseChange", { vk: '', value: collapseStatus });
    };
  
    const getTokens = (netKey, vk, tokenStore, tokenBalancesStore) => {
      if (!tokenStore[netKey]) return [];
      if (!tokenBalancesStore[netKey]) return [];
      if (!tokenBalancesStore[netKey][vk]) return [];
      let tokens = [];
      Object.keys(tokenBalancesStore[netKey][vk]).forEach((key) => {
        if (
          !tokenBalancesStore[netKey][vk][key] ||
          tokenBalancesStore[netKey][vk][key] == "0"
        )
          return;
        let item = tokenStore[netKey].find((t) => t.contractName === key);
        if (item) {
          item.balance = tokenBalancesStore[netKey][vk][key];
          tokens.push(item);
        }
      });
      return tokens;
    };
  
    const handleHistoryClick = () => {
      window.open(`${addressLookupURL}/addresses/`, "_blank");
    };
  
    const handleOptionClick = () => {
      openModal("CoinModify", coin);
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
            <div>
                REMOVE_MEMBER
            </div>
            <div>Closed</div>
          </div>

        </div>
        {#if collapseStatus}
        <div class="header header-text divider">
            <div class="header-name header-text">Votes</div>
        </div>
        <div class="tokenlist">
          <div>
            <div class="logo">
              <Identicons margin="0" iconValue={"2121"} width="27px" />
            </div>
            <div class="">
              Yes
            </div>
          </div>
        </div>
        {/if}
      </div>
    </div>
  </div>
  
  <style>
    .reorder-btns {
      margin-top: 22px;
      align-self: start;
    }
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
    .wrap-leagyc {
      background: var(--outline);
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
  
    .name {
      flex-basis: 406px;
      min-width: 300px;
      display: flex;
      align-items: center;
    }
  
    .amount {
      flex-basis: 240px;
      min-width: 160px;
      justify-content: center;
    }
  
    .value {
      flex-basis: 200px;
      min-width: 63px;
    }
  
    .percent {
      justify-content: flex-end;
      flex-grow: 1;
      min-width: 90px;
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
    .tokenlist {
      padding-left: 64px;
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
  