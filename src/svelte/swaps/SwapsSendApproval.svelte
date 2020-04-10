<script>
    import { getContext, onDestroy } from 'svelte';
    
    //Stores
    import { steps, currentNetwork } from '../../js/stores/stores.js';

	//Components
	import { Components }  from '../Router.svelte'
    const { Button, InputBox, Loading } = Components;

    //Images
    import flag from '../../img/menu_icons/icon_flag.svg'

    //Context
    const { changeStep, getAddress, getTokenBalance, getChainInfo } = getContext('functions');
    const { switchPage } = getContext('app_functions');

    //DOM Nodes
    let inputNode

    $: metamaskTxResponse = null;
    $: sending = false;
    $: sent = metamaskTxResponse && !sending

    const nextPage = () => {
        setMetamaskTxResponse(setMetamaskTxResponse)
        changeStep(2)
    }

    onDestroy(() =>{
        chrome.runtime.onMessage.removeListener(tokenApprovalSent)
    })

    const sendTokenApproval = () => {
        console.log(inputNode)
        console.log(inputNode.value)
        chrome.runtime.sendMessage({type: 'sendTokenApproval', data: { address: getAddress(), amount: inputNode.value }}, () => sending = true)
    }

    const tokenApprovalSent = (message, sender, sendResponse) => {
		if (message.type === 'tokenApprovalSent') {
            console.log(message.data)
            metamaskTxResponse = message.data
            sending = false
        }
    }
    chrome.runtime.onMessage.addListener(tokenApprovalSent)

</script>

<style>
.swaps-intro{
    flex-grow:1;
    padding-top: 10%;
}
.content-left{
    box-sizing: border-box;
    padding: 0px 24px 0 60px;
    width: 300px;
    justify-content: flex-start;
}
.content-right{
    align-items: center;
    justify-content: center;
    flex-grow: 1;
}
.text-box{
    margin: 1rem 0;
    
}
.buttons{
    flex-grow: 1;
    justify-content: flex-end;
}
.sent-message{
    align-items: center;
}
.flag{
    width: 20vw;
}

@media (min-width: 900px) {
    .content-left{
        padding: 0px 24px 0 242px;
        width: 498px;
    }
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
            <Button id={'continue-btn'}
                    classes={'button__solid button__purple'}
                    styles={'margin-bottom: 16px;'}
                    width={'100%'}
                    name="Send Approval" 
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
                    name="Back" 
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
            <Loading message="Waiting for reponse from MetaMask..."/>
        {/if}
        {#if sent}
            <div class="flex-column sent-message">
                <div class="flag">{@html flag}</div>
                <h2>{'Tokan Approval Sent!'}</h2>
            </div>
        {/if}
    </div>
</div>






