<script>
    import { getContext, setContext } from 'svelte';
    
    //Images
    import spinner from '../../img/menu_icons/icon_spinner.svg';

	//Stores
    import { coinsDropDown, currentNetwork, NodesStore, CoinStore, networkKey } from '../../js/stores/stores.js';

    //Components
	import { Components, Modals}  from '../Router.svelte'

    import BN from "bignumber.js";

    //Utils
    import { formatKwargs, formatAccountAddress} from '../../js/utils.js'
    const { Button, DropDown, InputBox} = Components;

    //Context
    const { closeModal, getModalData } = getContext('app_functions');

    let modelData = getModalData();

    $: netKey = networkKey($currentNetwork)
    $: nodes = $NodesStore.filter(n => n.netKey === netKey && $CoinStore.findIndex(c => c.vk === n.vk) > -1)
    $: memberNodes = nodes.filter(k => k.status === "node")
    $: memberNodesAccount = $coinsDropDown.filter(c => memberNodes.findIndex(x => c.value.vk === x.vk) > -1 || !c.value )
    $: selectedWallet = CoinStore.getByVk(modelData.account)

    let txData = {};
    let resultInfo = {};

    let buferSize = 0.05;

    let agree = true
    let checkApproving = false
    let needApprove = true
    let showAccountsDropdown = true

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

    const checkApproveAmount = async () => {
        return await $currentNetwork.getVariable('currency', 'balances', `${selectedWallet.vk}:elect_masternodes`)
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
                    kwargs: formatKwargs([{name: "to", type: "str", value: "elect_masternodes"}, {name: "amount", type: "float", value: 1000}])
                }
            }
        } else {
            txData = {
                sender: selectedWallet,
                txInfo: {
                    senderVk: selectedWallet.vk.trim(),
                    contractName: "election_house", 
                    methodName: "vote", 
                    kwargs: formatKwargs([{name: "policy", type: "str", value: modelData.data.policy}, {name: "value", type: "Any", value: [modelData.data.value, agree]}])
                }
            }
        }
        nextPage()
    }

    
    const handleSelectedWallet = (e) => {
        if (!e.detail.selected.value) return;
        selectedWallet = e.detail.selected.value;
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
    }

    const goVote = () => {
        needApprove = false
        currentStep = 0
        // hide accounts dropdown
        showAccountsDropdown = false
    }

    const resultDetails = (e) => {
        resultInfo = e.detail.resultInfo;
        if (needApprove && resultInfo.statusCode === 0) {
            resultInfo.buttons = [
                {name: 'Vote', click: () => goVote(), class: 'button__solid button__primary'},
                {name: 'Close', click: () => closeModal(), class: 'button__solid'}
            ]
        } else {
            resultInfo.buttons = [
                {name: 'Home', click: () => closeModal(), class: 'button__solid button__primary'}
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
.vote-box{
    justify-content: space-evenly;
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
            <InputBox label="Account" value={formatAccountAddress(selectedWallet.vk, 8, 8)} disabled={true} margin="0 0 1rem 0" />
        {/if}
        {#if !needApprove}
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