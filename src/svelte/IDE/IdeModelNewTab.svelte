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

    function newTabFile(){
        FilesStore.addDefaultFile();
        closeModal();
    }

    async function newTabContract(){
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

    function refreshValidity(e){
        contractField.setCustomValidity('');
        contractField.reportValidity();
    }

    function setValidity(message){
        contractField.setCustomValidity(message);
        contractField.reportValidity();
    }

    function refreshValidityKeyup(e){ 
        if (e.detail.keyCode !== 13) {
            contractField.reportValidity();
            contractField.setCustomValidity('');
        }
    }
    
</script>

<style>
.container{
    min-width: 600px;
    align-items: center;
}

.contract-row{
    align-items: flex-end;
    margin-bottom: 1rem;
}

</style>

<div class="container flex-column">
    <div class="flex-column">
        <h5>Open Contract</h5>
        <div class="text-subtitle3">
            Start a new contract or Open and existing contract from the blockchain
        </div>
    </div>
    <Button 
        id={'newTab-btn'} 
        classes={'button__solid button__purple'}
        width={'410px'}
        margin={'4rem 0 0.6rem'}
        name="Start New Contract"
        click={newTabFile} 
        />
    <div class="contract-row flex-row">
        <Button 
            id={'contractTab-btn'} 
            classes={'button__solid'}
            name="Open Contract"
            margin={'0 10px 3px 0'}
            height={'42px'}
            width={'200px'}
            click={newTabContract} 
        />
        <InputBox
            id={'contract-input'}
            label={"Contract Name"}
            width={'200px'}
            bind:thisInput={contractField}
            bind:value={contractName}
            on:changed={refreshValidity}
            on:keyup={refreshValidityKeyup}
        />
    </div>
    <Button classes={'button__text text-caption'} 
            width={'125px'}
			height={'24px'}
			padding={0}
            name="Cancel" 
            click={closeModal} 
    />
</div>