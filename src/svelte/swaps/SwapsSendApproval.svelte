<script>
    import { getContext, onMount, onDestroy } from 'svelte';
    import { fade } from 'svelte/transition';
    
    //Stores
    import { steps, currentNetwork } from '../../js/stores/stores.js';

	//Components
	import { Components }  from '../Router.svelte'
    const { Button, InputBox, Loading } = Components;

    //Images
    import circleCheck from '../../img/menu_icons/icon_circle-check.svg'
    import checkmarkWhite from '../../img/menu_icons/icon_checkmark-white.svg'
    import iconErrorCircle from '../../img/menu_icons/icon_error-circle.svg'

	//Utils
	import { displayBalance } from '../../js/utils.js';


    //Context
    const { changeStep, getEthAddress, getTokenBalance, getChainInfo, setMetamaskApprovalResponse } = getContext('functions');
    const { switchPage } = getContext('app_functions');

    //DOM Nodes
    let inputNode

    let amount = 0;

    $: metamaskTxResponse = null;
    $: sending = false;
    $: sent = metamaskTxResponse && !sending
    $: errorMsg = ''


    const nextPage = () => {
        setMetamaskApprovalResponse(metamaskTxResponse)
        changeStep(6)
    }

    onMount(() => {
        steps.update(stepsStore => {
            stepsStore.currentStep = 4;
            return stepsStore
        })
        inputNode.value = getTokenBalance().toFixed(8)
        amount = getTokenBalance().toFixed(8)
    })

    const sendTokenApproval = () => {
        if (!sent){
            sending = true
            errorMsg = ''
            chrome.runtime.sendMessage({type: 'sendTokenApproval', data: { address: getEthAddress(), amount: inputNode.value}}, (response) => {
                sending = false
                if (typeof response.error === 'undefined') {
                    metamaskTxResponse = response
                } else {
                    errorMsg = response.error
                }
            })
        }
    }

    const handleChanged = () => {
        if (isNaN(inputNode.value)) {
            inputNode.value = "0"
            return
        } 
        if (!inputNode.value.includes(".")) return
        let intPart = inputNode.value.split(".")[0]
        let decimalPart = inputNode.value.split(".")[1]
        if (!decimalPart && !intPart) {
            inputNode.value = "0"
            return
        }
        if (!decimalPart) {
            inputNode.value = intPart
            return
        }
        if (parseInt(decimalPart) === 0) {
            inputNode.value = intPart
            return
        }
        if (decimalPart.length > 8) inputNode.value = intPart + "." + decimalPart.substring(0, 8)
        amount = inputNode.value
    }

</script>

<style>
h3{
    margin-top: 0;
}
.flow-content-right{
    justify-content: flex-start;
}
.result{
    align-items: center;
    position: absolute;
}
.circle-checkmark{
    width: 190px;
}
.circle-error{
    width: 100px;
    margin-bottom: 1rem;
}
p.text-body2{
    font-weight: 300;
    line-height: 1.3;
}
.swap-details{
    text-align: left;
    width: 100%;
}
.swap-details.grey{
    color: var(--font-primary-darker)
}
.swap-details > p{
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin: 1rem 0 0rem;
    font-size: 1.2em;
    font-weight: 400;
}
.swap-details > p > strong{
    font-weight: 500;
}
.text-body2 > strong{
    color: var(--font-accent);
}
.text-warning{
    margin: 2rem 0 -0.5rem;
    text-align: center;
}
</style>

<div id="swap_approval" class="flex-row flow-page" in:fade="{{delay: 0, duration: 200}}">
    <div class="flex-column flow-content-left">
        <h6>Send Token Approval</h6>
    
        <p class="flow-text-box text-body1">
            {`Lamden requires access to your tokens to complete the swap process.`}
        </p>

        <p class="text-body2">
            <strong>Ethereum {$currentNetwork.currencySymbol} Balance:</strong><br>
            {`${getTokenBalance().toFixed(8)} ${getChainInfo().tauSymbol}`}
        </p>

        {#if !sent}
            <InputBox 
                bind:thisInput={inputNode}
                on:changed={handleChanged}
                label={`Approve Amount`}
                inputType={'number'}
                bind:value={amount}
                placeholder={`${getChainInfo().tauSymbol} Amount`}
                disabled={sending}
            />
        {/if}

        <div class="flex-column buttons">
            {#if sent}
                <Button id={'continue-btn'}
                        classes={'button__solid button__purple'}
                        styles={'margin-bottom: 16px;'}
                        width={'100%'}
                        name="Continue" 
                        click={nextPage} />
            {:else}
                <Button id={'send-approval-btn'}
                    classes={`button__solid button__purple`}
                    styles={'margin-bottom: 16px;'}
                    width={'100%'}
                    name={sent ? "Approved" : sending ? "Sending" : "Send Approval"}
                    disabled={sending}
                    click={sendTokenApproval} />
            {/if}


            <Button id={'back-btn'}
                    classes={'button__solid'} 
                    styles={'margin-bottom: 16px;'}
                    width={'100%'}
                    name="Cancel" 
                    click={() => switchPage('Swaps')} />  
       

            <a  class="text-caption text-secondary" 
                href="https://docs.lamden.io/wallet/" 
                target="_blank" 
                rel="noopener noreferrer" >
                Help & FAQ
            </a>
         </div>
    </div>
    <div class="flex-column flow-content-right">
        <div class="swap-details" class:grey={sending || sent || errorMsg !== ''}>
            <h3>Transaction Details</h3>
            <p><strong>Contract:</strong><br>
                {`Ethereum ${getChainInfo().chainName}:`}
                {#if sending || sent || errorMsg !== ''} {getChainInfo().tauContract}
                {:else}
                    <a href={getChainInfo().blockExplorer + '/address/' + getChainInfo().tauContract} class:grey={sending} rel="noopener noreferrer" target="_blank">
                        {getChainInfo().tauContract}
                    </a>
                {/if}
            </p> 
            <p><strong>Function:</strong><br>
                approve
            </p> 
            <p><strong>Amount:</strong><br>
                {displayBalance(amount)}
            </p> 
        </div>
        {#if sending}
            <div style="position: absolute;">
                <Loading message="Waiting for transaction to complete..."
                     subMessage="check your MetaMask to confirm the transaction"
                     mainStyle="justify-content: flex-start;"
                />
                <p class="text-warning text-body1">DO NOT CLOSE THE WALLET</p>
                <p class="text-body2">Depending on the congestion of the Ethereum network, and gas used, this could take a while.</p>
            </div>
        {/if}
        {#if sent}
            <div class="flex-column result" >
                <div class="circle-checkmark" in:fade="{{delay: 0, duration: 500}}">{@html circleCheck}</div>
                <h3>{'Approved!'}</h3>
            </div>
        {/if}
        {#if errorMsg !== ''}
            <div class="flex-column result">
                <div class="circle-error" in:fade="{{delay: 0, duration: 500}}">{@html iconErrorCircle}</div>
                <p class="text-red text_body2">{errorMsg}</p>
            </div>
        {/if}
    </div>
</div>






