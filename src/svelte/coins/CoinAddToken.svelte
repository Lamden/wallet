<script>
    import { getContext} from 'svelte';

    //Stores
    import { SettingsStore, currentNetwork } from '../../js/stores/stores.js';

    //Components
    import { Components } from '../Router.svelte';
    const { InputBox, TokenLogo} = Components;

    //Context
    const { closeModal } = getContext('app_functions');
    const { nextPage, setMessage, tokenPage } = getContext('coinadd_functions');
    
    //DOM NODES
    let formObj
    
    let contractName = ""
    let tokenName = ""
    let tokenMeta;
    let tokenSymbol = ""
    let error = null
    let contractChecker;
    let contractValid = null;

    const returnMessageButtons = [
            {id: "home-btn", name: 'Home', click: () => closeModal(), class: 'button__solid button__primary'},
            {id: "another-btn", name: 'Add Another', click: () => tokenPage(), class: 'button__solid'}
        ]
    
    const handleSubmit = (e) => {
        addToken(Object.assign(tokenMeta, {tokenSymbol, tokenName, contractName}))
    }

    const handleContractInput = (e) => {
        error = null
        tokenExists(contractName).then(exists => {
            if (!exists){
                 validateTokenContract()
            }else{
                error = "ALREADY ADDED"
            }
        })
    }
    
    const validateTokenContract = () => {
        const nameToCheck = contractName.slice();
        chrome.runtime.sendMessage({type: 'validateTokenContract', data: nameToCheck}, (result) => {
            contractValid = result
            if (contractValid) getTokenMeta(nameToCheck)
            else clearTokenMeta()
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

    const getTokenMeta = (contract) => {
        chrome.runtime.sendMessage({type: 'getTokenMeta', data: contract}, (result) => {
            if (result){
                tokenMeta = result
                tokenName = result.tokenName
                tokenSymbol = result.tokenSymbol
            }
        })
    }

    const clearTokenMeta = () => tokenName = tokenSymbol = ""

    const sendMessage = (returnMessage) => {
        returnMessage.buttons = returnMessageButtons
        setMessage(returnMessage)
    }

    const finish = (returnMessage) => {
        //chrome.runtime.sendMessage({type: 'balancesStoreUpdateAll', data: $currentNetwork.getNetworkInfo()})
        sendMessage(returnMessage);
        nextPage();
    }
</script>

<style>
    .token-logo-box{
        padding: 20px;
        border: 1px solid var(--outline);
    }
    .token-meta-left{
        flex-grow: 1;
        margin-right: 2rem;
    }
    .token-meta-right{
        margin-top: 1rem;
    }

    .submit-button-box{
        flex-grow: 1;
        justify-content: flex-end;
        align-items: center;
        padding-bottom: 20px;
    }

</style>

<form  class="flex-column" on:submit|preventDefault={handleSubmit} 
    target="_self" bind:this={formObj}>
        <h3 class="header">Enter Token Information</h3>

        <InputBox
            id={"contract_name"}
            margin="0 0 2rem 0"
            on:changed={handleContractInput}
            bind:value={contractName}
            placeholder={`Enter Token Contract Name`}
            label={"Contract Name"}
        />

        <div class="flex-row">
            <div class="token-meta-left">
                <InputBox
                    id={"nickname"}
                    margin="0 0 2rem 0"
                    bind:value={tokenName}
                    placeholder={`Enter Token Name`}
                    label={"Token Name"}
                    disabled={!contractValid}
                />

                <InputBox
                    id={"nickname"}
                    margin="0 0 2rem 0"
                    bind:value={tokenSymbol}
                    placeholder={`Enter Token Symbol`}
                    label={"Token Symbol"}
                    disabled={!contractValid}
                />
            </div>
            <div class="token-meta-right">
                <div class="token-logo-box flex-center-center">
                    <TokenLogo {tokenMeta} width="80px" />
                </div>
            </div>
        </div>

        <div class={"submit-button-box flex-column"}>
            <input class="button__solid button__primary submit submit-button submit-button-text submit-button-size" 
                   type="submit" 
                   value={error || "Add Token"}
                   disabled={tokenName === "" || tokenSymbol === "" || error}
            >
        </div>
</form>