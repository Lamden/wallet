<script>
    import whitelabel from '../../../whitelabel.json'

    import { getContext, onDestroy } from 'svelte';
    import { fade } from 'svelte/transition';
    
    //Stores
    import { steps, currentNetwork } from '../../js/stores/stores.js';

	//Components
	import { Components }  from '../Router.svelte'
    const { Button, InputBox, Loading } = Components;

    //Images
    import circleCheck from '../../img/menu_icons/icon_circle-check.svg'
    import iconErrorCircle from '../../img/menu_icons/icon_error-circle.svg'

    //Context
    const { changeStep, getTokenBalance, getEthAddress, getLamdenAddress, getApprovalAmount, setMetamaskTxResponse, getChainInfo } = getContext('functions');
    const { switchPage } = getContext('app_functions');

    const swapContractLink = {
        "TAU": {address: "0x78FC2eB9Dd55eb175c6145860385f84F8cbEE639", url: "https://www.etherscan.io/address/0x78FC2eB9Dd55eb175c6145860385f84F8cbEE639"},
        "dTAU": {address: "0x5e20ddde9ec5386ea2f4d24b7f33d747169d6b07", url: "https://kovan.etherscan.io/address/0x5e20ddde9ec5386ea2f4d24b7f33d747169d6b07"}
    }


    $: metamaskSwapTxResponse = null;
    $: sending = false;
    $: sent = metamaskSwapTxResponse && !sending
    $: errorMsg = ''

    const nextPage = () => {
        changeStep(7)
    }

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
h3{
    margin-top: 0;
}
.flow-content-right{
    position: relative;
}
a{
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.result{
    align-items: center;
    position: absolute;
}
.circle-checkmark{
    width: 190px;
}
.circle-error{
    width: 40px;
}
.swap-details{
    text-align: left;
    width: 100%;
}
.swap-details.grey{
    color: var(--font-secondary)
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
.text-warning{
    margin: 2rem 0 -0.5rem;
    text-align: center;
}
</style>

<div id="swap_sendSwapTx" class="flex-row flow-page" in:fade="{{delay: 0, duration: 200}}">
    <div class="flex-column flow-content-left">
        <h6>Ethereum Token Swap Transaction</h6>
    
        <p class="flow-text-box text-body1">
            {`Send your ${$currentNetwork.currencySymbol} tokens to our `}
            <a class="text-link text-body1" href="{swapContractLink[$currentNetwork.currencySymbol].url}" rel="noopener noreferrer" target="_blank">Ethereum Token Swap Contract</a>
        </p>

        <div class="flex-column buttons">
            {#if sent}
                <Button id={'continue-btn'}
                        classes={'button__solid button__primary'}
                        styles={'margin-bottom: 16px;'}
                        width={'100%'}
                        name="Continue" 
                        click={nextPage} />
            {:else}
                <Button id={'send-tx-btn'}
                    classes={`button__solid button__primary`}
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
       
            {#if whitelabel.helpLinks.show}
                <a  class="text-link text-caption text-secondary" 
                    href={whitelabel.helpLinks.masterURL || "https://docs.lamden.io/wallet/"}
                    target="_blank" 
                    rel="noopener noreferrer" >
                    Help & FAQ
                </a>
            {/if} 
         </div>
    </div>
    <div class="flex-column flow-content-right">
        <div class="swap-details" class:grey={sending || sent || errorMsg !== ''}>
            <h3>Transaction Details</h3>
            <p><strong>Contract:</strong><br>
                {`Ethereum ${getChainInfo().chainName}:`}
                {#if sending || sent || errorMsg !== ''} {getChainInfo().swapContract}
                {:else}
                    <a class="text-link" href={getChainInfo().blockExplorer + '/address/' + getChainInfo().swapContract} class:grey={sending} rel="noopener noreferrer" target="_blank">
                        {getChainInfo().swapContract}
                    </a>
                {/if}
            </p> 
            <p><strong>Function:</strong><br>
                swap
            </p> 
            <p><strong>Amount:</strong><br>
                {`${getApprovalAmount()} ${$currentNetwork.currencySymbol}`}
            </p> 
            <p><strong>Lamden Address:</strong><br>
                {#if sending || sent || errorMsg !== ''} {getLamdenAddress()}
                {:else}
                    <a class="text-link" href={$currentNetwork.blockExplorer + '/addresses/' + getLamdenAddress()} class:grey={sending} rel="noopener noreferrer" target="_blank">
                        {getLamdenAddress()}
                    </a>
                {/if}
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
                <h3>{'Transaction Successful!'}</h3>
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






