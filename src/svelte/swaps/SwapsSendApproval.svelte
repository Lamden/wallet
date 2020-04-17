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

    //Context
    const { changeStep, getEthAddress, getTokenBalance, getChainInfo, setMetamaskTxResponse } = getContext('functions');
    const { switchPage } = getContext('app_functions');

    //DOM Nodes
    let inputNode

    $: metamaskTxResponse = null;
    $: sending = false;
    $: sent = metamaskTxResponse && !sending

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
            chrome.runtime.sendMessage({type: 'sendTokenApproval', data: { address: getEthAddress(), amount: inputNode.value }}, () => sending = true)
        }
    }

    const tokenApprovalSent = (message, sender, sendResponse) => {
		if (message.type === 'tokenApprovalSent') {
            metamaskTxResponse = message.data
            sending = false
        }
    }
    chrome.runtime.onMessage.addListener(tokenApprovalSent)

</script>

<style>
.sent-message{
    align-items: center;
}
.circle-checkmark{
    width: 16vw;
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
            <Button id={'send-approval-btn'}
                    classes={`button__solid ${sent ? 'button__green' : 'button__purple'}`}
                    styles={'margin-bottom: 16px;'}
                    width={'100%'}
                    name={sent ? "Approved" : sending ? "Sending" : "Send Approval"}
                    icon={sent ? checkmarkWhite : ''}
                    iconPosition={'after'}
                    iconWidth={'19px'}
                    disabled={sending}
                    click={sendTokenApproval} />
            <Button id={'continue-btn'}
                    classes={'button__solid button__purple'}
                    styles={'margin-bottom: 16px;'}
                    width={'100%'}
                    name="Continue" 
                    disabled={!sent}
                    click={nextPage} />
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
                     subMessage="check your metamask to confirm"
            />
        {/if}
        {#if sent}
            <div class="flex-column sent-message">
                <div class="circle-checkmark">{@html circleCheck}</div>
                <h2>{'Approved!'}</h2>
            </div>
        {/if}
    </div>
</div>






