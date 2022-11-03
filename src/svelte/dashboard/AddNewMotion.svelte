<script>
    import { getContext, onMount } from 'svelte';
    
	//Stores
    import { coinsDropDown, currentNetwork } from '../../js/stores/stores.js';

    //Components
	import { Components, Modals}  from '../Router.svelte'
    const { Button, DropDown, Kwargs} = Components;

    //Context
    const { closeModal } = getContext('app_functions');

    //Utils
    import { formatKwargs } from '../../js/utils.js'

    //DOM Nodes
    let formObj;

    let buferSize = 0.05;

    let selectedWallet, selectedPolicie;
    let args = []
    let txData = {};
    let resultInfo = {};
    let kwargs  = []
    let policies = [{
        value: undefined,
        name: `Select Policie`,
        selected: true
    }]

    let currentStep = 0

    let steps = [
        {page: 'CoinSendingTx', back: -1, cancelButton: false},
        {page: 'ResultBox', back: -1, cancelButton: false}
    ]

    onMount(() => {
        getPolicies("election_house")
    })

    const handleSubmit = () => {
        if(formObj.checkValidity()){
            saveTxDetails()
        }
    }

    const getPolicies = async (contract) => {
        let list = [{
            value: undefined,
            name: `Select Policie`,
            selected: true
        }]

        let data = await fetch(`${$currentNetwork.blockservice.host}/contracts/${contract}`)
            .then(res => res.json())
            .then(data => data[contract].policies)
        for (const [key, value] of Object.entries(data)) {
            if (value) {
                list.push({
                    name: key,
                    value: key,
                })
            }
        }
        policies = list
    }

    const handleSelectedWallet = (e) => {
        if (!e.detail.selected.value) return;
        selectedWallet = e.detail.selected.value;
    }

    const handleSelectedMotion = (e) => {
        if (!e.detail.selected.value) return;
        selectedPolicie = e.detail.selected.value;
        getVoteArgType(selectedPolicie)
    }

    const getVoteArgType = async (contract) => {
        let methods = await $currentNetwork.API.getContractMethods(contract)
        let data = methods.find(x => x.name === 'vote').arguments
        let obj = data.find(t => t.name === 'obj')
        obj.name = "value"
        args = [obj]
    }

    const handleNewArgValues = (e) => {
        kwargs = e.detail.argumentList
        kwargs.push({name: "policy", type: "str", value: selectedPolicie})
        // {name: "policy", type: "str"}
    }

    const nextPage = () => {
        currentStep = currentStep + 1
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
                kwargs: formatKwargs(kwargs)
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

    const resultDetails = (e) => {
        txallInfo = e.detail
        resultInfo = e.detail.resultInfo;
        resultInfo.buttons = buttons;
        resultInfo.txHash = e.detail.txHash;
        nextPage();
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

{#if currentStep === 0}
    <div class="confirm-tx flex-column">
        <div class="flex-column">
            <h2>{`Create New Motion`}</h2>
            <DropDown  
                items={$coinsDropDown}
                id={'mycoins'} 
                label={'Select Account Linked With Node'}
                margin="0 0 1rem 0"
                required={true}
                on:selected={(e) => handleSelectedWallet(e)}
            />
            <DropDown  
                items={policies}
                id={'policies'} 
                label={'Select Policie'}
                margin="0 0 1rem 0"
                required={true}
                on:selected={(e) => handleSelectedMotion(e)}
            />
            <Kwargs argumentList={args} on:newArgValues={handleNewArgValues}/>
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