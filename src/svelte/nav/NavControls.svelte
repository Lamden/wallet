<script>
  import { getContext } from "svelte";
  import Lamden from "lamden-js";
  //Stores
  import {
    currentNetwork,
    NetworksStore,
    networksDropDownList,
    SettingsStore,
    FiatListDown,
  } from "../../js/stores/stores.js";

  //Components
  import { Components } from "../Router.svelte";
  const { DropDown } = Components;

  //Context
  const { switchPage } = getContext("app_functions");

  $: dropwonList = createNetworkList($networksDropDownList);
  $: fiatList = $FiatListDown;

  const createNetworkList = (networksDropDownList) => {
    if (!networksDropDownList) {
      networksDropDownList = [];
    }

    Promise.all(
      networksDropDownList.map(async (item) => {
        let instance = new Lamden.Network(item.value);
        item.value.status = instance.ping();
        return item;
      })
    );
    networksDropDownList.push({
      name: "Manage Networks",
      value: "manage",
      selected: false,
    });
    return networksDropDownList;
  };

  const handleSelected = (e) => {
    let item = e.detail.selected;
    if (item.value === "manage") {
      switchPage("ManageNetwork");
      return;
    }
    NetworksStore.setCurrentNetwork(item.value);
  };

  const handleFiatSelected = (e) => {
    let item = e.detail.selected;
    SettingsStore.setFiatCurrency(item.name);
  };
</script>

<div class="box">
  <div class="wrap">
    <DropDown
      id="nav-network"
      network={true}
      items={dropwonList}
      label="Network"
      bgStyle={"transparent"}
      innerHeight={"40px"}
      labelcolor={"white"}
      styles={"color: white"}
      on:selected={(e) => handleSelected(e)}
    />
    <DropDown
      id="nav-fiat"
      classes="fiat-dropdown"
      network={true}
      items={fiatList}
      label="Currency"
      bgStyle={"transparent"}
      innerHeight={"40px"}
      labelcolor={"white"}
      styles={"color: white"}
      on:selected={(e) => handleFiatSelected(e)}
    />
  </div>
</div>

<style>
  .box {
    position: relative;
    flex-basis: 300px;
  }
  .wrap {
    position: absolute;
    top: 50%;
    width: 222px;
    transform: translateY(-65%);
  }

  @media (max-width: 960px) {
    .wrap {
      width: 190px;
    }
  }
</style>
