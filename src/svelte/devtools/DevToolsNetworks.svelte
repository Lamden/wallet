<script>
    import { getContext } from 'svelte';

	//Stores
    import { SettingsStore, currentNetwork, networks } from '../../js/stores/stores.js';

	//Components
    import { Components }  from '../../js/router.js';
    const { InputBox, Button, DropDown } = Components;

    //Context
    const { switchPage, openModal, closeModal } = getContext('app_functions');

    //DOM Nodes
    let formField, ipField, nameField

    let name = ''
    let ip = ''
    let port = '8000'
    let checking = false;

    $: addButtonColor = checking ? '' : 'button__purple';
    $: buttonName = checking ? 'Checking For Network' : 'Add Network';
    $: network = {name, ip, port, selected: false}

    function testNetork(){
        ipField.setCustomValidity('')
        return fetch(`http://${ip}:${port}/ping`)
            .then(res => res.json())
            .then(res => {
                checking = false;
                if (res.status !== 'online') {
                    ipField.setCustomValidity("Network is not Online");
                    ipField.reportValidity();
                    return false;
                }
                return true;
            })
            .catch(err => {
                ipField.setCustomValidity("Network cannot be found");
                ipField.reportValidity();
                return false;
            })
    }

    async function formValidation(){
        //if ($networks.find(f => {return f.value.ip === network.ip && f.value.port === network.port})){
        //    ipField.setCustomValidity("Network already added");
        //    ipField.reportValidity();
        //    return;
       // }
        if (formField.checkValidity()){
            checking = true;
            let networkActive = await testNetork();
            checking = false;
            if (networkActive){

                SettingsStore.addNetwork(network);
            }
        }
    }

    function clearIPValidation(){
        ipField.setCustomValidity('')
        ipField.reportValidity();
    }

    function handleSelected(e){
        SettingsStore.setNetwork(e.detail.selected.value)
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
</style>

<div class="edit-networks flex-row">
    <div class="current-network">
        <h5>Current Network</h5>
        <DropDown 
            items={$networks}
            width={"250px"}
            label="Current Network"
            on:selected={(e) => handleSelected(e)} />  
        {#if !$currentNetwork.lamden}
            <Button 
                id="del-network"
                name={`delete ${$currentNetwork.name}`}
                classes={`button__solid`}
                width={'232px'}
                margin={'20px 0 0 0'}
                click={() => openModal('DevToolsDeleteNetwork')}
                disabled={$currentNetwork.lamden} /> 
        {/if} 
    </div>
    <!--<Switch checked={$themeStyle === 'dark'} on:toggleState={toggleTheme}  }/>-->
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
        />
        <InputBox 
            label="IP Address"
            placeholder={"Network IP Address"}
            bind:value={ip}
            bind:thisInput={ipField}
            on:keyup={() => clearIPValidation()}
            width="250px"
            required={true}
        />
        <InputBox 
            label="Port"
            placeholder={"At least 8 symbols"}
            bind:value={port}
            on:keyup={() => clearIPValidation()}
            width="125px"
            styles={'margin-bottom: 20px'}
            required={true}
        />
        <input 
            id="add-network"
            on:click={() => formValidation()}
            bind:value={buttonName}
            class={`button__solid ${addButtonColor} submit submit-button submit-button-text`}
            type="submit"
        />
        
    </form>


</div>