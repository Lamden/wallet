<script>
    import { onDestroy, onMount, getContext } from 'svelte';

    //Stores
    import { steps, currentNetwork } from '../../js/stores/stores.js';

	//Components
	import { Components }  from '../Router.svelte'
    const { Button, Loading } = Components;

    //Images
    import checkmarkWhite from '../../img/menu_icons/icon_checkmark-white.svg'
    import arrowRight2Color from '../../img/menu_icons/icon_arrow-right-2color.svg'
    import lamdenLogoOld from '../../img/coin_logos/lamden_logo_old.svg'
    import lamdenLogoNew from '../../img/coin_logos/lamden_logo_new.svg'
    

    //Context
    const { changeStep, getTxHash, getEthAddress, getLamdenAddress, getApprovalAmount, getChainInfo } = getContext('functions');
    const { switchPage } = getContext('app_functions');

    let attempts = 0;
    let maxAttempts = 20;

    $: checking = false;
    $: success = false;

    onMount(() => {
        steps.update(stepsStore => {
            stepsStore.currentStep = 4;
            return stepsStore
        })
        startChecking();
    })
    
    onDestroy(() =>{
        chrome.runtime.onMessage.removeListener(ethTxStatus)
    })

    const checkEthTxStatus = () => {
        if (!success){
            checking = true
            chrome.runtime.sendMessage({type: 'checkEthTxStatus', data: { hash: getTxHash() }})
        }
    }

    const ethTxStatus = (message, sender, sendResponse) => {
		if (message.type === 'ethTxStatus') {
            if (typeof message.data.status !== 'undefined'){
                if (message.data.status){
                    success = true;
                }
            }
            checking = false
        }
    }
    chrome.runtime.onMessage.addListener(ethTxStatus)

    const nextPage = () => {
        changeStep(4)
    }

    const startChecking = () => {
        if (!success){
            attempts = 0;
            new Promise(function(resolve, reject) {
                let timerId = setTimeout(async function checkStatus() {
                    if (checking){
                        timerId = setTimeout(checkStatus, 1000);
                    }else{
                        if (success){
                            resolve()
                        }else{
                            if (attempts >= maxAttempts){
                                reject()
                            }else{
                                attempts = attempts + 1;
                                checkEthTxStatus();
                            }
                        } 
                    }               
                }, 1000);
            })
        }
    }
</script>

<style>
.swap-details{
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-evenly;
}
.logo{
    width: 95px;
    padding: 20px;
}
.arrow-column{
    margin-top: 2rem;
}
.arrow{
    width: 60px;
    margin-bottom: -1rem;
    transform: rotate(90deg);
}
.swap-details > div {
    align-items: center;
}
@media (min-width: 1024px) {

    .swap-details{
        flex-direction: row;
        align-items: center;
        justify-content: space-around;
    }
    .arrow-column{
        margin-top: 0;
    }
    .arrow{
        transform: unset;
    }
    .swap-details > div {
        padding: 20px;
    }
}
</style>

<div class="flex-row swaps-intro">
    <div class="flex-column content-left">
        <h6>Checking For Tx Success</h6>
    
        <div class="text-box text-body1 text-primary">
            {`Your Approval Treansaction was posted to the Ethereum nextwork.  Validating it was successful...`}
        </div>

        <div class="flex-column buttons">
            <Button id={'checking-btn'}
                    classes={`button__solid ${success ? 'button__green' : 'button__purple'}`}
                    styles={'margin-bottom: 16px;'}
                    width={'100%'}
                    name={success ? "Success" : "Check again"}
                    icon={success ? checkmarkWhite : ''}
                    iconPosition={'after'}
                    iconWidth={'19px'}
                    disabled={!success && attempts < maxAttempts}
                    click={startChecking} />
            <Button id={'initiate-btn'}
                    classes={'button__solid button__purple'}
                    styles={'margin-bottom: 16px;'}
                    width={'100%'}
                    name="Initate Swap" 
                    disabled={!success && checking}
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
        {#if !success}
            <Loading message="Checking for the success of your transaction.." 
                     subMessage={`Attempt ${attempts} of ${maxAttempts}`} />
        {/if}

        {#if success}
            <div class="swap-details">
                <div class="flex-column">
                    <div class="logo">{@html lamdenLogoOld}</div>
                    <a href={`${getChainInfo().blockExplorer}/address/${getEthAddress()}`} 
                       class="outside-link text-subtitle2"
                        target="_blank" 
                       rel="noopener noreferrer">
                        {`${getEthAddress().slice(0, 25)}...`}
                    </a>
                </div>
                <div class="arrow-column flex-column">
                    <div class="arrow">{@html arrowRight2Color}</div>
                    <p class="text-subtitle2">{`${getApprovalAmount()} ${$currentNetwork.currencySymbol}`}</p>
                </div>
                <div class="flex-column">
                    <div class="logo">{@html lamdenLogoNew}</div>
                    <a href={`https://explorer.lamden.io/address/${getLamdenAddress()}`} 
                       class="outside-link text-subtitle2"
                       target="_blank" 
                       rel="noopener noreferrer">
                        {`${getLamdenAddress().slice(0, 25)}...`}
                    </a>
                </div>
            </div>
        {/if}
    </div>
</div>

