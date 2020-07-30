<script>
    import { getContext } from 'svelte'

    //Stores
    import { FilesStore, currentNetwork } from '../../js/stores/stores.js';

	//Components
    import { Components }  from '../Router.svelte';
    const { Button, InputBox } = Components;

    //Context
    const { closeModal } = getContext('app_functions');

    //Dom Nodes
    let contractField;

    let contractName = "";
    let contractExists = false;

    const newTabFile = () => {
        FilesStore.addDefaultFile();
        closeModal();
    }

    const newTabBlankFile = () => {
        FilesStore.addBlankFile();
        closeModal();
    }

    const newTabContract = async () => {
        if (contractName === "") {
            setValidity('Cannot be Empty');
            return;
        }
        let contractInfo = await $currentNetwork.API.getContractInfo(contractName)
        if (typeof contractInfo === 'undefined'){
            setValidity(`Network Error`);
            return
        }
        if (contractInfo.error){
            setValidity(`${contractName} does not exist on ${$currentNetwork.name}`);
            return
        }
        let methods = await $currentNetwork.API.getContractMethods(contractName)
        try {
            FilesStore.addFile(contractInfo.name, contractInfo.code, methods, $currentNetwork);
            closeModal();
        } catch (e){}
    }

    const refreshValidity = (e) => {
        contractField.setCustomValidity('');
        contractField.reportValidity();
    }

    const setValidity = (message) => {
        contractField.setCustomValidity(message);
        contractField.reportValidity();
    }

    const refreshValidityKeyup = (e) => { 
        if (e.detail.keyCode !== 13) {
            contractField.reportValidity();
            contractField.setCustomValidity('');
        }else{
            newTabContract()
        }
    }
    
</script>

<style>
.container{
    min-width: 600px;
}

.new-row{
    justify-content: space-evenly;
}

.existing-row{
    justify-content: space-evenly;
    align-items: flex-end;
}
.cancel-row{
    align-items: center;
    padding: 2rem 0 1rem;
}
</style>

<div class="container flex-column">
    <div class="flex-column">
        <h5>Open Contract</h5>
        <div class="text-subtitle3">
            Start a new contract or Open and existing contract from the blockchain
        </div>
    </div>
    <h4>New</h4>
    <div class="flex-row new-row">
        <Button 
            id={'newTab-btn'} 
            classes={'button__transparent'}
            width={'40%'}
            name="Blank Contract"
            click={newTabBlankFile} 
        />
        <Button 
            id={'newTab-btn'} 
            classes={'button__transparent'}
            width={'40%'}
            name="Example Contract"
            click={newTabFile} 
        />
    </div>

    <h4>From Blockchain</h4>
    <div class="flex-row existing-row">
        <InputBox
            id={'contract-input'}
            label={`Contract (${$currentNetwork.name})`}
            width={'50%'}
            height={'42px'}
            bind:thisInput={contractField}
            bind:value={contractName}
            on:changed={refreshValidity}
            on:keyup={refreshValidityKeyup}
        />
        <Button 
            id={'contractTab-btn'} 
            classes={'button__solid button__purple'}
            name="Open"
            width={'30%'}
            height={'42px'}
            margin={'0 0 2px 0'}
            click={newTabContract} 
        />
    </div>
    <div class="flex-column cancel-row">
        <Button classes={'button__text text-caption'} 
                width={'125px'}
                height={'24px'}
                padding={0}
                name="Cancel" 
                click={closeModal} 
        />
    </div>
</div>