<script>
    import { onMount, getContext } from 'svelte';

	//Stores
    import { currentNetwork } from '../../js/stores/stores.js';

    //Components
    import { Modals, Components } from '../Router.svelte';
    const { Button, InputBox } = Components;

	//Context
    const { setMessage, setPage, home } = getContext('coinDappOptions_functions');

    //DOM Nodes
    let form, stampPreApprovalInput

    //Props
    export let dappInfo;
    export let stampRatio;

    const buttons = [
        {id: 'back-btn', name: 'Back', click: () => home(), class: 'button__solid button__purple'}
    ]
    let message = {buttons}

    $: stampPreApproval = dappInfo[$currentNetwork.type].stampPreApproval || 0;
    $: ratio = 0;

    onMount(() => {
        stampRatio.then(res => ratio = res)
    })

    const handleSubmit = () => {
        if (form.checkValidity()){
            const data = {
                dappUrl: dappInfo.url,
                networkType: $currentNetwork.type,
                preApproveAmount: stampPreApprovalInput.value
            }
            chrome.runtime.sendMessage({type: 'setPreApproval', data}, (response) => {
                if (!response || chrome.runtime.lastError) {
                    message.text = 'Unable to set pre-approval amount'
                    message.type = 'error'
                    
                }else{
                    message.text = `Pre-Approval amount has been set to ${parseInt(data.preApproveAmount).toLocaleString()} stamps`
                    message.type = 'success'
                }
                setMessage(message)
                setPage(4)
            })
        }
    }

    const handleChanged = (e) => {
        stampPreApproval = stampPreApprovalInput.value
    }

</script>

<style>
form{
    justify-content: center;
    align-items: center;
    margin: 1rem 0;
}

.ratio{
    display: flex;
    justify-content: center;
    margin-top: 2rem;
}
</style>

<div id="coin-dapp-preapproval">
    <h1>Transaction Pre-Approval</h1>
    <h2>Why pre-approve transactions?</h2>
    <p class="text-body2">{`
            dApps interact with your wallet by sending transaction information to the wallet.
            Those transactions are signed with your secure private keys and sent to the blockchain.
            This process requires you to approve each transaction via a popup window.
            Some dApps, such as games, may send frequent transactions and as such request that they get preapproval to enhance the experience.
            Pre-approvals are set in a value of "Stamps" which can be converted to ${$currentNetwork.currencySymbol} and back by the network.`}</p>
    <a class="outside-link" href="www.lamden.io">learn more about pre-approvals</a>
    <h2>What are Stamps?</h2>
    <p class="text-body2">{`
            Transactions on the Lamden blockchain require a form of payment called "Stamps".  
            Stamps are automatically deducted as ${$currentNetwork.currencySymbol} from your wallet, at the time the transaction is processed,
            using a ratio set by the nodes that govern the blockchain.`}</p>
    <a class="outside-link" href="www.lamden.io">learn more about stamps</a>
    <div class="ratio text-body1">{`Current Stamp Ratio: 1 ${$currentNetwork.currencySymbol} = ${ratio.toLocaleString()} stamps`}</div>

    <form class="flex-column" on:submit|preventDefault={() => handleSubmit() } target="_self" bind:this={form}>
    <InputBox
        id="preapproval-input"
        value={stampPreApproval}
        bind:thisInput={stampPreApprovalInput}
        on:keyup={handleChanged}
        width="464px"
        margin={"0 0 1rem 0"}
        label={`Stamps (${parseFloat(stampPreApproval/ratio).toLocaleString()} ${$currentNetwork.currencySymbol})`}
        inputType= 'number'
        autofocus={true}
        required={true}
    />
    <input  id="preapproval-btn"
            value="Set Pre-Approval Amount"
            class="button__solid button__purple submit submit-button submit-button-text" 
            type="submit" >
    </form>
</div>