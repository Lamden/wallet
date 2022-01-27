<script>
    import { getContext } from 'svelte';
    import Lamden from 'lamden-js'
	//Stores
    import { currentNetwork, NetworksStore, networksDropDownList } from '../../js/stores/stores.js';
    
	//Components
    import { Components }  from '../Router.svelte'
    const { DropDown } = Components;

    //Context
    const { switchPage } = getContext('app_functions');

    export let style;

    $: dropwonList = createNetworkList($networksDropDownList);
    
    const createNetworkList = (networksDropDownList) => {
        if (!networksDropDownList) {
            networksDropDownList = []
        } 
        
        Promise.all(networksDropDownList.map(async item => {
            let instance = new Lamden.Network(item.value)
            item.value.status = instance.ping()
            return item
        }));
        networksDropDownList.push({
            name: "Manage Networks",
            value: "manage",
            selected: false
        })
        return networksDropDownList
    }

    const handleSelected = (e) => {
        let item = e.detail.selected
        if (item.value === 'manage') {
            switchPage("ManageNetwork")
            return;
        }
        NetworksStore.setCurrentNetwork(item.value)
    }
</script>

<style>
    .box{
        position: relative;
        width: 222px;
        margin-right: 66px;
    }
    .wrap{
        position: absolute;
        top: 50%;
        width: 100%;
        transform: translateY(-65%);
    }
</style>

<div class="box">
    <div class="wrap"> 
        <DropDown 
            id="nav-network"
            network={true}
            items={dropwonList}
            label="Network"
            bgStyle={"transparent"}
            innerHeight={"40px"}
            on:selected={(e) => handleSelected(e)} 
        />
    </div>
</div>  