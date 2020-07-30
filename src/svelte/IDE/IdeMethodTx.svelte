<script>
    import { getContext, onMount, createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();
    
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
    let formObj;

    let selectedWallet;

    let stampRatio = 1;
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

    const determineStamps = () => {
        if (!selectedWallet) return
        let maxStamps = stampRatio * 5;
        let bal = BalancesStore.getBalance($currentNetwork, selectedWallet.vk)
        if ((bal * stampRatio) < maxStamps) stampLimit = parseInt((bal * stampRatio) * .95 )
        else stampLimit = parseInt(maxStamps)
    }

    const handleSelectedWallet = (e) => {
        if (!e.detail.selected.value) return;
        selectedWallet = e.detail.selected.value;
        if ($currentNetwork.blockExplorer) determineStamps();
    }

    const handleSubmit = () => {
        if(formObj.checkValidity()){
            sendTx();
        }
    }

    const sendTx = () => {
        txData.sender = selectedWallet;
        txData.txInfo.stampLimit = stampLimit;
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
}

.details{
    padding: 5px 0 40px 50px;
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

.warning{
    color: orange
}

.warning-icon{
    margin-right: 8px;
    position: relative;
    top: -1px;
}
.disabled{
    background: var(--bg-color-grey);
}
</style>

<div class="confirm-tx flex-column">
    <div class="flex-column">
        <h5>{`Submit Transaction`}</h5>
        <DropDown  
            items={$coinsDropDown}
            id={'mycoins'} 
            label={'Select Account to Send From'}
            margin="0 0 1rem 0"
            required={true}
            on:selected={(e) => handleSelectedWallet(e)}
        />
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
                <InputBox
                    width="100%"
                    bind:value={stampLimit}
                    label={"Stamp Limit"}
                    inputType={"number"}
                    required={true}
                />
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