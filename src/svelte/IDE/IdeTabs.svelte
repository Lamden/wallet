<script>
    import { getContext } from 'svelte'

	//Stores
    import { FilesStore, currentNetwork, currentNetworkName, NetworksStore } from '../../js/stores/stores.js';

	//Components
    import { IdeTab }  from '../Router.svelte'
    
    //Images
    import plus from '../../img/menu_icons/icon_plus.svg';

    //Context
    const { openModal, closeModal } = getContext('app_functions');

    const addTab = () => {
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
        openModal('IdeModelNewTab');
    }
    

</script>

<style>
.new-button{
    display: flex;
    align-items: center;
    cursor: pointer;
    position: relative;
}
.new-button:hover{
    top: -1px;
}
.plus-icon{
    width: 20px;
    margin: 0 5px;
}
.tab-row{
    padding: 0px 10px 10px;
    flex-wrap: wrap;
}
</style>

<div class="flex-row tab-row">
<div class="new-button" on:click={addTab}>
    <div class="plus-icon" >{@html plus}</div>
</div>
{#each $FilesStore as file, index}
    <IdeTab {file} {index} />
{/each}
</div>
