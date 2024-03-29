<script>
    import { getContext, onMount, setContext } from 'svelte';

    import policy from '../../../policy.json'
    
	//Stores
    import { currentNetwork, CoinStore, freshPolicy } from '../../js/stores/stores.js';

    //Components
	import { Components, Modals}  from '../Router.svelte'
    const { Button, DropDown, Kwargs, InputBox} = Components;

    //Context
    const { closeModal, getModalData } = getContext('app_functions');

    //Utils
    import { formatKwargs, formatAccountAddress} from '../../js/utils.js'

    import Lamden from "lamden-js";
    const { Encoder } = Lamden;

    //DOM Nodes
    let formObj;

    let buferSize = 0.05;

    let selectedPolicie, selectedMotion;
    let args = []
    let txData = {};
    let resultInfo = {};
    let kwargs  = []
    let policies = [{
        value: undefined,
        name: `Select Policie`,
        selected: true
    }]
    let motions = [{
        value: undefined,
        name: `Select Motion`,
        selected: true
    }]

    let currentStep = 0

    let txallInfo

    let steps = [
        {page: 'CoinSendingTx', back: -1, cancelButton: false},
        {page: 'ResultBox', back: -1, cancelButton: false}
    ]

    let modelData = getModalData();

    $: selectedWallet = CoinStore.getByVk(modelData.account)

    onMount(() => {
        getPolicies()
    })

    const handleSubmit = () => {
        if(formObj.checkValidity()){
            saveTxDetails()
        }
    }

    const getPolicies = () => {
        let list = [{
            value: undefined,
            name: `Select Policie`,
            selected: true
        }]

        for (const key of Object.keys(policy)) {
            list.push({
                name: key,
                value: key,
            })
        }
        policies = list
    }

    const getMotions = () => {
        let list = [{
            value: undefined,
            name: `Select Motion`,
            selected: true
        }]

        for (const key of Object.keys(policy[selectedPolicie])) {
            list.push({
                name: key,
                value: key,
            })
        }
        motions = list
    }

    const handleSelectedPolicy = (e) => {
        if (!e.detail.selected.value) return;
        selectedPolicie = e.detail.selected.value;
        getMotions();                                               
    }

    const handleSelectedMotion = (e) => {
        if (!e.detail.selected.value) return;
        selectedMotion = e.detail.selected.value;
        if (policy[selectedPolicie][selectedMotion] instanceof Array) {
            args = [...policy[selectedPolicie][selectedMotion].filter(x => x.show)];  
        } else {
            args = [policy[selectedPolicie][selectedMotion]];  
        }                                                
    }

    const handleNewArgValues = (e) => {
        kwargs = []
        if (!selectedPolicie || !selectedMotion) return []

        // regard "upgrade" as a normal policy
        if (selectedPolicie !== "upgrade") {
            if (policy[selectedPolicie][selectedMotion] instanceof Array) {
                const obj = [...policy[selectedPolicie][selectedMotion]]
                for (const k of e.detail.argumentList) {
                    for (var i=0; i< obj.length; i++) {
                        if (obj[i].name === k.name) {
                            obj[i].value = k.value
                        }
                    }
                }
                kwargs.push({
                    name: "value",
                    type: "Any",
                    value: obj.map(x => x.value && Encoder(x.type, x.value))
                })
            } else {
                kwargs = [...e.detail.argumentList]
            }
            
            kwargs.push({name: "policy", type: "str", value: selectedPolicie})
        } else {
            kwargs = [...e.detail.argumentList]
        }
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

        if (selectedPolicie === "upgrade") {
            txData.txInfo.contractName = "upgrade"
            txData.txInfo.methodName = "propose_upgrade"
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
        resultInfo.txHash = e.detail.txHash;
        resultInfo.buttons = [
            {name: 'Home', click: () => {
                closeModal();
                freshPolicy(selectedPolicie);
            }, class: 'button__solid button__primary'}
        ]
        nextPage();
    }

    setContext('tx_functions', {
        home: () => closeModal()
	});

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
            <InputBox label="Account" value={formatAccountAddress(selectedWallet.vk, 8, 8)} disabled={true} margin="0 0 1rem 0" />
            <DropDown  
                items={policies}
                id={'policies'} 
                label={'Select Policy'}
                margin="0 0 1rem 0"
                required={true}
                on:selected={(e) => handleSelectedPolicy(e)}
            />
            <DropDown  
                items={motions}
                id={'motions'} 
                label={'Select Motion'}
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
                            class:disabled={selectedWallet === undefined || selectedPolicie === undefined}
                            disabled={selectedWallet === undefined || selectedPolicie === undefined ? 'disabled' : ''}
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