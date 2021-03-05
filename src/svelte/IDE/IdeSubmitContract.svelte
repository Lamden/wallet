<script>
    import { getContext, onMount, createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    import { Encoder } from 'lamden-js'
    
	//Stores
    import { BalancesStore, coinsDropDown, currentNetwork } from '../../js/stores/stores.js';

    //Components
	import { Components }  from '../Router.svelte'
    const { Button, DropDown, InputBox } = Components;

    //Context
    const { nextPage, close } = getContext('tx_functions');

    //Props
    export let currentPage;
    export let txData;
    export let txDetails;

    //DOM Nodes
    let formObj, contractNameField, constructorArgsField;

    let selectedWallet;
    let contractName;
    let methodName;
    let stampRatio = 1;
    let kwargs = {}
    let owner = "";
    let constructorArgs = "";
    let constructor_args_obj = {};

    $: stampLimit = 0;

    onMount(() => {
        if ($currentNetwork.blockExplorer){
            fetch(`${$currentNetwork.blockExplorer}/api/lamden/stamps`)
                .then(res => res.json())
                .then(res => {
                    stampRatio = parseInt(res.value)
                    determineStamps()
                })
        }
    })

    const handleSelectedWallet = (e) => {
        if (!e.detail.selected.value) return;
        selectedWallet = e.detail.selected.value;
        if ($currentNetwork.blockExplorer) determineStamps();
    }


    const determineStamps = () => {
        if (!selectedWallet) return
        let maxStamps = stampRatio * 50;
        let bal = BalancesStore.getBalance($currentNetwork, selectedWallet.vk)
        if ((bal * stampRatio) < maxStamps) stampLimit = parseInt((bal * stampRatio) * .95 )
        else stampLimit = parseInt(maxStamps)
    }

    const handleSubmit = async () => {
        constructorArgsField.setCustomValidity('')
        if (contractNameField.value !== ""){
            if (contractNameField.value.substring(0,4) !== 'con_'){
                setValidation(contractNameField, 'Contract Name must start with "con_"')
                return
            }
            let exists = await $currentNetwork.API.contractExists(contractNameField.value)
            if (exists){
                setValidation(contractNameField, 'Contract name already exists on Network.  Please choose another name.')
                return
            }
            if(formObj.checkValidity()){
                sendTx();
            }else{
                formObj.reportValidity()
            }
        }else{
            setValidation(contractNameField, 'Please fill out this field')
        }
    }

    const checkJSON = (e) => {
        try{
            constructor_args_obj = Encoder("dict", constructorArgs)
            constructorArgsField.setCustomValidity('')
        }catch (e) {+
            constructorArgsField.setCustomValidity('Not a valid JSON string.')
        }
    }

    const sendTx = () => {
        txData.sender = selectedWallet;
        txData.txInfo.senderVk = txData.sender.vk;
        txData.txInfo.stampLimit = stampLimit;
        txData.txInfo.kwargs.name = Encoder("str", contractNameField.value);
        if (owner !== "") txData.txInfo.kwargs.owner = Encoder("Any", owner);
        if (constructorArgs !== "") txData.txInfo.kwargs.constructor_args = constructor_args_obj;
        dispatch('saveTxDetails', txData);
    }

    const setValidation = (node, message) => {
        node.setCustomValidity(message)
        node.reportValidity()
    }

    const clearValidation = (e) => {
        if (e.detail.keyCode === 13) return;
        e.detail.target.setCustomValidity('')
        e.detail.target.reportValidity()
    }
</script>

<style>
.coin-info{
    text-align: right;
}
.confirm-tx{
    width: 600px;
    background: inherit;
}

.details{
    padding: 5px 0 0px 50px;
    border-left: 1px solid var(--font-secondary)
}

.values{
    color: var(--font-secondary);
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
    background: var(--bg-secondary);
}
p{
    margin: 0.5rem 0 1rem 0;
}
</style>

<div class="confirm-tx flex-column">
    <div class="flex-column">
        <h2>{`Submit Contract to ${$currentNetwork.name}`}</h2>
        <div>* signifies manditory field</div>
        <DropDown  
            items={$coinsDropDown}
            margin={'1rem 0 7px'}
            id={'mycoins'} 
            label={'* Send Transaction From Account'}
            required={true}
            on:selected={(e) => handleSelectedWallet(e)}
        />
        {#if selectedWallet}
            <p class="coin-info text-subtitle2">
                {`
                    ${BalancesStore.getBalance($currentNetwork, selectedWallet.vk).toLocaleString('en') || '0'}
                    ${$currentNetwork.currencySymbol}
                `}
            </p>
         {/if}
        <form on:submit|preventDefault={handleSubmit} bind:this={formObj} target="_self">
            <div class="details flex-column">
                {#each txDetails as detail}
                    {#if detail.name === 'name'}
                        <h4 class="detail-name no-bottom-margin">* Your Contract Name</h4>
                        <InputBox
                            width="100%"
                            margin="0.5rem 0 0"
                            value={detail.value}
                            bind:thisInput={contractNameField}
                            on:keyup={clearValidation}
                            inputType={"text"}
                            required={true}
                        />
                    {:else}
                        <h4 class="detail-name no-bottom-margin">{detail.name}{detail.type ? ` (${detail.type})` : ''}</h4>
                        <div class="values text-body1">
                            {detail.value}
                        </div>
                    {/if}
                {/each}
                <h4 class="detail-name no-bottom-margin">* Stamp Limit</h4>
                <InputBox
                    width="100%"
                    margin="0.5rem 0 0"
                    bind:value={stampLimit}
                    inputType={"number"}
                    required={true}
                />
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
                    bind:thisInput={constructorArgsField}
                    bind:value={constructorArgs}
                    on:changed={checkJSON}
                    styles={'height: unset; max-width: 100%; min-width: 100%;'}
                    rows="2"
                    label={"Constructor Args (Optional)"}
                    inputType={"textarea"}
                />
            </div>
            <div class="buttons flex-column">
                <input  id="confirmTx-btn"
                        value="Submit Contract"
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
                        click={() => close()} />
            </div>
        </form>
    </div>
</div>