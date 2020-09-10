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

    //Context
    const { changeStep, getTokenBalance, getEthAddress, getLamdenAddress, getApprovalAmount, setMetamaskTxResponse } = getContext('functions');
    const { switchPage } = getContext('app_functions');

    const swapContractLink = {
        "TAU": {address: "0x5e20ddde9ec5386ea2f4d24b7f33d747169d6b07", url: "https://kovan.etherscan.io/address/0x5e20ddde9ec5386ea2f4d24b7f33d747169d6b07"},
        "dTAU": {address: "0x5e20ddde9ec5386ea2f4d24b7f33d747169d6b07", url: "https://kovan.etherscan.io/address/0x5e20ddde9ec5386ea2f4d24b7f33d747169d6b07"}
    }


    $: metamaskSwapTxResponse = null;
    $: sending = false;
    $: sent = metamaskSwapTxResponse && !sending
    $: errorMsg = ''

    const nextPage = () => {
        changeStep(7)
    }

    onMount(() => {
        steps.update(stepsStore => {
            stepsStore.currentStep = 3;
            return stepsStore
        })
    })

    const sendEthSwapTransaction = () => {
        if (!sent){
            sending = true
            errorMsg = ''
            chrome.runtime.sendMessage({type: 'sendEthSwapTransaction', data: { ethAddress: getEthAddress(), amount: getApprovalAmount(), lamdenAddress: getLamdenAddress() }}, (response) => {
                sending = false
                if (typeof response.error === 'undefined') {
                    metamaskSwapTxResponse = response
                    setMetamaskTxResponse(metamaskSwapTxResponse)
                } else {
                    errorMsg = response.error
                }
            })
        }
    }

</script>

<style>
h2{
    margin:0;
}
a{
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.result{
    align-items: center;
    margin-top: 2rem;
}
.circle-checkmark{
    width: 75px;
}
.circle-error{
    width: 75;
    margin-bottom: 1rem;
}
.swap-details > p{
    margin: 1rem 0 0rem;
    font-size: 1.2em;
    font-weight: 500;
}
.swap-details{
    text-align: left;
}
</style>

<div class="flex-row flow-page" in:fade="{{delay: 0, duration: 200}}">
    <div class="flex-column flow-content-left">
        <h6>Ethereum Token Swap Transaction</h6>
    
        <p class="flow-text-box text-body1">
            {`Send your ${$currentNetwork.currencySymbol} tokens to our `}
            <a class="text-body1" href="{swapContractLink[$currentNetwork.currencySymbol].url}" >Ethereum Token Swap Contract</a>
        </p>

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
                    name={sent ? "Approved" : sending ? "Sending" : "Send Transaction"}
                    disabled={sending}
                    click={sendEthSwapTransaction} />
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
    <div class="flex-column flow-content-right">
        <div class="swap-details">
            <h3>Swap Details</h3>
            <p>Amount:</p> {`${getApprovalAmount()} ${$currentNetwork.currencySymbol}`}
            <p>Lamden Address:</p> {getLamdenAddress()}
        </div>

        {#if sending}
            <Loading message="Waiting for response from MetaMask..."
                     subMessage="Check your MetaMask to confirm the transaction"
            />
        {/if}
        {#if sent}
            <div class="flex-row result" >
                <div class="circle-checkmark" in:fade="{{delay: 0, duration: 500}}">{@html circleCheck}</div>
                <h2 class="text-green">{'Success!'}</h2>
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






