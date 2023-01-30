<script>
  import { getContext, onMount } from "svelte";

  //Components
  import Button from "../components/Button.svelte";
  import InputBox from "../components/InputBox.svelte";

  //Images
  import hero_bg from "../../img/backgrounds/hero_bg.png";
  import approve from "../../img/menu_icons/icon_approve.svg";

  //Icons
  import SmartContractIcon from "../icons/SmartContractIcon.svelte";
  import NetworkIcon from "../icons/NetworkIcon.svelte";
  import process from "../../img/menu_icons/icon_process.svg";
  import arrow_right from "../../img/menu_icons/icon_arrow-right-2color.svg";

  import BN from "bignumber.js";

  //Context
  const { approveTx, close, openNewTab } = getContext("confirm_functions");

  export let confirmData;

  let stampobj;

  const txData = confirmData.messageData.txData;
  const wallet = confirmData.messageData.wallet;
  const dappInfo = confirmData.messageData.dappInfo;
  const blockserviceUrl = confirmData.messageData.network.blockservice.hosts[0];
  const currencySymbol = confirmData.messageData.network.currencySymbol;

  let stampLimit = txData.txInfo.stampLimit < 1 ? 1 : txData.txInfo.stampLimit;
  let prevStampLimit = stampLimit;
  let prevInputValue = prevStampLimit;
  let stampLimitEdit = false;
  let stampLimitBtnName = "Change";

  let prevent = false;

  // default 10
  let stampRatio = new BN(10);
  let balances = new BN(0);

  $: maxStamps = balances.multipliedBy(stampRatio).toNumber();
  $: errormsg = txData.txInfo.error ? txData.txInfo.error :
    stampLimit > maxStamps
      ? `Insufficient ${currencySymbol} to pay for stamps`
      : undefined;

  onMount(() => {
    fetch(`${blockserviceUrl}/current/one/stamp_cost/S/value`)
      .then((res) => res.json())
      .then((res) => {
        stampRatio = new BN(res.value);
      })
      .catch(() => (stampRatio = new BN(10)));
    fetch(`${blockserviceUrl}/current/one/currency/balances/${wallet.vk}`)
      .then((res) => res.json())
      .then((res) => {
        console.log(res);
        if (res.value.__fixed__) {
          balances = new BN(res.value.__fixed__);
        } else {
          throw new Error("Fetch balance failed");
        }
      })
      .catch(() => {
        chrome.storage.local.get({ balances: {} }, function (getValue) {
          let netkey = networkKey(confirmData.messageData.network);
          balances = new BN(getValue["balances"][netkey][wallet.vk]["balance"]);
        });
      });
  });

  function networkKey(networkObj) {
    return `${networkObj.name}|${networkObj.type}|${
      networkObj.lamden ? "lamden" : "user"
    }`;
  }
  const setStampLimit = (value) => {
    prevStampLimit = stampLimit;
    stampLimit = value;
  };

  const setValidity = (node, message) => {
    node.setCustomValidity(message);
    node.reportValidity();
  };

  const handleStampClick = () => {
    if (stampLimitEdit) {
      stampLimitBtnName = "Change";
      stampLimitEdit = false;
      setStampLimit(stampLimit);
    } else {
      stampLimitBtnName = "Save";
      stampLimitEdit = true;
      setStampLimit(stampLimit);
    }
  };

  const handleCancel = () => {
    stampLimitBtnName = "Change";
    stampLimitEdit = false;
    setStampLimit(prevStampLimit);
  };

  const handleApprove = () => {
    if (stampLimit != txData.txInfo.stampLimit) {
      chrome.runtime.sendMessage(
        { type: "updateStampLimit", data: stampLimit },
        (res) => {
          if (res && res.success) {
            approveTx();
          }
        }
      );
    } else {
      approveTx();
    }
  };

  const handleChange = (e) => {
    let value = e.detail.target.value;
    stampLimit = value === null || value < 1 ? prevInputValue : parseInt(value);
    stampobj.value = stampLimit;
    prevInputValue = stampLimit;
  };
</script>

<div
  class="flex-column hero-rec popup"
  style="background-image: url({hero_bg})"
>
  <h3>{`Confirm Transaction`}</h3>
  <div class="flex-row dapp-name">
    <img src={`${dappInfo.url}${dappInfo.logo}`} alt="app logo" />
    <p class="text-body1">{`${dappInfo.appName}`}</p>
  </div>
  <a
    class="text-link"
    href={dappInfo.url}
    rel="noopener noreferrer"
    target="_blank">{`source ${dappInfo.url}`}</a
  >
</div>
<div class="details flex-column">
  <div class="approve-items flex-column">
    <div class="item flex-row">
      <div class="item_icon">
        <NetworkIcon width="34px" />
      </div>
      <div class="item_info flex-column">
        <p class="text-body2 text-secondary">{`Network`}</p>
        <p class="item_value text-body2">
          {confirmData.messageData.network.name}
        </p>
      </div>
    </div>
    <div class="item flex-row">
      <div class="item_icon item_icon_size">
        <SmartContractIcon width="36px" />
      </div>
      <div class="item_info flex-column">
        <p class="text-body2 text-secondary">{`Smart Contract`}</p>
        <p class="item_value text-body2">{txData.txInfo.contractName}</p>
      </div>
    </div>
    <div class="item flex-row">
      <div class="item_icon item_icon_size">
        {@html process}
      </div>
      <div class="item_info flex-column">
        <p class="text-body2 text-secondary">{`Action`}</p>
        <p class="item_value text-body2">{txData.txInfo.methodName}</p>
      </div>
    </div>
    <div class="item flex-row">
      <div class="item_icon item_icon_size">
        {@html approve}
      </div>
      <div class="item_info flex-column">
        <p class="text-body2 text-secondary">{txData.txInfo.isEstimated? `Estimated Stamps` : `Stamp Limit`}</p>
        <p class="item_value text-body2 flex flex-align-center" id="stamps">
          {#if stampLimitEdit}
            <InputBox
              id="stamp-input"
              value={stampLimit}
              on:changed={handleChange}
              bind:thisInput={stampobj}
              inputType={"number"}
              width={"100px"}
              required={true}
              autofocus={true}
            />
          {:else}
            {stampLimit}
          {/if}
          <span
            class="text-link"
            id="change-btn"
            on:click={handleStampClick}
            style="
                        margin-top: 0;
                        margin-left: 10px;
                        word-break: normal; 
                        color: var(--font-accent);
                    ">{stampLimitBtnName}</span
          >
          {#if stampLimitEdit}
            <span
              class="text-link"
              id="cancel-btn"
              on:click={handleCancel}
              style="
                        margin-top: 0;
                        margin-left: 10px;
                        word-break: normal; 
                        color: var(--font-accent);
                        ">Cancel</span
            >
          {/if}
          <a
            class="text-link"
            href="https://docs.lamden.io/docs/wallet/accounts_linked_transfer"
            target="_blank"
            style="
                        margin-top: 0;
                        margin-left: 10px;
                        word-break: normal; 
                        text-decoration: underline;
                        color: var(--font-accent);
                        ">help</a
          >
        </p>
      </div>
    </div>
    {#if errormsg}
      <div class="error-msg">{errormsg}</div>
    {/if}
  </div>
  <div class="kwargs flex-column">
    {#each Object.keys(txData.txInfo.kwargs) as kwarg}
      <div class="flex-row">
        <div class="kwarg_icon">{@html arrow_right}</div>
        <p class="text-subtitle2 text-body2">{kwarg}</p>
      </div>
      <div class="kwarg-value text-subtitle4 text-secondary">
        {JSON.stringify(txData.txInfo.kwargs[kwarg])}
      </div>
    {/each}
  </div>
  <div class="flex-column buttons ">
    <Button
      id={"approve-btn"}
      classes={"button__solid button__primary"}
      name="Approve"
      width={"240px"}
      height={"42px"}
      margin={"0 0 0.5rem 0"}
      disabled={!!errormsg}
      click={handleApprove}
    />
    <Button
      id={"deny-btn"}
      classes={"button__solid"}
      name="Deny"
      width={"240px"}
      height={"42px"}
      margin={"0 0 0.5rem 0"}
      click={close}
    />

    <a
      class="text-link help"
      href={"https://docs.lamden.io/docs/wallet/accounts_linked_transfer"}
      rel="noopener noreferrer"
      target="_blank">what is this?</a
    >
  </div>
</div>

<style>
  .error-msg {
    color: var(--error-color);
  }
  p {
    margin: 0;
  }
  .details {
    flex-grow: 1;
    padding: 1rem;
  }
  .approve-items {
    width: 100%;
  }
  .approve-items .item {
    margin-bottom: 0.75rem;
    align-items: center;
  }
  .approve-items .item_icon {
    min-width: 22px;
    height: 32px;
  }
  .approve-items .item_icon_size {
    width: 37px;
    position: relative;
    top: -4px;
  }
  .approve-items .item_value {
    max-width: 100%;
    word-break: break-word;
  }

  .approve-items .item:last-child {
    border-right: none;
  }
  .approve-items .item p {
    margin: 0 0 0.25px 0;
  }

  .item .item_info {
    margin-left: 8px;
  }
  .kwargs {
    box-sizing: border-box;
    align-items: flex-start;
    width: 100%;
    padding: 0 0.5rem;
    flex-grow: 1;
    max-height: 120px;
    overflow-y: auto;
    overflow-x: hidden;
    margin: 1rem 0;
  }
  .kwarg-value {
    word-break: break-word;
    margin-bottom: 0.5rem;
  }

  .kwarg-value:last-child {
    margin-bottom: unset;
  }
  .buttons {
    align-items: center;
    flex-grow: 1;
    justify-content: flex-end;
  }
  a.help {
    text-align: center;
  }
  .kwargs .flex-row {
    align-items: center;
  }
  .kwarg_icon {
    width: 15px;
    margin-right: 5px;
    position: relative;
    top: 1px;
  }
  .text-link,
  .text-link:visited,
  .text-link:focus {
    margin: 0.5rem 0 0 0;
    color: var(--font-warning);
  }
</style>
