<script>
    import whitelabel from '../../../whitelabel.json'
    
    import { getContext } from 'svelte';
    import { fade } from 'svelte/transition';

    //Misc
    import { steps, currentNetwork } from '../../js/stores/stores.js';
    import { isLamdenKey, toBigNumber, stringToFixed } from '../../js/utils.js';
    

	//Components
	import { Components }  from '../Router.svelte'
    const { Button, InputBox } = Components;

    //Context
    const { changeStep, setLamdenWallet, setMetamaskTxResponse, setSwapInfo } = getContext('functions');
    const { switchPage } = getContext('app_functions');

    let txHash;
    let lookupResponse;
    let errorMsg;
    let txSwapData;
    let alreadyProcessed = null;
    
    $: ethSenderAddress = lookupResponse ? lookupResponse.from : null;
    $: isEthTxHash = txHash ? txHash.match(/^0x([A-Fa-f0-9]{64})$/) ? true : false : false
    $: amount = txSwapData ? txSwapData.value : false
    $: amountBn = amount ? toBigNumber(amount) : false
    $: hasAmount = amountBn ? amountBn.isNaN() || amountBn.isLessThanOrEqualTo() ? false : true : false;
    $: amountToEth = hasAmount ? amountBn.dividedBy(toBigNumber(10).exponentiatedBy(18)) : toBigNumber("0")
    $: lamdenAddress = txSwapData ? txSwapData.receiver : false
    $: isLamdenAddress = lamdenAddress ? isLamdenKey(lamdenAddress) : false;
    $: checkedSeenHash = alreadyProcessed !== null
    $: canBeProcessed = checkedSeenHash ? alreadyProcessed ? false : true : false;
    $: hasAllValidInfo = isLamdenAddress && hasAmount
    $: readyToProcess = hasAllValidInfo && checkedSeenHash && canBeProcessed

    const lookupTxHash = () => {
        resetPageValues()
        chrome.runtime.sendMessage({type: 'checkEthTxStatus', data: { hash: txHash, contractType: "swap"}}, (response) => {
            if (response === null) {
                errorMsg = "Invalid Swap Transaction"
                return
            }
            if (response.error) {
                errorMsg = "Invalid Swap Transaction"
                return
            }
            const { swapdata } = response
            if (swapdata.receiver) {
                lookupResponse = response
                txSwapData = swapdata
                if (isLamdenKey(txSwapData.receiver)){
                    checkAlreadyProcessed()
                }else{
                    errorMsg = "Receiver is not a Lamden Address! This swap was not created using the Lamden Wallet!"
                }
            }
            else errorMsg = "Invalid Swap Transaction"
        })
    }

    const setAllSwapInfo = () => {
        let swapInfo = {}
        swapInfo.chainInfo = {
            "blockExplorer": "https://etherscan.io",
            "chainID": 1,
            "chainName": "Main Network",
            "swapContract": "0x78FC2eB9Dd55eb175c6145860385f84F8cbEE639",
            "tauContract": "0xc27a2f05fa577a83ba0fdb4c38443c0718356501",
            "tauSymbol": "TAU"
        }
        swapInfo.address = ethSenderAddress
        swapInfo.tokenBalance = {value: 0}
        setSwapInfo(swapInfo)
    }

    const checkAlreadyProcessed = () => {
        chrome.runtime.sendMessage({type: 'checkSwapSeenHashes', data: { hash: txHash}}, (response) => {
            if (response === null) alreadyProcessed = false;
            else alreadyProcessed = response
        })
    }

    const resetPageValues = () => {
        alreadyProcessed = null;
        txSwapData = undefined;
        ethSenderAddress = undefined;
    }

    const nextPage = () => {
        if (readyToProcess){
            setAllSwapInfo()
            setLamdenWallet({vk: lamdenAddress})
            setMetamaskTxResponse(lookupResponse, stringToFixed(amountToEth, 8))
            changeStep(8)
        }
    }
    
</script>

<style>
.flow-content-right{
    max-width: 80%;
    align-items: flex-start;
}
</style>

<div id="swap_chooseLamden" class="flex-row flow-page" in:fade="{{delay: 0, duration: 200}}">
    <div class="flex-column flow-content-left">
        <h6>Recover a Failed Swap</h6>
    
        <div class="flow-text-box text-body1 text-primary">
            {`Enter a successful ETH Swap transaction hash and click PROCESS SWAP to restart the lamden side.`}
        </div>

        <div class="flow-text-box text-body1 text-primary">
            {`You can usually find this transaction hash in your Metamask activity log.`}
        </div>

        <div class="flex-column flow-buttons">
            <Button id={'recover-btn'}
                    classes={'button__solid button__primary'}
                    styles={'margin-bottom: 16px;'}
                    width={'100%'}
                    name={"Process Swap"}
                    disabled={!hasAllValidInfo || !readyToProcess}
                    click={nextPage} />
            <Button id={'back-btn'}
                    classes={'button__solid'} 
                    styles={'margin-bottom: 16px;'}
                    width={'100%'}
                    name="Cancel" 
                    click={() => changeStep(4)} />  
            {#if whitelabel.helpLinks.show}
                <a  class="text-link text-caption text-secondary" 
                    href={whitelabel.helpLinks.masterURL || "https://docs.lamden.io/docs/wallet/token_swap"}
                    target="_blank" 
                    rel="noopener noreferrer" >
                    Help & FAQ
                </a>
            {/if} 
         </div>
    </div>
    <div class="flex-column flow-content-right" in:fade="{{delay: 0, duration: 200}}">
        <InputBox  
            id={'input-eth-swap-tx'} 
            label={'ETH Swap Hash (TX ID)'}
            margin="0 0 1rem 0"
            styles="max-width: 550px;"
            bind:value={txHash}
        />
        <Button 
            id="btn-get-swap-data"
            classes={'button__solid button__primary'}
            name="Get Swap Data" 
            disabled={!isEthTxHash}
            click={lookupTxHash} />

        {#if hasAllValidInfo}
            <p>Original Sender: 
                <a class="text-link" href="{`https://etherscan.io/address/${ethSenderAddress}`}" 
                target="_blank" 
                rel="noopener noreferrer">{ethSenderAddress}</a>
            </p>
            <p>Sending {stringToFixed(amountToEth, 8)} TAU to 
                <a class="text-link" href="{`https://mainnet.lamden.io/addresses/${lamdenAddress}`}" 
                target="_blank" 
                rel="noopener noreferrer">{lamdenAddress}</a>
            </p>

            {#if checkedSeenHash && !canBeProcessed}
                <p class="text-warning">This swap has already been processed!</p>
            {/if}
        {/if}

        {#if errorMsg}
            <p class="text-error">Error: {errorMsg}</p>
        {/if}
    </div>
</div>

