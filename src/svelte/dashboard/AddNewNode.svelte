<script>
    import { getContext } from 'svelte';
    
	//Stores
    import { coinsDropDown, currentNetwork } from '../../js/stores/stores.js';

    //Components
	import { Components }  from '../Router.svelte'
    const { Button, DropDown } = Components;

    //Context
    const { closeModal } = getContext('app_functions');

    const handleSelectedWallet = (e) => {
        if (!e.detail.selected.value) return;
        selectedWallet = e.detail.selected.value;
    }

    //DOM Nodes
    let formObj;

    let selectedWallet;

    const handleSubmit = () => {
        if(formObj.checkValidity()){
            chrome.runtime.sendMessage({type: 'addUnregisterNode', data: selectedWallet.vk})
            closeModal()
        }
    }

</script>

<style>
.confirm-tx{
    width: 500px;
    background: inherit;
}

.buttons{
    flex-grow: 1;
    display: flex;
    padding-top: 27px;
    justify-content: center;
    align-items: center;
}
.disabled{
    background: var(--bg-secondary);
}
</style>

<div class="confirm-tx flex-column">
    <div class="flex-column">
        <h2>{`Submit Unregister Node`}</h2>
        <DropDown  
            items={$coinsDropDown}
            id={'mycoins'} 
            label={'Select Account Linked With Node'}
            margin="0 0 1rem 0"
            required={true}
            on:selected={(e) => handleSelectedWallet(e)}
        />
        <form on:submit|preventDefault={() => handleSubmit() } bind:this={formObj} target="_self">
            <div class="buttons flex-column">
                <input  id="confirmTx-btn"
                        value="Confirm"
                        class="button__solid button__primary submit submit-button submit-button-text"
                        class:disabled={selectedWallet === undefined}
                        disabled={selectedWallet === undefined ? 'disabled' : ''}
                        type="submit" >
                <Button classes={'button__text text-caption'} 
                        width={'125px'}
                        height={'24px'}
                        padding={0}
                        margin={'17px 0'}
                        name="Cancel" 
                        click={() => closeModal()} />
            </div>
        </form>
    </div>
</div>