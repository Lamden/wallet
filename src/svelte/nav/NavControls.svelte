<script>
  import { getContext, onMount } from "svelte";
  import Lamden from "lamden-js";
  //Stores
  import {
    currentNetwork,
    NetworksStore,
    networksDropDownList,
    SettingsStore,
    FiatListDown,
    menu_open
  } from "../../js/stores/stores.js";

  //Components
  import { Components } from "../Router.svelte";
  const { DropDown } = Components;

  //Context
  const { switchPage } = getContext("app_functions");

  $: dropdownList = createNetworkList($networksDropDownList);
  $: fiatList = $FiatListDown;

  onMount(() => {
    checkStatus()
  })

  const checkStatus = () => {
    Promise.all(
        $networksDropDownList.map(async (item) => {
            if (item.value === "manage") return;
            let instance = new Lamden.Network(item.value);
            let status = await instance.API.pingServer();
            NetworksStore.setNetworkStatus(instance, status)
        })
    );
  }

  const createNetworkList = (networksDropDownList) => {
    if (!networksDropDownList) {
      networksDropDownList = [];
    }

    if (!networksDropDownList.find(f => f.name === "Manage Networks")){
      networksDropDownList.push({
        name: "Manage Networks",
        value: "manage",
        selected: false,
      });
    }


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

<div class="box" class:show={$menu_open}>
    <DropDown
      id="nav-network"
      network={true}
      items={dropdownList}
      label="Network"
      bgStyle={"transparent"}
      innerHeight={"40px"}
      labelcolor={"white"}
      styles={"color: white;"}
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
      styles={"color: white;"}
      on:selected={(e) => handleFiatSelected(e)}
    />
</div>

<style>
  .box {
    box-sizing: border-box;
    position: absolute;
    top: 15px;
    right: 15px;
    width: 100%;
    max-width: 200px;
  }

  @media (max-width: 830px) {
    .box{
      display: none;
      position: relative;
      flex-direction: row;
      right: unset;

      margin-top: 3px;
      margin-left: 30px;
      width: 100%;
    }
    .box.show {
      display: flex;
    }
  }

  @media (max-width: 350px) {
    .box{
      justify-content: space-between;
      margin-top: 2.5rem;
      margin-left: 0px;
      max-width: unset;
    }
  }
</style>
