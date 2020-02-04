<script>
    import { getContext } from 'svelte';

	//Stores
    import { NetworksStore, currentNetwork, networksDropDownList, CoinStore, CacheStore } from '../../js/stores/stores.js';

	//Components
    import { Components }  from '../Router.svelte';
    const { InputBox, Button, DropDown } = Components;

    //Utils
    import { pingServer, getTauBalance  } from '../../js/lamden/masternode-api.js';

    //Context
    const { switchPage, openModal, closeModal } = getContext('app_functions');

    //DOM Nodes
    let formField, ipField, nameField

    let name = ''
    let ip = ''
    let port = '8000'
    let checking = false;
    let added = false;

    $: addButtonColor = checking ? '' : 'button__purple';
    $: buttonName = checking ? 'Checking For Network' : added ? 'Added!' : 'Add Network';
    $: network = {name, ip, port, lamden: false, selected: false}

    async function formValidation(){
        if (formField.checkValidity()){
            checking = true;
            let networkActive = await pingServer({ip, port})
            checking = false;
            if (networkActive){
                let response = NetworksStore.addNetwork(network);
                if (response.added){
                    clearFields();
                }else{
                    if (response.reason === 'duplicate'){
                        reportValidityMessage(ipField, "Network ip/port already exists")
                    }
                }
            }else{
                reportValidityMessage(ipField, "Cannot contact network")
            }
        }
        
    }

    function clearFields(){
        ip = ''
        port = ''
        name = ''
    }

    function clearIPValidation(){
        reportValidityMessage(ipField, '')
    }

    function handleSelected(e){
        NetworksStore.setCurrentNetwork(e.detail.selected.value)
        $CoinStore.map(async (coin) => {
            let balance = await getTauBalance($currentNetwork, coin.vk);
            if (!coin.balance) CoinStore.updateBalance(balance)
            if (balance !== coin.balance) CoinStore.updateBalance(balance)
        })
    }

    function clearCache(){
        CacheStore.refreshNetwork($currentNetwork.name)
    }

    function reportValidityMessage(node, message){
        node.setCustomValidity(message);
        node.reportValidity();
    }

</script>

<style>
.edit-networks{
    margin-bottom: 3rem;
}
.add-network{
    margin: 0 3rem;
}
.ip-box{
    margin-bottom: 20px;
}
.delete-heading{
    margin-bottom: 27px;
}
.submit{
    height: 46px;
}
</style>

<div class="edit-networks flex-row">
    <div class="current-network">
        <h5>Current Network</h5>
        <DropDown 
            items={$networksDropDownList}
            width={"250px"}
            label="Current Network"
            on:selected={(e) => handleSelected(e)} />  
        <Button 
            id="clear-cache-network"
            name={"Clear Network Cache"}
            classes={`button__solid`}
            width={'100%'}
            margin={'20px 0 0 0'}
            click={clearCache}
        /> 
        {#if !$currentNetwork}
            <Button 
                id="del-network"
                name={`delete current network`}
                classes={`button__solid`}
                width={'100%'}
                margin={'20px 0 0 0'}
                click={() => openModal('DevToolsDeleteNetwork')}
                disabled={$currentNetwork.lamden} />
        {/if} 
    </div>
    <div>

    </div>
    <form class="add-network" on:submit|preventDefault={() => {} } bind:this={formField} target="_self">
        <h5>Add Network</h5>
        <InputBox 
            label="Name"
            placeholder={"Network Name"}
            bind:value={name}
            bind:thisInput={nameField}
            width="250px"
            styles={'margin-bottom: 20px'}
            required={true}
            spellcheck={false}
        />
        <InputBox 
            label="IP Address"
            placeholder={"http://<your host>"}
            bind:value={ip}
            bind:thisInput={ipField}
            on:keyup={() => clearIPValidation()}
            width="250px"
            required={true}
            spellcheck={false}
        />
        <InputBox 
            label="Port"
            placeholder={"Enter Port"}
            bind:value={port}
            on:keyup={() => clearIPValidation()}
            width="125px"
            styles={'margin-bottom: 20px'}
            required={true}
            spellcheck={false}
        />
        <input 
            id="add-network"
            on:click={() => formValidation()}
            bind:value={buttonName}
            class={`button__solid ${addButtonColor} submit submit-button submit-button-text submit`}
            type="submit"
        />
        
    </form>


</div>