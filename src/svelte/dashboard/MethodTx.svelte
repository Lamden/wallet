<script>
    import { getContext, onMount, createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();
    import lamden from 'lamden-js';
    const { Encoder } = lamden;
    
    // utils
    import { formatAccountAddress } from "../../js/utils.js";

	//Stores
    import { BalancesStore, CoinStore, currentNetwork } from '../../js/stores/stores.js';

    //Components
	import { Components }  from '../Router.svelte'
    import InputBox from '../components/InputBox.svelte';
    const { Button, DropDown } = Components;

    //Context
    const { nextPage, close } = getContext('tx_functions');

    //Props
    export let txData;
    export let txDetails;
    export let account;

    //DOM Nodes
    let formObj;
    let stampLimit = undefined

    $: selectedWallet = CoinStore.getByVk(account)
    $: blockServiceExist = !!$currentNetwork.blockservice.host


    const handleSubmit = () => {
        if(formObj.checkValidity()){
            sendTx();
        }
    }

    const sendTx = () => {
        txData.sender = selectedWallet;
        if (!txData.txInfo.stampLimit) {
            txData.txInfo.stampLimit = stampLimit;
        }
        txData.txInfo.senderVk = txData.sender.vk
        dispatch('saveTxDetails', txData);
    }
</script>

<style>
.coin-info{
    text-align: right;
}
.confirm-tx{
    width: 500px;
    background: inherit;
}

.details{
    padding: 5px 0 40px 50px;
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
</style>

<div class="confirm-tx flex-column">
    <div class="flex-column">
        <h2>{`Submit Transaction`}</h2>
        <InputBox label="Account" value={formatAccountAddress(selectedWallet.vk, 8, 8)} disabled={true} margin="0 0 1rem 0" />
        {#if selectedWallet}
            <div class="coin-info text-subtitle2">
                {`
                    ${BalancesStore.getBalance($currentNetwork, selectedWallet.vk).toLocaleString('en') || '0'}
                    ${$currentNetwork.currencySymbol}
                `}
            </div>
        {/if}
        <form on:submit|preventDefault={() => handleSubmit() } bind:this={formObj} target="_self">
            <div class="details flex-column">
                {#if !blockServiceExist}
                    <InputBox
                        width="100%"
                        bind:value={stampLimit}
                        label={"Stamp Limit"}
                        inputType={"number"}
                        required={true}
                    />
                {/if}
                {#each txDetails as detail}
                    <h4 class="detail-name no-bottom-margin">{detail.name}</h4>
                    <div class="values text-body1">
                        {detail.value}
                    </div>
                {/each}
            </div>
            <div class="buttons flex-column">
                <input  id="confirmTx-btn"
                        value="Confirm Transaction"
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