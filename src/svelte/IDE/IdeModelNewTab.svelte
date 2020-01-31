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

    function newTab(){
        FilesStore.addDefaultFile();
        closeModal();
    }

    function checkContractName(){
        if (contractName === "") {
            contractField.setCustomValidity('Cannot be Empty');
            contractField.reportValidity();
            return
        }

        fetch(`${$currentNetwork.ip}:${$currentNetwork.port}/contracts/${contractName}`)
        .then(res => res.json())
        .then(res => {
            if (!res.code){
                contractField.setCustomValidity('Contract Does Not Exist');
                contractField.reportValidity();
                return
            }
            getMethods(res.name, res.code);
        })
        .catch(err => {
            console.log(err)
            contractField.setCustomValidity(`Error getting contract: ${err}`);
            contractField.reportValidity();
        })
    }

    function getMethods(contractName, contractCode){
        fetch(`${$currentNetwork.ip}:${$currentNetwork.port}/contracts/${contractName}/methods`)
            .then(res => res.json())
            .then(res => {
                FilesStore.addFile(contractName, contractCode, res.methods, currentNetwork);
                closeModal();
            })
            .catch(err => {
                console.log(err)
                contractField.setCustomValidity(`Error getting contract: ${err}`);
                contractField.reportValidity();
            })
    }

    function refreshValidity(e){
        contractField.setCustomValidity('');
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
        click={() => newTab()} 
        />
    <div class="contract-row flex-row">
        <Button 
            id={'contractTab-btn'} 
            classes={'button__solid'}
            name="Open Contract"
            margin={'0 10px 3px 0'}
            height={'42px'}
            width={'200px'}
            click={() => checkContractName()} 
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
            click={() => closeModal()} 
    />
</div>