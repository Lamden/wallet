<script>
    import { getContext, onMount, setContext } from 'svelte';
    import policy from '../../../policyvote.json'
    //Images
    import spinner from '../../img/menu_icons/icon_spinner.svg';

	//Stores
    import { currentNetwork, CoinStore, networkKey, freshPolicy } from '../../js/stores/stores.js';

    //Components
	import { Components, Modals}  from '../Router.svelte'

    import BN from "bignumber.js";

    //Utils
    import { formatKwargs, formatAccountAddress} from '../../js/utils.js'
    const { Button, InputBox, DropDown, Kwargs} = Components;

    import Lamden from "lamden-js";
    const { Encoder } = Lamden;

    //Context
    const { closeModal, getModalData } = getContext('app_functions');

    let modelData = getModalData();

    $: selectedWallet = CoinStore.getByVk(modelData.account)

    let selectedPolicie = modelData.data.policy, selectedMotion = "Vote";

    let txData = {};
    let resultInfo = {};

    let buferSize = 0.05;

    let checkApproving = false
    let needApprove = true
    let showAccountsDropdown = true

    let kwargs  = []
    let args = []
    let policies = [{
        value: modelData.data.policy,
        name: modelData.data.policy,
        selected: true
    }]

    let motions = [{
            value: "Vote",
            name: "Vote",
            selected: true
    }]

    let currentStep = 0

    let steps = [
        {page: 'MethodTx', back: -1, cancelButton: false},
        {page: 'CoinSendingTx', back: -1, cancelButton: false},
        {page: 'ResultBox', back: -1, cancelButton: false}
    ]

    setContext("tx_functions", {
        home: () => closeModal(),
        close: () => closeModal()
    });

    onMount(() => {
        checkApproving = true
        checkApproveAmount().then(res => {
            let amount;
            if (!res.value) {
                amount = new BN(0)
            } else if (res.value.__fixed__) {
                amount = new BN(res.value.__fixed__)
            } else {
                amount = new BN(res.value)
            }
            if (amount.isGreaterThan(50)) { 
                needApprove = false
            } else {
                needApprove = true
            }
            checkApproving = false
        })
        getVoteArgs()
    })

    const checkApproveAmount = async () => {
        return await $currentNetwork.getVariable('currency', 'balances', `${modelData.account}:elect_masternodes`)
    }

    const nextPage = () => {
        currentStep = currentStep + 1
    }

    const handleSubmit = () => {
        if (needApprove) {
            txData = {
                sender: selectedWallet,
                txInfo: {
                    senderVk: selectedWallet.vk.trim(),
                    contractName: "currency", 
                    methodName: "approve", 
                    kwargs: formatKwargs([{name: "to", type: "str", value: "elect_masternodes"}, {name: "amount", type: "float", value: 9999999}])
                }
            }
        } else {
            txData = {
                sender: selectedWallet,
                txInfo: {
                    senderVk: selectedWallet.vk.trim(),
                    contractName: "election_house", 
                    methodName: "vote", 
                    kwargs: formatKwargs(kwargs)
                }
            }
            // handle for upgrade policy
            if (selectedPolicie === "upgrade") {
                txData.txInfo.contractName = "upgrade"
            }
        }
        nextPage()
    }


    const goVote = () => {
        needApprove = false
        currentStep = 0
        // hide accounts dropdown
        showAccountsDropdown = false
    }

    const resultDetails = (e) => {
        resultInfo = {}
        resultInfo = e.detail.resultInfo;
        if (needApprove && resultInfo.statusCode === 0) {
            resultInfo.buttons = [
                {name: 'Vote', click: () => goVote(), class: 'button__solid button__primary'},
                {name: 'Close', click: () => closeModal(), class: 'button__solid'}
            ]
        } else {
            resultInfo.buttons = [
                {name: 'Home', click: () => {
                    closeModal();
                    freshPolicy(selectedPolicie);
                    console.log(`fresh ${selectedPolicie}`)
                }, class: 'button__solid button__primary'}
            ];
        }
        resultInfo.txHash = e.detail.txHash;
        nextPage();
    }

    const createTxDetails = () => {
        let txDetails = [
            { name: "Contract Name", value: txData.txInfo.contractName },
            { name: "Function", value: txData.txInfo.methodName },
        ];
        Object.keys(txData.txInfo.kwargs).map((arg) => {
        let argValue = txData.txInfo.kwargs[arg];
        txDetails.push({ name: `${arg}`, value: JSON.stringify(argValue) });
        return arg;
        });
        return txDetails;
    };

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
                    currentStep = 3
                }
            })
        } else {
            nextPage()
        }
    }

    const handleNewArgValues = (e) => {
        kwargs = []
        if (!selectedPolicie || !selectedMotion) return []
        if (selectedPolicie !== 'upgrade') {
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
        console.log(kwargs)
    }


    const getVoteArgs = () => {
        if (policy[selectedPolicie][selectedMotion] instanceof Array) {
            args = [...policy[selectedPolicie][selectedMotion].filter(x => x.show)];  
        } else {
            args = [policy[selectedPolicie][selectedMotion]];  
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

.spinner{
	width: 20px;
}
</style>

{#if currentStep === 0}
<div class="confirm-tx flex-column">
    <div class="flex-column">
        <h2>{`Vote`}</h2>
        {#if showAccountsDropdown}
            <InputBox label="Account" value={formatAccountAddress(modelData.account, 8, 8)} disabled={true} margin="0 0 1rem 0" />
        {/if}
        {#if !needApprove}
        <DropDown  
            items={policies}
            id={'policies'} 
            label={'Select Policy'}
            margin="0 0 1rem 0"
            required={true}
            disabled={true}
        />
        <DropDown  
            items={motions}
            id={'motions'} 
            label={'Select Motion'}
            margin="0 0 1rem 0"
            disabled={true}
            required={true}
        />
        <Kwargs argumentList={args} on:newArgValues={handleNewArgValues}/>
        {/if}
        <div class="buttons flex-column">
            <Button classes={'button__solid button__primary'} 
                    padding={0}
                    width={'240px'}
                    name={checkApproving ? "Checking" : needApprove ? "Approve" : "Confirm"} 
                    disabled={selectedWallet === undefined || checkApproving}
                    click={() => handleSubmit()} >
                    <div slot="icon-after">
                        {#if checkApproving}
                            <div class="spinner">{@html spinner}</div>
                        {/if}
                    </div>
            </Button>
            <Button classes={'button__text text-caption'} 
                    width={'125px'}
                    height={'24px'}
                    padding={0}
                    margin={'17px 0'}
                    name="Cancel" 
                    click={() => closeModal()} />
        </div>
    </div>
</div>
{:else}
    <svelte:component
        this={Modals[steps[currentStep-1].page]}
        result={resultInfo}
        {txData}
        account={selectedWallet.vk}
        txDetails={createTxDetails()}
        on:saveTxDetails={saveTxDetails}
        on:txResult={(e) => resultDetails(e)}
    />
{/if}