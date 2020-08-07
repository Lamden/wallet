<script>
    import { onDestroy, onMount, getContext } from 'svelte';
    import { fade } from 'svelte/transition';

    //Stores
    import { steps, currentNetwork } from '../../js/stores/stores.js';

	//Components
	import { Components }  from '../Router.svelte'
    const { Button, Loading } = Components;

    //Images
    import checkmarkWhite from '../../img/menu_icons/icon_checkmark-white.svg'
    import arrowRight2Color from '../../img/menu_icons/icon_arrow-right-2color.svg'
    import lamdenLogoOld from '../../img/coin_logos/lamden_logo_old.svg'
    import lamdenLogoNew from '../../img/coin_logos/lamden_logo_white.svg'
    

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

    const checkEthTxStatus = () => {
        if (!success){
            checking = true
            chrome.runtime.sendMessage({type: 'checkEthTxStatus', data: { hash: getTxHash() }}, (response) => {
                if (typeof response.status !== 'undefined'){
                    if (response.status){
                        success = true;
                    }
                }
                checking = false
            })
        }
    }

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
.swap-details > p {
    margin: 0 0 1rem;
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

<div class="flex-row flow-page" in:fade="{{delay: 0, duration: 200}}">
    <div class="flex-column flow-content-left">
        <h6>Checking For Tx Success</h6>
    
        <div class="flow-text-box text-body1 text-primary">
            {`Your Approval Transaction was posted to the Ethereum network.  Validating it was successful...`}
        </div>

        <div class="flex-column buttons">
            {#if !success}
                <Button id={'checking-btn'}
                        classes={'button__solid button__purple'}
                        styles={'margin-bottom: 16px;'}
                        width={'100%'}
                        name={success ? "Success" : "Check again"}
                        icon={success ? checkmarkWhite : ''}
                        iconPosition={'after'}
                        iconWidth={'19px'}
                        disabled={!success && attempts < maxAttempts}
                        click={startChecking} />
            {/if}
            <Button id={'initiate-btn'}
                    classes={`button__solid ${success ? 'button__green' : ''}`}
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
    <div class="flex-column flow-content-right">
        {#if !success}
            <Loading message="Checking for the success of your transaction.." 
                     subMessage={`Attempt ${attempts} of ${maxAttempts}`} />
        {/if}

        {#if success}
            <div class="swap-details">
                <div class="flex-column" in:fade="{{delay: 0, duration: 250}}">
                    <div class="logo">{@html lamdenLogoOld}</div>
                    <p class="text-body2 text-primary-dark">ethereum</p>
                    <a href={`${getChainInfo().blockExplorer}/address/${getEthAddress()}`} 
                       class="outside-link text-subtitle2"
                        target="_blank" 
                       rel="noopener noreferrer">
                        {`${getEthAddress().slice(0, 25)}...`}
                    </a>
                </div>
                <div class="arrow-column flex-column" in:fade="{{delay: 200, duration: 250}}">
                    <div class="arrow">{@html arrowRight2Color}</div>
                    <p class="text-subtitle2">{`${getApprovalAmount()} ${$currentNetwork.currencySymbol}`}</p>
                </div>
                <div class="flex-column" in:fade="{{delay: 400, duration: 250}}">
                    <div class="logo">{@html lamdenLogoNew}</div>
                    <p class="text-body2 text-primary-dark">lamden</p>
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

