<script>
  import { getContext, beforeUpdate } from "svelte";
  import lamden from "lamden-js";
  const { Encoder } = lamden;

  //Stores
  import { activeTab, currentNetwork, currentNetworkName, NetworksStore} from "../../js/stores/stores.js";

  //Components
  import { Components } from "../Router.svelte";
  const { Button, InputBox, DropDown, Kwargs } = Components;

  //Utils
  import { formatKwargs } from "../../js/utils.js";

  //Context
  const { openModal, closeModal } = getContext("app_functions");

  //Props
  export let methods;

  $: argValues = {};
  $: newMethods = [...methods];

  beforeUpdate(() => {
    argValues = {};
  });

  const handleRun = (index) => {
    if (!$currentNetwork.online && $currentNetworkName === 'legacy' && new Date().getTime() < 1675116000000) {
        openModal("MessageBox", {
            title: "Arko Update in Progress",
            text: `The Lamden Network is down pending an upgrade to the Arko Network. All your balances will be transferred to the new network.  Please be patient as we being up the new network.  Visit <a class="text-link text-decoration" href="https://t.me/lamdenchat" target="__blank">Lamden Telegram Room</a> for updates`,
            buttons: [{name: 'Cancel', click: () => closeModal(), class: 'button__solid button__primary'}],
      })
      return
    }

    if ($currentNetwork.online && $currentNetworkName === 'legacy' && new Date().getTime() > 1675116000000) {
        openModal("MessageBox", {
            title: "Network Decommissioned",
            text: `The Legacy Lamden network has been upgraded to the new Arko Network.  Please switch wallet to “Arko Mainnet”.`,
            buttons: [{name: 'Switch To Arko', click: () => {
                let arkomainnet = $NetworksStore.lamden.find(t => t.networkName === "arko" && t.type === "mainnet")
                NetworksStore.setCurrentNetwork(arkomainnet);
                closeModal()
            }, class: 'button__solid button__primary'}, {name: 'Cancel', click: () => closeModal(), class: 'button__solid button__primary'}],
        })
        return
    }

    let kwargs = {};
    methods[index].arguments.forEach((arg) => {
      if (arg.value !== "" && typeof arg.value !== "undefined") {
        try {
          if (arg.type === "Any") {
            kwargs[arg.name] = Encoder(arg.selectedType, arg.value);
          } else {
            kwargs[arg.name] = Encoder(arg.type, arg.value);
          }
        } catch (e) {
          kwargs[arg.name] = e.message;
        }
      }
    });
    openModal("IdeModelMethodTx", {
      contractName: $activeTab.name,
      methodName: methods[index].name,
      kwargs,
    });
  };
  const handleNewArgValues = (e) => {
    argValues[e.detail.methodIndex] = e.detail.argumentList;
  };
</script>

<h2 class="heading">Contract Methods</h2>
<div class="methods flex-row">
  {#each newMethods as method, methodIndex}
    <div class="method">
      <div class="flex-row name-row">
        <h3>{method.name}</h3>
        <button
          class="button__small button__primary run-button text-body3"
          on:click={() => handleRun(methodIndex)}>run</button
        >
      </div>

      {#if method.arguments}
        <Kwargs
          argumentList={method.arguments}
          on:newArgValues={handleNewArgValues}
          {methodIndex}
          bgStyle="secondary"
        />
      {:else}
        <p>This function takes no arguments</p>
      {/if}
    </div>
  {/each}
</div>

<style>
  .methods {
    flex-wrap: wrap;
  }
  .name-row {
    align-items: center;
  }
  .method {
    border: 1px solid var(--color-secondary);
    border-radius: 4px;
    padding: 1rem;
    margin: 1rem 1rem 0 0;
    max-width: calc(100% / 2.18);
    min-width: fit-content;
    width: 100%;
    background: var(--bg-secondary);
    box-shadow: var(--box-shadow-2);
    -webkit-box-shadow: var(--box-shadow-2);
    -moz-box-shadow: var(--box-shadow-2);
  }
  .heading {
    margin: 2em 0 0;
  }
</style>
