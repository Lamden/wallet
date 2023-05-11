<script>
  import whitelabel from "../../whitelabel.json";
  import {
    onMount,
    onDestroy,
    setContext,
    beforeUpdate,
    afterUpdate,
  } from "svelte";
  import { fade } from "svelte/transition";

  //Utils
  import { keysFromNew, pubFromPriv } from "../js/crypto/wallets.js";

  import { sendMessageToTab } from "../js/utils.js"

  import { createSocketService } from "../js/services/sockets.js"

  import Lamden from "lamden-js"

  //Stores
  import {
    needsBackup,
    SettingsStore,
    currentPage,
    clicked,
    currentThemeName,
    EventsStore,
    currentNetwork,
    BalancesStore,
    networkKey,
    CoinStore,
    TokenBalancesStore,
    TokenStore
  } from "../js/stores/stores.js";

  //Components
  import {
    Pages,
    FirstRun,
    Nav,
    NavForApp,
    Menu,
    Components,
    Modals,
    LeftSideFullPage,
  } from "./Router.svelte";
  const { Modal, Loading, LightDarkToggle } = Components;

  //Images
  import heart from "../img/menu_icons/icon_heart.svg";

  export let loaded;
  export let refreshed;

  let showModal = false;
  let accountAdded = false;
  let whatsnewModalViewed = false;
  let currentModal;
  let modalData;
  const fullPage = [
    "FirstCreateVault",
    "RestoreMain",
    "BackupMain",
    "FirstRunRestoreMain",
    "FirstRunMain",
    "ContinueSwap",
    "ChangePassword",
    "ManageNetwork",
  ];
  const redirect = {
    FirstRunRestoreMain: "FirstRunMain",
  };

  const service = createSocketService()
  let currentNetworkKey = networkKey($currentNetwork);

  $: walletIsLocked = true;
  $: firstRun = undefined;
  $: newEvent = getNewEvent($EventsStore);

  const getNewEvent = (eventsStore) => {
    if (Array.isArray(eventsStore)) {
      let arr = eventsStore
        .filter((e) => !e.viewed)
        .sort((a, b) => b.date_added - a.date_added);
      return arr.length > 0 ? arr[0] : false;
    } else {
      return false;
    }
  };

  const listenerHandle = (message, sender, sendResponse) => {
    if (message.type === "walletIsLocked") {
      //Make sure the wallet was actually unlocked by the user
      chrome.runtime.sendMessage({ type: "walletIsLocked" }, (locked) => {
        walletIsLocked = locked;
        if (!walletIsLocked) {
          chrome.runtime.sendMessage({ type: "isVaultCreated" }, (ok) => {
            SettingsStore.setIsVaultCreated(ok);
          });
        }
        if (walletIsLocked) whatsnewModalViewed = false;
        if (walletIsLocked && $currentPage.name === "ChangePassword")
          SettingsStore.changePage({ name: "CoinsMain" });
      });
    } else if (message.type === "txSent") {
        let tx = message.data
        if (tx) {
            let txBuilder = new Lamden.TransactionBuilder(tx.networkInfo, tx.txInfo, tx)
            txBuilder.checkBlockserviceForTransactionResult().then(res => {
                let info = txBuilder.getAllInfo()
                info.sentFrom = tx.sentFrom
                document.dispatchEvent(new CustomEvent('txStatus', {detail: info}));
            }).catch(err => {
                console.log(err)
            })
        }
    }
  };

  chrome.runtime.onMessage.addListener(listenerHandle);

  if ($currentNetwork.version === 2) {
    service.start($currentNetwork.blockservice.host, () => {
        let accounts = $CoinStore
        let tokenList = $TokenStore[currentNetworkKey] ? $TokenStore[currentNetworkKey] : []
        accounts.forEach((i) => {
            service.joinCurrencyBalanceFeed(i.vk)
            tokenList.forEach((j) => service.joinTokenBalanceFeed(j.contractName, i.vk))
        })
    });
  }

  onMount(() => {
    themeSet();
    chrome.runtime.sendMessage({ type: "walletIsLocked" }, (locked) => {
      console.log("locked:", locked)
      walletIsLocked = locked;
    });
    checkFirstRun();
  });

  let listenerInit = false
  // change websocket connection when network change
  currentNetwork.subscribe((newNetwork) => {
    if (networkKey(newNetwork) !== currentNetworkKey) {
      currentNetworkKey = networkKey(newNetwork);
      service.start(newNetwork.blockservice.host, () => {
        let accounts = $CoinStore ? $CoinStore : []
        let tokenList = $TokenStore[currentNetworkKey] ? $TokenStore[currentNetworkKey] : []
        accounts.forEach((i) => {
            service.joinCurrencyBalanceFeed(i.vk) 
            tokenList.forEach((j) => service.joinTokenBalanceFeed(j.contractName, i.vk))
        })
      });
      if (!listenerInit) {
        service.socket_on('new-state-changes-one', (update) => BalancesStore.processBalanceSocketUpdate(update)) 
        service.socket_on('new-state-changes-one', (update) => TokenBalancesStore.processTokenBalanceSocketUpdate(update)) 
        listenerInit = true
      }
    }
  });

  beforeUpdate(() => {
    if (SettingsStore.initialized() && refreshed) {
      if (typeof redirect[$currentPage.name] !== "undefined" && refreshed) {
        switchPage(redirect[$currentPage.name]);
      }
      refreshed = false;
      if ($needsBackup && $SettingsStore.lastCoinAddedType === "normal") {
        openModal("BackupNotificationModal", {});
      }
    }
    if (
      !$needsBackup &&
      newEvent &&
      !fullPage.includes($currentPage.name) &&
      !whatsnewModalViewed
    ) {
      openModal("WhatsnewModal", newEvent);
      whatsnewModalViewed = true;
    }
  });

  afterUpdate(() => {
    if (walletIsLocked && !firstRun) refreshed = true;
    if (
      !showModal &&
      accountAdded &&
      $SettingsStore.lastCoinAddedType === "normal" &&
      $needsBackup
    ) {
      openModal("BackupNotificationModal", {});
      accountAdded = false;
    }
  });

  onDestroy(() => {
    chrome.runtime.onMessage.removeListener(walletIsLockedListener);
  });

  setContext("app_functions", {
    switchPage: (name, data) => switchPage(name, data),
    openModal: (modal, data) => openModal(modal, data),
    getModalData: () => {
      return modalData;
    },
    closeModal: () => (showModal = false),
    firstRun: () => (firstRun ? true : false),
    appHome: () => switchPage("CoinsMain"),
    checkFirstRun: () => checkFirstRun(),
    themeToggle: themeToggle,
    setAccountAdded: () => (accountAdded = true),
    joinCoinService: (vk) => service.joinCurrencyBalanceFeed(vk),
    joinTokenService: (contractName, vk) => service.joinTokenBalanceFeed(contractName, vk)
  });

  const checkFirstRun = () => {
    chrome.runtime.sendMessage({ type: "isFirstRun" }, (isFirstRun) => {
      firstRun = isFirstRun;
      if (!firstRun && $currentPage.name === "FirstRunMain") {
        SettingsStore.changePage({ name: "CoinsMain" });
      }
      if (!firstRun && $currentPage.name === "FirstRunRestoreMain") {
        SettingsStore.changePage({ name: "CoinsMain" });
      }
      firstRun ? SettingsStore.changePage({ name: "FirstRunMain" }) : null;
      if (firstRun) accountAdded = true;
    });
  };

  const switchPage = (name, data) => {
    showModal = false;
    SettingsStore.changePage({ name, data });
  };

  const getUsedLocalStorageSpace = () => {
    return Object.keys(window.localStorage)
      .map(function (key) {
        return localStorage[key].length;
      })
      .reduce(function (a, b) {
        return a + b;
      });
  };

  const openModal = (modal, data) => {
    currentModal = modal;
    modalData = data;
    showModal = true;
  };

  const closeModal = () => {
    showModal = false;
  };

  function themeToggle() {
    let body = document.getElementById("theme-toggle");
    let lighttheme = getThemeSetting();
    if (!lighttheme) {
      body.classList.add("light");
      currentThemeName.set("light");
    } else {
      body.classList.remove("light");
      currentThemeName.set("dark");
    }
    localStorage.setItem("lighttheme", !lighttheme);
  }

  function themeSet() {
    let body = document.getElementById("theme-toggle");
    let lighttheme = getThemeSetting();
    if (lighttheme) {
      body.classList.add("light");
      currentThemeName.set("light");
    } else currentThemeName.set("dark");
  }

  function getThemeSetting() {
    return JSON.parse(localStorage.getItem("lighttheme"));
  }

  function jdenticonLoaded() {
    window.jdenticon_config = { replaceMode: "observe" };
  }
</script>

<svelte:head>
  <script src="./jdenticon.min.js" async on:load={jdenticonLoaded}></script>
</svelte:head>
<div
  class="container"
  style={fullPage.includes($currentPage.name) || walletIsLocked
    ? ""
    : "padding-top: 212px"}
>
  {#if $loaded && typeof firstRun !== "undefined"}
    {#if firstRun}
      <svelte:component this={Pages[$currentPage.name]} />
    {:else}
      {#if !walletIsLocked}
        {#if fullPage.includes($currentPage.name)}
          <div class="fullpage">
            <svelte:component this={Pages[$currentPage.name]} />
          </div>
        {:else}
          <NavForApp />
          <div class="main-layout">
            <div class="menu-pane">
              <Menu />
            </div>
            <div class="content-pane flex-column">
              <div class="components" in:fade={{ delay: 0, duration: 500 }}>
                <svelte:component this={Pages[$currentPage.name]} />
              </div>
              {#if whitelabel.footer.show}
                <div class="footer-box">
                  {#if whitelabel.footer.text === "lamden_default"}
                    {"Made with"}
                    <div class="heart">{@html heart}</div>
                    {"by Lamden"}
                  {:else}
                    {whitelabel.footer.text}
                  {/if}
                </div>
              {/if}
            </div>
            {#if showModal}
              <Modal>
                <svelte:component
                  this={Modals[currentModal]}
                  {modalData}
                  {closeModal}
                />
              </Modal>
            {/if}
          </div>
        {/if}
      {/if}
      {#if walletIsLocked}
        <svelte:component this={Pages["LockScreen"]} {loaded} />
      {/if}
    {/if}
  {:else}
    <Loading message={`Loading Lamden Vault`} />
  {/if}
  <LightDarkToggle />
</div>
<svelte:window on:click={(e) => clicked.set(e.target)} />

<style>
  .fullpage {
    flex: 1;
    display: flex;
    justify-content: center;
  }
  .container {
    display: flex;
    padding-top: 97px;
    flex-grow: 1;
    max-width: 1920px;
    margin: 0 auto;
    flex-direction: column;
  }

  .main-layout {
    display: flex;
    flex-direction: row;
    justify-content: left;
    flex-grow: 1;
  }

  .menu-pane {
    width: 83px;
    min-width: 83px;
    z-index: 28;
  }

  .content-pane {
    padding: 21px 30px 0;

    flex-grow: 1;
    box-sizing: border-box;
    max-width: 1612px;
  }
  .components {
    flex-grow: 1;
  }

  .footer-box {
    display: flex;
    flex-direction: row;
    justify-content: center;
    min-height: 70px;
    align-items: flex-start;
    margin-top: 20px;
  }

  .heart {
    margin: 0 4px;
    position: relative;
    width: 13px;
    top: 1px;
  }

  @media (min-width: 1100px) {
    .menu-pane {
      width: 280px;
      min-width: 280px;
    }
  }

  @media (min-width: 1920px) {
    .container {
      margin: 0 auto;
    }
  }
</style>
