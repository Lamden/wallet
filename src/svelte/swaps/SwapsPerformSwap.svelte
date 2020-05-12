<script>
    import { onDestroy, onMount, getContext } from 'svelte';

    //Stores
    import { steps, currentNetwork } from '../../js/stores/stores.js';

    //Image
    import lamdenLogoOld from '../../img/coin_logos/lamden_logo_old.svg'
    import lamdenLogoNew from '../../img/coin_logos/lamden_logo_new.svg'
    import errorCircle from '../../img/menu_icons/icon_error-circle.svg'
    import flag from '../../img/menu_icons/icon_flag.svg'

    //Utils
    import ClearingHouse_API from '../../js/crypto/clearingHouseAPI'

	//Components
	import { Components }  from '../Router.svelte'
    const { Button, Loading } = Components;

    //Context
    const { 
        changeStep, 
        getEthAddress, 
        getLamdenAddress, 
        setSwapStatus, 
        setSwapResult, 
        getTxHash, 
        getApprovalAmount, 
        getChainInfo } = getContext('functions');

    const { switchPage } = getContext('app_functions');

    let attempts = 0;
    let maxAttempts = 20;
    let clearingHouseAPI;
    let swapStatus;
    let swapResult;
    let errorMsg = '';
    let swappingMessage  = '';

    $: sending = false;
    $: checking = false;
    $: success = undefined;

    onMount(() => {
        steps.update(stepsStore => {
            stepsStore.currentStep = 5;
            return stepsStore
        })
        startChecking();
        try{
            clearingHouseAPI = new ClearingHouse_API()
            sendSwapInfo();
        }catch (e){console.log(e)}
    })

    const sendSwapInfo = () => {
        let sending = true;
        swappingMessage = "sending swap information"
        clearingHouseAPI.startSwap({
            ethAddress: getEthAddress(), 
            lamdenAddress: getLamdenAddress()
        })
        .then(res => {
            swapStatus = res
            setSwapStatus(swapStatus)
            sending = false

            if (swapStatus.error){
                errorMsg = swapStatus.error;
                success = false
                return
            }
            if (swapStatus.status){
                if (swapStatus.status = 'success'){
                    swappingMessage = "swap accepted, checking status"
                    startChecking()
                }
            }

        })
        .catch(err => {
            console.log(err); 
            errorMsg = err;
            sending = false; 
        })
    }

    const getSwapStatus = async () => {
        let sending = true;
        return clearingHouseAPI.checkSwapStatus(swapStatus.uuid_receipt)
        .then(res => {
            swapResult = res
            setSwapResult(swapResult)
            sending = false

            if (swapResult.error){
                errorMsg = swapResult.error;
                success = false
                return
            }
            if (swapResult.status){
                swappingMessage = swapResult.status
                if (swapResult.status === "Swap is completed."){
                    success = true;
                    steps.update(stepsStore => {
                        stepsStore.currentStep = 6;
                        return stepsStore
                    })
                }
            }
        })
        .catch(err => {
            console.log(err); 
            errorMsg = err;
            sending = false; 
        })
    }
    
    const startChecking = () => {
        attempts = 0;
        new Promise(function(resolve, reject) {
            let timerId = setTimeout(async function checkStatus() {
                if (attempts >= maxAttempts){
                    resolve(false)
                }else{
                    if (errorMsg === ''){
                        attempts = attempts + 1;
                        await getSwapStatus();
                        if (success) resolve(true)
                        else timerId = setTimeout(checkStatus, 1000);
                    }
                }              
            }, 1000);
        })
    }

    const nextPage = () => {
        changeStep(5)
    }
</script>

<style>
.content-right{
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
    width: 100px;
    height: 100px;
    margin-bottom: 1rem;
    margin-left: 2rem;
}
.swap-deatils > div {
    align-items: center;
}
span, a {
    margin-left: 10px;
}
span.info-title{
    min-width: 110px;
}
.flex-row.items{
    max-width: 100%;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
}
.detail-value{
    max-width: 100%;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    margin-top: 1rem;
    padding: 20px;
    border-top: 1px solid var(--divider-color);
    border-bottom: 1px solid var(--divider-color);
    border-radius: 5px;
    height: 153px;
    justify-content: space-between;
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

<div class="flex-row swaps-intro">
    <div class="flex-column content-left">
        <h6>Swapping</h6>
    
        <div class="text-box text-body1 text-primary">
            {`Swapping Ethereum ${$currentNetwork.currencySymbol} for Lamden ${$currentNetwork.currencySymbol}`}
        </div>
        {#if !success && errorMsg === ''}
            <div class="text-box text-body1 text-red">
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
                    click={() => switchPage('CoinsMain')} />  
        </div>
    </div>
    <div class="flex-column content-right">
        {#if success}
            <div class="flag">{@html flag}</div>
        {/if}
        <p  class="text-body1" 
            class:text-red={errorMsg !== ''} 
            class:text-green={swappingMessage == 'Swap is completed.'}>
            {errorMsg === '' ? swappingMessage : errorMsg}
        </p>
        {#if !success}
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
                    <a href={`https://explorer.lamden.io/address/${getLamdenAddress()}`} 
                        class="outside-link text-subtitle2"
                        target="_blank" 
                        rel="noopener noreferrer">
                        {`${getLamdenAddress().slice(0, 25)}...`}
                    </a>
                </div>
            </div>
        {/if}
        {#if swapResult}
            {#if swapResult.details}
                <div class="flex-column detail-value">
                    {#each Object.keys(swapResult.details) as detail}
                        <div class="flex-row items"> 
                            <span class="info-title text-body2">{detail === 'uuid' ? 'swap_id' : detail}</span>
                            {#if detail === 'uuid'}
                                <a href={`http://localhost:8080/lookup?uuid=${swapResult.details[detail]}`}
                                   class="text-body2 outside-link " target="_blank" rel="noopener noreferrer">{swapResult.details[detail]}</a>
                            {/if}
                            {#if detail === 'eth_address'}
                                <a href={`${getChainInfo().blockExplorer}/address/${swapResult.details[detail]}`} 
                                   class="text-body2 outside-link " target="_blank" rel="noopener noreferrer">{swapResult.details[detail]}</a>
                            {/if}
                            {#if detail === 'eth_tx_hash'}
                                <a href={`${getChainInfo().blockExplorer}/tx/${swapResult.details[detail]}`} 
                                   class="text-body2 outside-link " target="_blank" rel="noopener noreferrer">{swapResult.details[detail]}</a>
                            {/if}
                            {#if detail === 'lamden_address'}
                                <a href={`https://explorer.lamden.io/address/${swapResult.details[detail]}`} 
                                   class="text-body2 outside-link " target="_blank" rel="noopener noreferrer">{swapResult.details[detail]}</a>
                            {/if}
                            {#if detail === 'lamden_tx_hash'}
                                <a href={`https://explorer.lamden.io/transaction/${swapResult.details[detail]}`} 
                                   class="text-body2 outside-link " target="_blank" rel="noopener noreferrer">{swapResult.details[detail]}</a>
                            {/if}
                            {#if detail === 'status'}
                                <span class="text-body2 text-primary-dark">{swapResult.details[detail]}</span>
                            {/if}
                            {#if detail === 'amount'}
                                <span class="text-body2 text-primary-dark">{`${swapResult.details[detail]} ${$currentNetwork.currencySymbol}`}</span>
                            {/if}
                        </div>
                    {/each}
                </div>
                <h2>{'SAVE THIS INFORMATION FOR YOUR RECORDS'}</h2>
            {/if}
        {/if}
    </div>
</div>

