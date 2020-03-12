<script>
    import { getContext, onMount, createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();
    
	//Stores
    import { BalancesStore, coinsDropDown, currentNetwork } from '../../js/stores/stores.js';

    //Components
	import { Components }  from '../Router.svelte'
    const { Button, DropDown, InputBox } = Components;

    //Images
    import warning from '../../img/menu_icons/icon_warning.svg';

    //Context
    const { nextPage, close } = getContext('tx_functions');

    //Props
    export let currentPage;
    export let txData;
    export let txDetails;

    //DOM Nodes
    let formObj, contractNameField;

    let selectedWallet;
    let contractName;
    let methodName;
    let stampLimit = 1000000;
    let kwargs = {}
    let owner = "";
    let constructorArgs = "";

    const handleSelectedWallet = (e) => {
        if (!e.detail.selected.value) return;
        selectedWallet = e.detail.selected.value;
    }

    const handleSubmit = async () => {
        if (contractNameField.value !== ""){
            let exists = await $currentNetwork.API.contractExists(contractNameField.value)
            if (exists){
                setValidation(contractNameField, 'Contract name already exists on Network.  Please choose another name.')
                return
            }
            if(await formObj.checkValidity()){
                sendTx();
            }
        }else{
            setValidation(contractNameField, 'Please fill out this field')
        }
    }

    const sendTx = () => {
        txData.sender = selectedWallet;
        txData.txInfo.senderVk = txData.sender.vk;
        txData.txInfo.stampLimit = stampLimit;
        txData.txInfo.kwargs.name = contractNameField.value;
        if (owner !== "") txData.txInfo.kwargs.owner = owner;
        if (constructorArgs !== "") txData.txInfo.kwargs.constructor_args = constructorArgs;
        dispatch('saveTxDetails', txData);
    }

    const setValidation = (node, message) => {
        node.setCustomValidity(message)
        node.reportValidity();
    }

    const clearValidation = (e) => {
        if (e.detail.keyCode === 13) return;
        e.detail.target.setCustomValidity('')
        e.detail.target.reportValidity();
    }
</script>

<style>
.coin-info{
    display: flex;
    justify-content: flex-end;
}
.confirm-tx{
    width: 600px;
}

.details{
    padding: 5px 0 40px 76px;
    margin-left: 50px;
    border-left: 1px solid var(--font-primary-darker)
}

.values{
    color: var(--font-primary-dark);
    align-items: center;
    overflow-wrap: break-word;
    max-height: 100px;
    overflow-y: auto;
}

.buttons{
    flex-grow: 1;
    display: flex;
    padding-top: 27px;
    justify-content: center;
    align-items: center;
}
.disabled{
    background: var(--bg-color-grey);
}
</style>

<div class="confirm-tx flex-column">
    <div class="flex-column">
        <h5>{`Submit Contract to ${$currentNetwork.name}`}</h5>
        <div>* signifies manditory field</div>
        <DropDown  
            items={$coinsDropDown}
            innerHeight={'70px'}
            margin={'1rem 0 7px'}
            id={'mycoins'} 
            label={'* Send Transaction From'}
            required={true}
            on:selected={(e) => handleSelectedWallet(e)}
        />
        <div class="coin-info text-subtitle3">
            {#if selectedWallet}
                {`
                    ${selectedWallet.name} - 
                    ${BalancesStore.getBalance($currentNetwork.url, selectedWallet.vk).toLocaleString('en') || '0'}
                    ${$currentNetwork.currencySymbol}
                `}
            {/if}
        </div>
        <form on:submit|preventDefault={() => handleSubmit() } bind:this={formObj} target="_self">
            <div class="details flex-column">
                <InputBox
                    width="100%"
                    margin={'17px 0 0'}
                    bind:value={stampLimit}
                    label={"* Stamp Limit"}
                    inputType={"number"}
                    required={true}
                />
                {#each txDetails as detail}
                    {#if detail.name === 'name'}
                        <InputBox
                            width="100%"
                            margin={'1.33em 0 0 0'}
                            value={detail.value}
                            bind:thisInput={contractNameField}
                            label={"* Name"}
                            on:keyup={clearValidation}
                            inputType={"text"}
                            required={true}
                        />
                    {:else}
                        <h4 class="detail-name no-bottom-margin">{detail.name}{detail.type ? ` (${detail.type})` : ''}</h4>
                        <div class="values text-body1">
                            {detail.name.includes('fixedPoint') ? detail.value.toFixed(8).toString() : detail.value}
                        </div>
                    {/if}
                {/each}
                <InputBox
                    width="100%"
                    bind:value={owner}
                    label={"Owner (Optional)"}
                    margin={'17px 0'}
                    inputType={"text"}
                />
                <InputBox
                    width="100%"
                    margin={'0 0 17px'}
                    bind:value={constructorArgs}
                    label={"Constructor Args (Optional)"}
                    inputType={"text"}
                />
            </div>
            <div class="buttons flex-column">
                <input  id="confirmTx-btn"
                        value="Confirm Transaction"
                        class="button__solid button__purple submit submit-button submit-button-text"
                        class:disabled={selectedWallet === undefined}
                        disabled={selectedWallet === undefined ? 'disabled' : ''}
                        type="submit" >
                <Button classes={'button__text text-caption'} 
                        width={'125px'}
                        height={'24px'}
                        padding={0}
                        margin={'17px 0'}
                        name="Cancel" 
                        click={() => close()} />
            </div>
        </form>
    </div>
</div>