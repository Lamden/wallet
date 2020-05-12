<script>
    import { getContext, onMount, onDestroy } from 'svelte';
    
    //Stores
    import { steps, currentNetwork } from '../../js/stores/stores.js';

	//Components
	import { Components }  from '../Router.svelte'
    const { Button, InputBox, Loading } = Components;

    //Images
    import circleCheck from '../../img/menu_icons/icon_circle-check.svg'
    import checkmarkWhite from '../../img/menu_icons/icon_checkmark-white.svg'
    import iconErrorCircle from '../../img/menu_icons/icon_error-circle.svg'

    //Context
    const { changeStep, getEthAddress, getTokenBalance, getChainInfo, setMetamaskTxResponse } = getContext('functions');
    const { switchPage } = getContext('app_functions');

    //DOM Nodes
    let inputNode

    $: metamaskTxResponse = null;
    $: sending = false;
    $: sent = metamaskTxResponse && !sending
    $: errorMsg = ''

    const nextPage = () => {
        setMetamaskTxResponse(metamaskTxResponse)
        changeStep(3)
    }

    onMount(() => {
        steps.update(stepsStore => {
            stepsStore.currentStep = 3;
            return stepsStore
        })
    })

    onDestroy(() =>{
        chrome.runtime.onMessage.removeListener(tokenApprovalSent)
    })

    const sendTokenApproval = () => {
        if (!sent){
            chrome.runtime.sendMessage({type: 'sendTokenApproval', data: { address: getEthAddress(), amount: inputNode.value }}, () => {
                sending = true
                errorMsg = ''
            })
        }
    }

    const tokenApprovalSent = (message, sender, sendResponse) => {
		if (message.type === 'tokenApprovalSent') {
            sending = false
            if (typeof message.data.error === 'undefined') {
                metamaskTxResponse = message.data
            } else {
                errorMsg = message.data.error
            }
        }
    }
    chrome.runtime.onMessage.addListener(tokenApprovalSent)

</script>

<style>
.result{
    align-items: center;
}
.circle-checkmark{
    width: 190px;
}
.circle-error{
    width: 100px;
    margin-bottom: 1rem;
}
</style>

<div class="flex-row swaps-intro">
    <div class="flex-column content-left">
        <h6>Send Token Approval</h6>
    
        <div class="text-box text-body1 text-primary">
            {`Lamden required access to your tokens to complete the swap process.`}
        </div>

        <div>
            {`Current ${getChainInfo().tauSymbol} Balance: ${getTokenBalance()}`}
        </div>

        <InputBox 
            bind:thisInput={inputNode}
            label={`Approve ${getChainInfo().tauSymbol}`}
            inputType={'number'}
            value={`${getTokenBalance()}`}
            placeholder={`${getChainInfo().tauSymbol} Amount`}
            margin={'1rem 0'}
        />

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
                href="https://www.lamden.io" 
                target="_blank" 
                rel="noopener noreferrer" >
                Help & FAQ
            </a>
         </div>
    </div>
    <div class="flex-column content-right">
        {#if sending}
            <Loading message="Waiting for response from MetaMask..."
                     subMessage="Check your MetaMask to confirm the transaction"
            />
        {/if}
        {#if sent}
            <div class="flex-column result">
                <div class="circle-checkmark">{@html circleCheck}</div>
                <h2>{'Approved!'}</h2>
            </div>
        {/if}
        {#if errorMsg !== ''}
            <div class="flex-column result">
                <div class="circle-error">{@html iconErrorCircle}</div>
                <p class="text-red text_body2">{errorMsg}</p>
            </div>
        {/if}
    </div>
</div>






