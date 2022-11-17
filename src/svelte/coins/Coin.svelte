<script>
  import whitelabel from "../../../whitelabel.json";

  import {
    getContext,
    setContext,
    afterUpdate,
    createEventDispatcher,
    onMount,
  } from "svelte";
  import { fly } from "svelte/transition";
  import { quintOut } from "svelte/easing";

  //Stores
  import {
    NodesStore,
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
    coinsDropDown,
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
    getKeyValue,
    createCharmKey,
    formatValue,
    stringToFixed,
    getTokenBalance,
    copyToClipboard,
    toBigNumber,
    calcValue,
  } from "../../js/utils.js";

  //Images
  import logo from "../../img/logo.svg";

  //Icons
  import CheckmarkIcon from "../icons/CheckmarkIcon.svelte";
  import CopyIcon from "../icons/CopyIcon.svelte";
  import DirectionalChevronIcon from "../icons/DirectionalChevronIcon.svelte";

  import Lamden from "lamden-js";
    import CoinDelete from "./CoinDelete.svelte";
  const { Encoder } = Lamden;

  const dispatch = createEventDispatcher();

  // Props
  export let coin;
  export let token;
  export let refreshTx;
  export let collapse = false;

  const formats = {
    number: { default: 0 },
    string: { default: "None" },
  };

  let divElm;

  let copied = false;

  $: currentFiat = $SettingsStore.fiat;
  $: fiatGraphSymbol = whitelabel.fiat[currentFiat];
  $: collapseStatus = collapse;

  $: direction = collapseStatus ? "down" : "right";

  //Context
  const { switchPage, openModal, closeModal } = getContext("app_functions");

  const genericIcon_base64_svg =
    "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiPjxjaXJjbGUgc3Ryb2tlPSJub25lIiBmaWxsPSIjOGU3Yjk4IiByPSI0OCUiIGN4PSI1MCUiIGN5PSI1MCUiPjwvY2lyY2xlPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDUwIDUwKSBzY2FsZSgwLjY5IDAuNjkpIHJvdGF0ZSgwKSB0cmFuc2xhdGUoLTUwIC01MCkiIHN0eWxlPSJmaWxsOiNmZmZmZmYiPjxzdmcgZmlsbD0iI2ZmZmZmZiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgdmVyc2lvbj0iMS4xIiBzdHlsZT0ic2hhcGUtcmVuZGVyaW5nOmdlb21ldHJpY1ByZWNpc2lvbjt0ZXh0LXJlbmRlcmluZzpnZW9tZXRyaWNQcmVjaXNpb247aW1hZ2UtcmVuZGVyaW5nOm9wdGltaXplUXVhbGl0eTsiIHZpZXdCb3g9IjAgMCA1OCA4OCIgeD0iMHB4IiB5PSIwcHgiIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIj48ZGVmcz48c3R5bGUgdHlwZT0idGV4dC9jc3MiPgogICAKICAgIC5maWwwIHtmaWxsOiNmZmZmZmZ9CiAgIAogIDwvc3R5bGU+PC9kZWZzPjxnPjxwYXRoIGNsYXNzPSJmaWwwIiBkPSJNMCAyNGMwLC0zMSA1OCwtMzMgNTgsLTEgMCwxOSAtMTksMTggLTIzLDM2IC0yLDkgLTE0LDggLTE0LC0yIDAsLTE3IDE0LC0xOCAyMCwtMjkgNCwtOCAtMywtMTYgLTExLC0xNiAtMTcsMCAtMTEsMTkgLTIyLDE5IC00LDAgLTgsLTMgLTgsLTd6bTI4IDY0Yy0xMiwwIC0xMSwtMTggMCwtMTggMTIsMCAxMiwxOCAwLDE4eiI+PC9wYXRoPjwvZz48L3N2Zz48L2c+PC9zdmc+";

  $: addressLookupURL = $currentNetwork.blockExplorer;
  $: onMainnet = $currentNetwork.type === "mainnet" ? true : false;
  $: netKey = networkKey($currentNetwork);
  $: watching = coin.sk === "watchOnly";
  $: balance = BalancesStore.getBalance($currentNetwork, coin.vk);
  $: balanceStr = balance ? displayBalance(stringToFixed(balance, 8)) : "0";
  $: balanceValue = calcValue(balance, $TauPrice);
  $: percent =
    typeof $balanceTotal[netKey] === "undefined" ? "" : toPercentString();

  $: tokenBalance =
    token && coin
      ? getTokenBalance(
          netKey,
          coin.vk,
          token.contractName,
          $TokenBalancesStore
        )
      : "0";
  $: tokenBalanceTruncated = stringToFixed(tokenBalance.toString(), 8);
  $: tokenBalanceString = displayBalance(tokenBalanceTruncated);
  $: hasVisibleBalance = toBigNumber(tokenBalanceTruncated).isGreaterThan(0);
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

  $: dapps = $DappStore
    ? Object.values($DappStore)
        .filter((app) => !!app[$currentNetwork.type] && app.vk === coin.vk)
        .map((app, index) => {
          app.id = index;
          return app;
        })
    : [];

  $: tokenList = getTokens(netKey, coin.vk, $TokenStore, $TokenBalancesStore);
  $: tokensNum = tokenList.length;
  $: isVaultAccount = coin.type === "vault";
  $: isNodeAccount = $NodesStore.findIndex(x => x.vk === coin.vk && x.netKey === netKey) > -1

  afterUpdate(() => {
    balance = BalancesStore.getBalance($currentNetwork, coin.vk);
    balanceStr = balance ? balance.toLocaleString("en") : "0";
    percent =
      typeof $balanceTotal[networkKey($currentNetwork)] === "undefined"
        ? "0.0 %"
        : toPercentString();
  });

  const toPercentString = () => {
    if (isNaN(balance / $balanceTotal[networkKey($currentNetwork)]))
      return "0.0 %";
    return (
      ((balance / $balanceTotal[networkKey($currentNetwork)]) * 100)
        .toFixed(2)
        .toString() + " %"
    );
  };

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
        coin.vk,
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

  const handleAddressCopy = () => {
    copyToClipboard(coin.vk);
    copied = true;
    setTimeout(() => (copied = false), 2000);
  };

  const handleReorderUp = () => {
    dispatch("reorderAccount", { id: coin.id, direction: "up" });
  };
  const handleReorderDown = () => {
    dispatch("reorderAccount", { id: coin.id, direction: "down" });
  };

  const handleSend = () => {
    if (balance.isGreaterThan(0)) {
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
    } else {
      openModal("MessageBox", {
        text: `You have no ${$currentNetwork.currencySymbol} balances. Please get some coins before making a transaction.`,
        type: "caution",
        buttons: [{name: 'Cancel', click: () => closeModal(), class: 'button__solid button__primary'}],
      })
    }
  };

  const handleReceive = () => {
    openModal("CoinLamdenReceive", { coin });
  };

  const handleCollapse = () => {
    collapseStatus = !collapseStatus;
    dispatch("collapseChange", { vk: coin.vk, value: collapseStatus });
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
    window.open(`${addressLookupURL}/addresses/${coin.vk}`, "_blank");
  };

  const handleOptionClick = () => {
    openModal("CoinModify", coin);
  };
</script>

{#if !token || (token && hasVisibleBalance)}
  <div class="wrap badge-box" class:wrap-leagyc={!isVaultAccount}>
    <div class="wrap-second" on:click={handleCollapse}>
      <div
        id={`coin-row-${coin.id}`}
        bind:this={divElm}
        class="row-box flex-column text-body1"
        class:active-bg={collapseStatus}
        class:text-primary={isVaultAccount}
        class:text-primary-dim={!isVaultAccount}
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
            {#if whitelabel.mainPage.logo.show}
              <div class="logowrap">
                <div class="logo flex-center-center">
                  <Identicons margin="0" iconValue={coin.vk} width="27px" />
                </div>
              </div>
            {/if}
            {#if whitelabel.mainPage.account_info.show}
              <div class="text weight-400">
                <div class="name-box">
                  <span
                    id={`coin-nickname-${coin.id}`}
                    class="nickname text-body1 text-primary"
                  >
                    {`${coin.nickname}`}
                  </span>
                </div>
              </div>
            {/if}
          </div>
          {#if whitelabel.mainPage.amount.show}
            <div class="amount flex-column">
              {#if token}
                <div class="token-balance">
                  {`${tokenBalanceString} ${token.tokenSymbol}`}
                </div>
              {/if}
              <div>
                {`${balanceStr} ${$currentNetwork.currencySymbol}`}
              </div>
            </div>
          {/if}

          {#if onMainnet}
            <div class="weight-400 value flex-column">
              {#if token}
                <div>{fiatGraphSymbol}{tokenValue}</div>
              {/if}
              <div>{fiatGraphSymbol}{balanceValue}</div>
            </div>
          {/if}
          <div class="text  weight-400 tokensnum">
            {`${tokensNum} ${tokensNum === 1 ? "token" : "tokens"}`}
          </div>

          {#if onMainnet}
            <div class="weight-400 flex-column fiatvalue">
              <div>{fiatGraphSymbol}{totalValue}</div>
            </div>
          {/if}

          {#if whitelabel.mainPage.portfolio.show && !token}
            {#if !watching}
              <div class="percent text weight-400">
                <div style="padding-right: 26px;">{`${percent}`}</div>
              </div>
            {/if}
          {/if}
        </div>
        {#if collapseStatus}
          <div class="flex-row coinmenus">
            {#if !token}
              <div class="flex-row flex-align-center reorder-btns">
                <button
                  class="button__small button__primary reorder-button"
                  on:click|stopPropagation={handleReorderUp}
                >
                  <DirectionalChevronIcon width="8px" color="white" />
                </button>
                <button
                  class="button__small button__primary reorder-button"
                  on:click|stopPropagation={handleReorderDown}
                >
                  <DirectionalChevronIcon
                    width="8px"
                    direction="down"
                    color="white"
                  />
                </button>
              </div>
            {/if}
            <div class="coin-btns">
              {#if coin.sk !== "watchOnly"}
                <button
                  id="send-btn"
                  class:send-btn={!token}
                  class="button__small button__primary coin-btn flex-row"
                  on:click|stopPropagation={handleSend}
                >
                  {`Send ${
                    token ? token.tokenSymbol : $currentNetwork.currencySymbol
                  }`}
                  <div class="icon">{@html arrowOut}</div>
                </button>
                <button
                  id="receive-btn"
                  class="button__small button__primary coin-btn flex-row"
                  on:click|stopPropagation={handleReceive}
                >
                  {`Receive ${
                    token ? token.tokenSymbol : $currentNetwork.currencySymbol
                  }`}
                  <div class="icon">{@html arrowIn}</div>
                </button>
              {/if}
              <button
                class="button__small address coin-btn flex-row button__primary"
                class:success={copied}
                on:click|stopPropagation={handleAddressCopy}
                title="copy account address"
              >
                {formatAccountAddress(coin.vk, 7, 0)}
                <div class="icon-copy">
                  {#if !copied}
                    <CopyIcon width="9px" color="var(--color-white)" />
                  {:else}
                    <CheckmarkIcon width="10px" color="var(--success-color)" />
                  {/if}
                </div>
              </button>
              <button
                id="history-btn"
                class="button__small button__primary coin-btn flex-row"
                on:click|stopPropagation={handleHistoryClick}
              >
                View Transaction History
                <div class="icon">{@html History}</div>
              </button>
              <button
                id="options"
                class="button__small button__primary coin-btn flex-row"
                on:click|stopPropagation={handleOptionClick}
              >
                Options
                <div class="icon">
                  <SettingsIcon width="12px" color="var(--color-white)" />
                </div>
              </button>
              {#if coin.sk !== "watchOnly"}
                <div class="dapps">
                  {#each dapps as dapp (dapp.appName)}
                    <span
                      class="avatar"
                      on:click|stopPropagation={() =>
                        switchPage("ConnectionDetails", dapp)}
                    >
                      <img src={`${dapp.url}${dapp.logo}`} alt="" />
                    </span>
                  {/each}
                </div>
              {/if}
            </div>
          </div>
          {#if tokenList.length > 0}
            <div class="header header-text divider">
              <div class="header-name header-text">My Tokens</div>
              <div class="header-amount header-text">Amount</div>
              {#if onMainnet}
                <div class="header-price header-text">Vaule</div>
              {/if}
            </div>
            <div class="tokenlist">
              {#each tokenList as token (token.contractName)}
                <Token {token} vk={coin.vk} />
              {/each}
            </div>
          {/if}
        {/if}
      </div>
    </div>
    {#if isNodeAccount}
      <div class="badge text weight-400">Node</div>
    {/if}
  </div>
{/if}

<style>
  .badge-box {
    position: relative;
  }
  .badge {
    position: absolute;
    right: 0;
    top: 0;
    transform: translate(50%, -50%);
    color: white;
    transform-origin: 100% 0%;
    background: #ff4d4f;
    white-space: nowrap;
    text-align: center;
    border-radius: 10px;
    height: 20px;
    min-width: 20px;
    z-index: auto;
    padding: 0 10px;
  }
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
