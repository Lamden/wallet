<script>
    import { onDestroy, onMount, getContext } from 'svelte';
    import { fade } from 'svelte/transition';

    //Stores
    import { steps, currentNetwork, SwapsStore } from '../../js/stores/stores.js';

    //Image
    import lamdenLogoNew from '../../img/coin_logos/lamden_logo_white.svg'
    import circleCheck from '../../img/menu_icons/icon_circle-check.svg'

    //Icons
    import LamdenOldLogo from '../icons/logos/LamdenOldLogo.svelte'
    import SwapIcon from '../icons/menu/SwapIcon.svelte'
    import ErrorIcon from '../icons/ErrorIcon.svelte'

    //Utils
    import ClearingHouse_API from '../../js/crypto/clearingHouseAPI'
    import { formatAccountAddress } from '../../js/utils'

	//Components
	import { Components }  from '../Router.svelte'
    const { Button, Loading } = Components;

    //Context
    const { 
        isContinue,
        getStepList,
        getEthAddress,
        getAnswers,
        getTxHash,
        getLamdenAddress, 
        setSwapResult, 
        getApprovalAmount, 
        getChainInfo } = getContext('functions');

    const { switchPage } = getContext('app_functions');

    let clearingHouseAPI;
    let swapStatus;
    let swapResult;
    let swappingMessage = ''
    let errorMsg = '';

    $: sending = false;
    $: success = undefined;

    onMount(() => {
        if (isContinue){
            steps.set({
                currentStep: 5,
                stepList: getStepList()
            });
        }else{
            steps.update(stepsStore => {
                stepsStore.currentStep = 5;
                return stepsStore
            })
        }
        try{
            clearingHouseAPI = new ClearingHouse_API()
            sendSwapInfo();
        }catch (e){console.log(e)}
    })

    const sendSwapInfo = () => {
        let sending = true;
        swappingMessage = "sending swap information"
        clearingHouseAPI.startSwap({
            tx: getTxHash("swapTx"), 
            answers: getAnswers()
        })
        .then(res => {
            sending = false

            if(!res){
                errorMsg = 'Error completing swap.';
                success = false
                return
            }
            setSwapResult(res)

            if (res.success){
                success = true
            }

            if (res.error){
                errorMsg = res.error;
                success = false
            }

            steps.update(stepsStore => {
                stepsStore.currentStep = 6;
                return stepsStore
             })
        })
        .catch(err => {
            console.log(err); 
            errorMsg = err;
            sending = false; 
        })
    }

</script>

<style>
.flow-content-right{
    justify-content: flex-start;
}
.loading-column{
    margin-top: 2rem;
}
.loading{
    margin-top: 2rem;
}
.swap-details{
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-evenly;
}
.swap-details > .flex-column{
    align-items: center;
}
.logo{
    width: 95px;
    padding: 20px 10px;
}
.flag{
    width: 150px;
    margin: 0 auto;
}
.swap-deatils > div {
    align-items: center;
}
.text-link{
    font-weight: 300;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 250px;
    text-align: center;
}
.amount{
        width: max-content;
}
@media (min-width: 1024px) {
    .swap-details{
        flex-direction: row;
        align-items: center;
        justify-content: space-around;
    }
    .loading-column{
        margin-top: 0;
    }
    .swap-deatils > div {
        padding: 20px;
    }
}
</style>

<div id="swap_perform" class="flex-row flow-page">
    <div class="flex-column flow-content-left">
        <h6>Swapping</h6>
    
        <div class="flow-text-box text-body1 text-primary">
            {`Swapping Ethereum ${$currentNetwork.currencySymbol} for Lamden ${$currentNetwork.currencySymbol}`}
        </div>
        {#if !success && errorMsg === ''}
            <div class="flow-text-box text-body1 text-red">
                {`DO NOT CLOSE THIS PAGE`}
            </div>
        {/if}
        <div class="flex-column buttons">
            <Button id={'home-btn'}
                    classes={'button__solid button__primary'} 
                    styles={'margin-bottom: 16px;'}
                    width={'100%'}
                    name="Home"
                    disabled={typeof success === 'undefined' && errorMsg === ''}
                    click={() => switchPage('Swaps')} />  
        </div>
    </div>
    <div class="flex-column flow-content-right">
        {#if success}
            <div class="flag" in:fade="{{delay: 0, duration: 500}}">{@html circleCheck}</div>
            <h2 class="text-accent" in:fade="{{delay: 0, duration: 500}}">Swap is Complete</h2>
        {/if}
        {#if !success}
            <div class="swap-details">
                <div class="flex-column flex-just-center">
                    <div class="logo"><LamdenOldLogo width="95px" color="var(--font-primary)"/></div>
                    <a href={`${getChainInfo().blockExplorer}/address/${getEthAddress()}`} 
                        class="text-link text-subtitle2"
                        target="_blank" 
                        rel="noopener noreferrer">
                        {formatAccountAddress(getEthAddress(), 8, 4)}
                    </a>
                </div>
                <div class="loading-column flex-column">
                    <SwapIcon width="30px" color="var(--font-primary-dim)"/>
                    <p class="amount text-subtitle2">{`${getApprovalAmount()} ${$currentNetwork.currencySymbol}`}</p>
                </div>
                <div class="flex-column">
                    <div class="logo">{@html lamdenLogoNew}</div>
                    <a href={`https://explorer.lamden.io/addresses/${getLamdenAddress()}`} 
                        class="text-link text-subtitle2"
                        target="_blank" 
                        rel="noopener noreferrer">
                        {formatAccountAddress(getLamdenAddress(), 8, 4)}
                    </a>
                </div>
            </div>
            <div class="flex-column flex-center-center loading">
                {#if typeof success === 'undefined'}
                    <Loading  width={'80px'} height="unset" />
                {/if}
                {#if errorMsg !== ''}
                    <ErrorIcon width="80px"/>
                    <p class="text-body1 text-red" >{errorMsg}</p>
                {/if}
            </div>
        {/if}
    </div>
</div>

