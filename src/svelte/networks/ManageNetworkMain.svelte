<script>
    import { getContext, onMount } from 'svelte';
    import Lamden from 'lamden-js'

	//Stores
    import { NetworksStore, currentNetwork, networksDropDownList, CacheStore, BalancesStore } from '../../js/stores/stores.js';

	//Components
    import InputboxWithList from './InputboxWithList.svelte';
    import { Components, LeftSideFullPage}  from '../Router.svelte';

    const { InputBox, Button, DropDown } = Components;

    //Context
    const { switchPage} = getContext('app_functions');
    const { setMessage, changeStep, setNetwork} = getContext('networks_functions');

    //DOM Nodes
    let formField, hostField, nameField, blockServiceField, currencySymbolField, explorerField, typeFiled

    let name = ''
    let type ='mainnet'
    let types = [{name: 'mainnet', value: 'mainnet'}, {name: 'testnet', value: 'testnet'}, {name: 'devnet', value: 'devnet'}]
    let currencySymbol = ''
    let hosts = []
    let checking = false;
    let added = false;
    let blockService = []
    let explorer;
    
    let currentNet;

    $: network = {name, hosts, currencySymbol,blockservice_hosts: blockService, type, blockExplorer: explorer, lamden: false, selected: false}
    $: isCustomNetwork = currentNet && !currentNet.lamden;
    $: isEdit = isCustomNetwork;
    $: networkList = $networksDropDownList.map(net => {
        if (net.value.lamden && net.value.type === "mainnet"){
            net.selected = true
        } else {
            net.selected = false
        }
        return net
    })

    const formValidation = async () => {
        hostField.setCustomValidity('');
        blockServiceField.setCustomValidity('');
        if (hosts.length === 0){
            hostField.setCustomValidity('Required at least one host')
            blockServiceField.reportValidity();
            return
        }
        if (blockService.length === 0){
            blockServiceField.setCustomValidity('Required at least one block service')
            blockServiceField.reportValidity();
            return
        }
        if (formField.checkValidity()){
            checking = true;
            let curNet = new Lamden.Network(network)
            let networkActive = await curNet.ping()
            checking = false;
            if (networkActive){
                if (!isEdit){
                    let response = NetworksStore.addNetwork(network);
                    if (response.added){
                        setMessage({
                            left: {
                                title: 'Add Finished',
                                content: `You've successfully add a new network!`   
                            },
                            right: {
                                title: 'A New Network Added',  
                            }
                        })
                        changeStep(3);
                    }else{
                        if (response.reason === 'duplicate'){
                            reportValidityMessage(hostField, "Network ip/port already exists")
                        }
                    }
                } else {
                    let response = NetworksStore.updateNetwork(currentNet, network);
                    if (response.updated){
                        setMessage({
                            left: {
                                title: 'Updated Success',
                                content: `You've successfully updated a existing network!`   
                            },
                            right: {
                                title: 'An Existing Network Updated',  
                            }
                        })
                        changeStep(3);
                    }
                }
            }else{
                reportValidityMessage(hostField, "Cannot contact network")
            }
        }
        
    }

    const clearFields = () => {
        name = ''
        type ='mainnet'
        typeFiled.handleClick(types[0], 0)
        currencySymbol = ''
        hosts = []
        blockService = []
        explorer = '';
    }

    const clearIPValidation = () => {
        reportValidityMessage(hostField, '')
    }

    const handleNetworkSelected = (e) => {
        clearFields()
        currentNet = e.detail.selected.value
        setNetwork(new Lamden.Network(currentNet))
        if (!e.detail.selected.value.lamden){
            currencySymbol = e.detail.selected.value.currencySymbol
            name = e.detail.selected.value.name
            type = e.detail.selected.value.type
            hosts = [...e.detail.selected.value.hosts]
            blockService = e.detail.selected.value.blockservice_hosts? [...e.detail.selected.value.blockservice_hosts] : []
            explorer = e.detail.selected.value.blockExplorer
            checking = false;
            added = false;
            let index = types.findIndex(item => item.value === type);
            typeFiled.handleClick(types[index], index)
        }
    }

    const handleTypeSelected = (e) => {
        type = e.detail.selected.value;
    }

    const clearCache = () => {
        CacheStore.refreshAllCache($currentNetwork)
        BalancesStore.refreshAllCache($currentNetwork)
    }

    const reportValidityMessage = (node, message) => {
        node.setCustomValidity(message);
        node.reportValidity();
    }

    const pingHost = (url) => {
        return fetch(`${url}/ping`)
        .then(res => res.json())
        .then(data => data.status === "online")
        .catch(() => false)
    }

    const pingBlock = (url) => {
        return fetch(`${url}/ping`)
        .then(res => res.text())
        .then(text => text === "pong")
        .catch(() => false)
    }
</script>

<style>
.current-network{
    justify-content: space-between;
    border-right: 1px solid var(--divider-light);
    padding-right: 46px;
}
.add-network{
    margin: 0 3rem;
}
.desc{
    line-height: 24px;
}
h6{
    text-align: left;
}
</style>

<LeftSideFullPage title={"Custom Networks"} helpLink="/wallet/network_overview">
    <div slot="body">
        <div class="text-body1 weight-400 desc">
            As the Lamden ecosystem grows, a very popular option for building new technologies is to build a custom network that allows users to transfer tokens, or value of some kind, between the networks. 
        </div>
    </div>
    <div slot="content">
        <div class="edit-networks flex-row">
            <div class="current-network flex-column">
                <div>
                    <h6>Manage Networks</h6>
                    <DropDown 
                        items={networkList}
                        width={"347px"}
                        label="Current Network"
                        on:selected={(e) => handleNetworkSelected(e)} 
                    />  
                    <!-- <Button 
                        id="clear-cache-network"
                        name={"Clear Network Cache"}
                        classes={`button__solid`}
                        width={'100%'}
                        margin={'20px 0 0 0'}
                        click={clearCache}
                    /> -->
                </div>
            </div>
            <div>
        
            </div>
            <form id="network_from" on:submit|preventDefault={() => {} } bind:this={formField} target="_self">
            <div class="add-network">
                <h6>{isCustomNetwork? "Edit Network" : "Add Network"}</h6>
                <InputBox 
                    id="name"
                    label="Name"
                    placeholder={"Network Name"}
                    bind:value={name}
                    bind:thisInput={nameField}
                    on:changed={(e) => {
                        nameField.setCustomValidity('')
                        if (!e.detail) return;
                        name = e.detail.target.value.trim();
                        if (name.toLowerCase() === 'lamden mainnet' || name.toLowerCase() === 'lamden testnet'){
                            nameField.setCustomValidity('Reserved name cannot be set');
                            nameField.reportValidity();
                        }
                    }}
                    width="347px"
                    margin="0 0 1rem 0"
                    required={true}
                    spellcheck={false}
                />
                <DropDown
                    id="type"
                    bind:this={typeFiled}
                    items={types}
                    width={"347px"}
                    label="Type"
                    margin="0 0 .5rem 0"
                    on:selected={(e) => handleTypeSelected(e)} 
                />  
                <InputBox 
                    id="currencySymbol"
                    label="Currency Symbol"
                    placeholder={"currencySymbol"}
                    bind:value={currencySymbol}
                    bind:thisInput={currencySymbolField}
                    on:changed={(e) => {
                        currencySymbolField.setCustomValidity('')
                        if (!e.detail) return;
                        currencySymbol = e.detail.target.value.trim();
                        let len = currencySymbol.length;
                        if (len<2){
                            currencySymbolField.setCustomValidity('Minimum 2 characters');
                            currencySymbolField.reportValidity();
                        }
                        // if (len>4){
                        //     currencySymbolField.setCustomValidity('Maximum 4 characters');
                        //     currencySymbolField.reportValidity();
                        // }
                        let sym = currencySymbol.toLowerCase();
                        if (sym === 'tau' || sym === 'dtau'){
                            currencySymbolField.setCustomValidity('Currency Symbol can not be tau');
                            currencySymbolField.reportValidity();
                        }
                    }}
                    width="347px"
                    margin="0 0 0.5rem 0"
                    required={true}
                    spellcheck={false}
                />
                <InputboxWithList 
                    id="hostlist"
                    label="Hosts"
                    placeholder={"http://<your host>"}
                    bind:value={hosts}
                    bind:thisInput={hostField}
                    on:keyup={() => clearIPValidation()}
                    width="347px"
                    margin="1.5rem 0 1.5rem 0"
                    required={true}
                    spellcheck={false}
                    ping={pingHost}
                />
                <InputboxWithList 
                    id="blockServiceList"
                    label="Block Service Hosts"
                    placeholder={"http://<your block service>"}
                    bind:value={blockService}
                    bind:thisInput={blockServiceField}
                    on:keyup={() => clearIPValidation()}
                    width="347px"
                    margin="0 0 0.5rem 0"
                    required={true}
                    spellcheck={false}
                    ping={pingBlock}
                />
                <InputBox 
                    id="explorer"
                    label="Block Explorer (optional)"
                    placeholder={"http://<your explorer>"}
                    bind:value={explorer}
                    bind:thisInput={explorerField}
                    on:changed={(e) => {
                        explorer = e.detail.target.value.trim();
                    }}
                    on:keyup={() => clearIPValidation()}
                    width="347px"
                    margin="0 0 1.5rem 0"
                    required={false}
                    spellcheck={false}
                />
                <input  
                    id="save"
                    on:click={() => formValidation()}
                    form="network_from"
                    class="button__solid button__primary submit submit-button submit-button-text"
                    type="submit" 
                    style="width: 347px;margin: 0 0 .625rem 0"
                    value={isCustomNetwork? "Save" : "Add Network"} /> 
                {#if isCustomNetwork}
                <Button id="remove"
                    classes={'button__solid'}
                    margin={'0 0 .625rem 0'}
                    width="347px"
                    name= {"Remove Network"}
                    click={() => changeStep(2)} />
                {/if}
                <Button id="back"
                    classes={'button__solid'}
                    margin={'0 0 .625rem 0'}
                    name="Back" 
                    width="347px"
                    click={() => switchPage("Settings")} />  
            </div>
            </form>
        </div>
    </div>
</LeftSideFullPage>