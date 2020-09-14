<script>
    import { onDestroy, onMount, getContext } from 'svelte';
    import { fade } from 'svelte/transition';

    //Stores
    import { steps, currentNetwork, SwapsStore } from '../../js/stores/stores.js';

    //Image
    import lamdenLogoOld from '../../img/coin_logos/lamden_logo_old.svg'
    import lamdenLogoNew from '../../img/coin_logos/lamden_logo_white.svg'
    import errorCircle from '../../img/menu_icons/icon_error-circle.svg'
    import circleCheck from '../../img/menu_icons/icon_circle-check.svg'

    //Utils
    import ClearingHouse_API from '../../js/crypto/clearingHouseAPI'

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
    margin-bottom: -0.5rem;
}
.icon-error{
    height: 30px;
    width: 30px;
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
    padding: 20px;
}
.flag{
    width: 150px;
    margin: 0 auto;
}
.swap-deatils > div {
    align-items: center;
}
.outside-link{
    font-weight: 300;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 250px;
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
                    classes={'button__solid button__purple'} 
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
            <h2 class="text-cyan" in:fade="{{delay: 0, duration: 500}}">Swap is Complete</h2>
        {/if}
        {#if errorMsg !== ''}
            <p class="text-body1 text-red" >{errorMsg}</p>
        {/if}

        {#if !success}
            <div class="swap-details">
                <div class="flex-column">
                    <div class="logo">{@html lamdenLogoOld}</div>
                    <a href={`${getChainInfo().blockExplorer}/address/${getEthAddress()}`} 
                        class="outside-link text-subtitle2"
                        target="_blank" 
                        rel="noopener noreferrer">
                        {getEthAddress()}
                    </a>
                </div>
                <div class="loading-column flex-column">
                    {#if typeof success === 'undefined'}
                        <Loading class="loading" width={'30px'} />
                    {:else}
                        <div class="loading icon-error">{@html errorCircle}</div>
                    {/if}
                    <p class="text-subtitle2">{`${getApprovalAmount()} ${$currentNetwork.currencySymbol}`}</p>
                </div>
                <div class="flex-column">
                    <div class="logo">{@html lamdenLogoNew}</div>
                    <a href={`https://explorer.lamden.io/addresses/${getLamdenAddress()}`} 
                        class="outside-link text-subtitle2"
                        target="_blank" 
                        rel="noopener noreferrer">
                        {getLamdenAddress()}
                    </a>
                </div>
            </div>
        {/if}
    </div>
</div>

