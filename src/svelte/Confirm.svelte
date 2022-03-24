<script>
  import { onMount, onDestroy, setContext } from "svelte";

  //Stores
  import { currentThemeName } from "../js/stores/stores.js";

  //Images
  import logo_full from "../img/logo_full.svg";

  //Components
  import ApproveConnection from "./confirms/ApproveConnection.svelte";
  import ApproveTransaction from "./confirms/ApproveTransaction.svelte";
  import CurrencyApproval from "./confirms/CurrencyApproval.svelte";
  import ChangeAccount from "./confirms/ChanageAccount.svelte";

  setContext("confirm_functions", {
    approveApp: () => sendApproveApp(),
    setTrusted: (trusted) => (trustedApp = trusted),
    setFunding: (funding) => setFundingInfo(funding),
    approveTx: () => sendApprovetx(),
    close: () => closePopup(),
    openNewTab: (url) => openNewTab(url),
    logoFormat: (logo) => fixLogo(logo),
    setAccount: (account) => (accountInfo = account),
  });

  const componentMap = {
    ApproveConnection,
    ApproveTransaction,
    CurrencyApproval,
    ChangeAccount,
  };
  let confirmData;

  let confirmed = false;
  let trustedApp = false;
  let fundingInfo = false;
  let accountInfo = false;

  onMount(() => {
    chrome.runtime.sendMessage({ type: "getConfirmInfo" }, (response) => {
      if (response) confirmData = response;
    });

    themeSet();

    return () => {
      window.removeEventListener("beforeunload", sendRejection);
    };
  });

  const confirm = () => (confirmed = true);

  const setFundingInfo = (funding) => {
    fundingInfo = funding;
  };

  const sendApproveApp = () => {
    confirm();
    chrome.runtime.sendMessage({
      type: "approveDapp",
      data: { trustedApp, fundingInfo, accountInfo },
    });
    closePopup();
  };

  const sendApprovetx = () => {
    confirm();
    chrome.runtime.sendMessage({ type: "approveTransaction" });
    closePopup();
  };

  const closePopup = () => {
    window.close();
  };

  const openNewTab = (url) => {
    window.open(url, "_blank");
  };

  const sendRejection = () => {
    if (!confirmed)
      chrome.runtime.sendMessage({ type: "denyPopup", data: confirmData.type });
  };

  const fixLogo = (logo) =>
    logo.substring(0, 1) === "/" ? logo.substring(1, logo.length) : logo;

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

  window.addEventListener("beforeunload", sendRejection);
</script>

{#if confirmData}
  <div class="flex-column container">
    <div class="popup-box flex-row" style="fill: var(--font-primary)">
      <div class="logo">{@html logo_full}</div>
    </div>
    <svelte:component this={componentMap[confirmData.type]} {confirmData} />
  </div>
{/if}

<style>
  .container {
    width: -webkit-fill-available;
  }

  .popup-box {
    border-bottom: 1px solid gray;
    padding: 1rem;
  }

  .logo {
    width: 100px;
  }
</style>
