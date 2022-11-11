<script>
    import { getContext } from 'svelte';
    
	//Stores
    import { coinsDropDown, currentNetwork } from '../../js/stores/stores.js';

    //Components
	import { Components, Modals}  from '../Router.svelte'
    //Utils
    import { formatKwargs } from '../../js/utils.js'
    const { Button, DropDown } = Components;

    //Context
    const { closeModal, getModalData } = getContext('app_functions');

    const handleSelectedWallet = (e) => {
        if (!e.detail.selected.value) return;
        selectedWallet = e.detail.selected.value;
    }

    let modelData = getModalData();

    //DOM Nodes
    let formObj;

    let txData = {};
    let resultInfo = {};

    let selectedWallet;

    let agree = true

    let currentStep = 0

    let steps = [
        {page: 'CoinSendingTx', back: -1, cancelButton: false},
        {page: 'ResultBox', back: -1, cancelButton: false}
    ]

    const handleSubmit = () => {
        console.log(modelData)
        if(formObj.checkValidity()){
            saveTxDetails()
        }
    }

    const resultDetails = (e) => {
        txallInfo = e.detail
        resultInfo = e.detail.resultInfo;
        resultInfo.buttons = buttons;
        resultInfo.txHash = e.detail.txHash;
        nextPage();
    }

    const makeTx = (data) => {
        return {
            "payload": {
                "contract": data.contractName,
                "function": data.methodName,
                "kwargs": data.kwargs,
                "sender": data.senderVk,
            }
        }
    }

    const saveTxDetails = () => {
        txData = {
            sender: selectedWallet,
            txInfo: {
                senderVk: selectedWallet.vk.trim(),
                contractName: "election_house", 
                methodName: "vote", 
                kwargs: formatKwargs([{name: "policy", type: "str", value: modelData.data.policy}, {name: "value", type: "Any", value: [modelData.data.value, agree]}])
            }
        }
        if ($currentNetwork.blockservice.host) {
            fetch(`${$currentNetwork.blockservice.host}/stamps/estimation`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(makeTx(txData.txInfo)),
            }).then(r => r.json()).then(d => {
                if (d.status === 0) {
                    txData.txInfo.stampLimit = Math.ceil(d['stamps_used'] * (1 + buferSize))
                    nextPage()
                } else {
                    let group = d.result.match(/Error\(['"].*['"],\)/)
                    if (group.length > 0) {
                        resultInfo.errorInfo = []
                        resultInfo.errorInfo[0] = group[0].slice(7, -3)
                    }
                    resultInfo.buttons = [
                        {name: 'Home', click: () => closeModal(), class: 'button__solid button__primary'}
                    ]
                    resultInfo.title = `Transaction Failed`
                    resultInfo.subtitle = `Your transaction will fail, please edit and then resend the transaction`
                    resultInfo.type = 'error'
                    currentStep = 2
                }
            })
        } else {
            stampLimit = 120
            nextPage()
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
.vote-box{
    justify-content: space-evenly;
}
</style>

{#if currentStep === 0}
<div class="confirm-tx flex-column">
    <div class="flex-column">
        <h2>{`Vote`}</h2>
        <DropDown  
            items={$coinsDropDown}
            id={'mycoins'} 
            label={'Select Account Linked With Node'}
            margin="0 0 1rem 0"
            required={true}
            on:selected={(e) => handleSelectedWallet(e)}
        />
        <div class="flex padding text-body2 vote-box">
            <label>
                <input id="trusted" type="radio" bind:group={agree} value={true}>
                <strong>Yay</strong>
            </label>
            <label >
                <input id="not-trusted" type="radio" bind:group={agree} value={false}>
                <strong>Nay</strong>
            </label>
        </div>
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
{:else}
    <svelte:component
        this={Modals[steps[currentStep-1].page]}
        result={resultInfo}
        {txData}
        on:txResult={(e) => resultDetails(e)}
    />
{/if}