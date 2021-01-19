<script>
    import { getContext} from 'svelte';

    //Stores
    import { SettingsStore, currentNetwork } from '../../js/stores/stores.js';

    //Components
    import { Components } from '../Router.svelte';
    const { InputBox, Button, TokenEditDetails, Loading} = Components;

    //Context
    const { closeModal } = getContext('app_functions');
    const { nextPage, setMessage, tokenPage } = getContext('coinadd_functions');
    
    //DOM NODES
    let formObj
    
    
    let contractName
    let error = null
    let contractChecker
    let contractValid = null
    
    let tokenMeta = undefined
    let newTokenMeta = undefined; 

    let loadingData = false;

    const returnMessageButtons = [
            {id: "home-btn", name: 'Home', click: () => closeModal(), class: 'button__solid button__primary'},
            {id: "another-btn", name: 'Add Another', click: () => tokenPage(), class: 'button__solid'}
        ]

    const createNewMetaObject = (update = undefined) => {
        let newObj  = {contractName};
        if (update) {
            if (update.tokenName) newObj.tokenName = update.tokenName
            if (update.tokenSymbol) newObj.tokenSymbol = update.tokenSymbol
            if (update.logo_base64_svg) {
                newObj.logo_base64_svg = update.logo_base64_svg
                newObj.logo_base64_png = null
            }
            if (update.logo_base64_png) {
                newObj.logo_base64_png = update.logo_base64_png
                newObj.logo_base64_svg = null
            }
        }
        newTokenMeta =  {...tokenMeta, ...newObj}
    }

    const handleSubmit = (e) => {
        addToken(newTokenMeta)
    }

    const handleInputKeyUp = () => {
        error = ""
        clearTokenMeta()
    }

    const handleContractInput = (e) => {
        error = null
        contractName = e.detail.target.value
        if (contractName.length > 0){
            tokenExists(contractName).then(exists => {
                if (!exists){
                    validateTokenContract()
                }else{
                    error = "Token already in Wallet"
                }
            })
        }
    }

    const handleTokenDetailsChanged = (e) => createNewMetaObject(e.detail)
    
    const validateTokenContract = () => {
        error = null
        const nameToCheck = contractName.slice();
        chrome.runtime.sendMessage({type: 'validateTokenContract', data: nameToCheck}, (result) => {
            contractValid = result
            if (contractValid) getTokenMeta(nameToCheck)
            else {
                error = "Invalid Token Contract"
                clearTokenMeta()
            }
        })
    }
    const getTokenMeta = (contract) => {
        loadingData = true;
        chrome.runtime.sendMessage({type: 'getTokenMeta', data: contract}, (result) => {
            loadingData = false;
            if (result){
                tokenMeta = result
                createNewMetaObject()
            }
        })
    }

    const addToken = (tokenInfo) => {
        chrome.runtime.sendMessage({type: 'addToken', data: tokenInfo}, (result) => {
            if (result) {
                finish({type:'success', text: `${tokenInfo.tokenName} added successfully`});
                SettingsStore.setLastCoinAddedDate();
            }
        })
    }

    const tokenExists = (contract) => {
        return new Promise(resolve => {
            chrome.runtime.sendMessage({type: 'tokenExists', data: contract}, (result) => {
                resolve(result)
            })
        })
    }

    const clearTokenMeta = () => {
        tokenMeta = undefined;
        newTokenMeta = undefined;
    }

    const sendMessage = (returnMessage) => {
        returnMessage.buttons = returnMessageButtons
        setMessage(returnMessage)
    }

    const finish = (returnMessage) => {
        chrome.runtime.sendMessage({type: 'refreshTokenBalances'})
        sendMessage(returnMessage);
        nextPage();
    }
</script>

<style>
    .token-meta-box-dim{
        filter: var(--componet-disabled);
    }

    .button-box{
        flex-grow: 1;
        justify-content: flex-end;
        align-items: center;
        padding-bottom: 20px;
    }

    .loading-box{
        width: 50px;
    }

</style>

<div class="flex-column" >
    <h3 class="header">Enter Token Information</h3>
    <div class="flex-row flex-align-center">
        <InputBox
            id={"contract_name"}
            margin="0 0 2rem 0"
            on:changed={handleContractInput}
            on:keyup={handleInputKeyUp}
            warningMsg={error || ""}
            placeholder={`Enter Token Contract Name`}
            label={"Contract Name"}
        />
        <div class="loading-box flex-row flex-center-center">
            {#if loadingData}
                <Loading width="30px" mainStyle="margin: -16px 0 0 12px;"/>
            {/if}
        </div>
    </div>

    <div class:token-meta-box-dim={error !== null || !tokenMeta}>
        <TokenEditDetails 
            tokenMeta={newTokenMeta} 
            on:changed={handleTokenDetailsChanged} 
            disableInputs={!contractValid && !tokenMeta} 
            {error}
        />
    </div>

    <div class={"button-box flex-column"}>
        <Button 
            id={"add-token-btn"}
            classes={'button__solid button__primary'} 
            width={'260px'}
            name={"Add Token"} 
            click={handleSubmit}

            disabled={(!contractValid && !tokenMeta )|| error}/>  
    </div>
</div>