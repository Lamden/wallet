<script>
    import { getContext } from 'svelte';

	//Stores
    import { NetworksStore, currentNetwork, networksDropDownList, CoinStore, CacheStore, networkTypesDropDownList } from '../../js/stores/stores.js';

	//Components
    import { Components }  from '../Router.svelte';
    const { InputBox, Button, DropDown } = Components;

    //Context
    const { openModal, closeModal } = getContext('app_functions');

    //DOM Nodes
    let formField, hostField, nameField

    let name = ''
    let host = ''
    let port = '8000'
    let type = 'mockchain'
    let checking = false;
    let added = false;

    $: addButtonColor = checking ? '' : 'button__purple';
    $: buttonName = checking ? 'Checking For Network' : added ? 'Added!' : 'Add Network';
    $: network = {name, host, port, type, lamden: false, selected: false}

    async function formValidation(){
        if (formField.checkValidity()){
            checking = true;
            let networkActive = await $currentNetwork.ping()
            checking = false;
            if (networkActive){
                let response = NetworksStore.addNetwork(network);
                if (response.added){
                    clearFields();
                }else{
                    if (response.reason === 'duplicate'){
                        reportValidityMessage(hostField, "Network ip/port already exists")
                    }
                }
            }else{
                reportValidityMessage(hostField, "Cannot contact network")
            }
        }
        
    }

    function clearFields(){
        host = ''
        port = ''
        name = ''
    }

    function clearIPValidation(){
        reportValidityMessage(hostField, '')
    }

    function handleSelected(e){
        NetworksStore.setCurrentNetwork(e.detail.selected.value)
        $CoinStore.map(async (coin) => {
            let balance = await $currentNetwork.API.getTauBalance(coin.vk);
            if (!coin.balance) CoinStore.updateBalance(balance)
            if (balance !== coin.balance) CoinStore.updateBalance(balance)
        })
    }

    function handleTypeSelected(e){
        type = e.detail.selected.value
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
.current-network{
    justify-content: space-between;
    border-right: 1px solid #313131;
    padding-right: 46px;
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
    height: 42px;
}
</style>

<div class="edit-networks flex-row">
    <div class="current-network flex-column">
        <div>
            <h5>Current Network</h5>
            <DropDown 
                items={$networksDropDownList}
                width={"250px"}
                label="Current Network"
                on:selected={(e) => handleSelected(e)} 
            />  
            <Button 
                id="clear-cache-network"
                name={"Clear Network Cache"}
                classes={`button__solid`}
                width={'100%'}
                margin={'20px 0 0 0'}
                click={clearCache}
            />
        </div>
        {#if !$currentNetwork.lamden}
        <Button 
            id="del-network"
            name={`remove network`}
            classes={`button__solid button__red`}
            width={'100%'}
            margin={'20px 0 0 0'}
            click={() => openModal('DevToolsDeleteNetwork')}
            />
        {:else}
        <div></div>
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
        <DropDown 
            items={networkTypesDropDownList()}
            width={"250px"}
            height={"42px"}
            styles={'margin-bottom: 3px'}
            label="Network Type"
            on:selected={(e) => handleTypeSelected(e)} />  
        <InputBox 
            label="Hostname (IP)"
            placeholder={"http://<your host>"}
            bind:value={host}
            bind:thisInput={hostField}
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