<script>
    import { getContext} from 'svelte';

    //Stores
    import { SettingsStore, currentNetwork, CoinStore } from '../../js/stores/stores.js';

    //Components
    import { Components } from '../Router.svelte';
    const { InputBox, Button, TokenEditDetails, Loading, DropDown} = Components;

    //Misc
    import { getLogoFromURL } from '../../js/utils.js'

    //Context
    const { closeModal, joinTokenService } = getContext('app_functions');
    const { nextPage, setMessage, tokenPage } = getContext('coinadd_functions');
    
    //DOM NODES
    let formObj
    
    const MAX_IMAGE_SIZE = 100;
    
    let adding = false;

    let contractName
    let error = null
    let contractChecker
    let contractValid = null
    let addType = 1
    
    let tokenMeta = undefined
    let newTokenMeta = undefined; 

    let loadingData = false;
    let isLoadingTokens = false;
    let validating = false;

    $: tokenList = getTokenList();
    $: network = $currentNetwork.type;
    $: hasNameAndSymbol = newTokenMeta ? newTokenMeta.tokenName && newTokenMeta.tokenSymbol : false;
    $: buttonDisabled = (!contractValid && !tokenMeta ) || error || !hasNameAndSymbol
    $: buttonGroup = [
            {id:"add-existing-token-btn", name: 'Add Existing', click: () => handleButtonGroupChange(1), class: addType === 1 ? ' button__primary buttonGroup__left' : 'buttonGroup__left' },
            {id:"add-custom-token-btn", name: 'Add Custom', click: () =>  handleButtonGroupChange(2), class: addType === 2 ? ' button__primary buttonGroup__right' : 'buttonGroup__right' },
        ]
    
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
                newObj.token_logo_url = null
            }
            if (update.logo_base64_png) {
                newObj.logo_base64_png = update.logo_base64_png
                newObj.logo_base64_svg = null
                newObj.token_logo_url = null
            }
        }
        newTokenMeta =  {...tokenMeta, ...newObj}
    }

    const handleSubmit = async (e) => {
        if (newTokenMeta.logo_url && !newTokenMeta.logo_base64_svg && !newTokenMeta.logo_base64_png) {
            newTokenMeta=  await getLogoFromURL(newTokenMeta, MAX_IMAGE_SIZE)
        }
        addToken(newTokenMeta)
    }

    const handleInputKeyUp = () => {
        error = ""
        clearTokenMeta()
    }

    const handleContractInput = (e) => {
        error = null
        contractValid = false
        tokenMeta = undefined;
        contractName = e.detail.target.value
        loadingData = true;
        if (contractName.length > 0){
            tokenExists(contractName).then(exists => {
                if (!exists){
                    validateTokenContract()
                }else{
                    loadingData = false;
                    error = "Token already in Lamden Vault"
                }
            })
        }
    }

    const handleTokenDetailsChanged = (e) => createNewMetaObject(e.detail)
    
    const validateTokenContract = () => {
        error = null
        const nameToCheck = contractName.slice();
        chrome.runtime.sendMessage({type: 'validateTokenContract', data: nameToCheck}, (result) => {
            loadingData = false;
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

    const addToken = async (tokenInfo) => {
        Object.keys(tokenInfo).forEach(key => !tokenInfo[key] ? delete tokenInfo[key] : null)
        adding = true
        chrome.runtime.sendMessage({type: 'addToken', data: tokenInfo}, (result) => {
            if (result) {
                finish({type:'success', text: `${tokenInfo.tokenName} added successfully`}, tokenInfo);
            } else {
                adding = false;
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

    const finish = (returnMessage, tokenInfo) => {
        chrome.runtime.sendMessage({type: 'refreshOneTokenBalances', data: tokenInfo.contractName})
        let accounts = $CoinStore || []
        accounts.forEach((i) => {
            joinTokenService(tokenInfo.contractName, i.vk)
        })
        sendMessage(returnMessage);
        nextPage();
    }

    const handleContractSelect = (e) => {
        clearTokenMeta()
        error = null
        contractValid = false
        tokenMeta = undefined;
        contractName = e.detail.selected.value.contractName
        if (contractName.length > 0){
            tokenExists(contractName).then(exists => {
                if (!exists){
                    validating = true
                    const nameToCheck = contractName.slice();
                    chrome.runtime.sendMessage({type: 'validateTokenContract', data: nameToCheck}, (result) => {
                        if (nameToCheck !== contractName) return
                        validating = false
                        contractValid = result
                        if (contractValid && addType === 1){
                            tokenMeta = e.detail.selected.value
                            tokenMeta["rocketswap"] = true
                            newTokenMeta = tokenMeta
                        } else {
                            error = "Invalid Token Contract"
                            clearTokenMeta()
                        }
                    })
                }else{
                    error = "Token already in Lamden Vault"
                }
            })
        }
    }

    const handleButtonGroupChange = (type) => {
        addType = type
        clearTokenMeta()
        error = null
        contractValid = false
        tokenMeta = undefined
        contractName = undefined
    }

    /**
     * Fetch existing token list form the Rocketswap API.
     * @link https://rocketswap.exchange
     */
     const getTokenList = async () => {
        let tokenlist = [];
        isLoadingTokens = true;
        const api = "https://rocketswap.exchange:2053/api/token_list";
        const tokens = await fetch(api).then(res => res.json());
        isLoadingTokens = false;

        // weed out all the coins that have no market.
        tokenlist = tokens.filter(token => token.has_market).map(item => {
            return {
                name: `${item.token_name} (${item.token_symbol})`,
                token: true,
                value: {
                    contractName: item.contract_name,
                    tokenName: item.token_name,
                    tokenSymbol: item.token_symbol,
                    logo_base64_svg: item.token_base64_svg,
                    logo_base64_png: item.token_base64_png,
                    logo_url: item.token_logo_url
                },
            }
        });
        tokenlist.sort((a, b) => a.value.tokenName.localeCompare(b.value.tokenName));
        return tokenlist;
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
        margin-top: 2rem;
    }

    .loading-box{
        width: 50px;
        position: absolute;
        top: 50%;
        right: 40px;
    }

    .loading-box-add-custom{
        width: 22px;
        position: absolute;
        top: 47%;
        right: 13px;
    }

    .header{
        margin-top: 30px;
    }

    .button-group{
        margin-bottom: 1rem;
        border-radius: 4px;
        box-shadow: var(--box-shadow-2);
        -webkit-box-shadow: var(--box-shadow-2);
        -moz-box-shadow: var(--box-shadow-2);

    }

    .error-msg{
        margin-bottom: 1rem;
    }

    .existing-testnet-text{
        margin-bottom: 1.6rem;
    }
</style>

<div class="flex-column" >
    <h3 class="header">Choose Action</h3>
    <div class="button-group flex-row">
        {#each buttonGroup as button, index}
            <Button
                id={button.id} 
                classes={`button__solid ${button.class}`} 
                width={'100%'}
                name={button.name}
                click={button.click}
                tabIndex={"-1"} />
        {/each}        
    </div>
    {#if addType === 1}
        {#if network === "mainnet"}
            {#if isLoadingTokens}
                <Loading message={'Loading Tokens'} />
            {:else}
                <div class="flex-row flex-align-center" style="position: relative;">
                    {#await tokenList}
                        <DropDown  
                            items={[]}
                            id={'contract_name'} 
                            label={'Please select a token'}
                            margin="0 0 1rem 0"
                            on:selected={ handleContractSelect }
                        />
                    {:then res}
                        <DropDown  
                            items={res}
                            id={'contract_name'} 
                            label={'Please select a token'}
                            margin="0 0 1rem 0"
                            on:selected={ handleContractSelect }
                        />
                    {/await}
                    <div class="loading-box flex-row flex-center-center">
                        {#if validating}
                            <Loading width="30px" mainStyle="margin: -16px 0 0 12px;"/>
                        {/if}
                    </div>
                </div>
                {#if error}
                    <div id="dropdown-error" class="text-warning error-msg">{error}</div>
                {/if}
                <div class={"button-box flex-column"} >
                    <Button 
                        id={"add-token-btn"}
                        classes={'button__solid button__primary'} 
                        width={'260px'}
                        name={validating ? "Getting Data" : "Add Token"} 
                        click={handleSubmit}
                        disabled={buttonDisabled || adding}/>  
                        
                </div>
            {/if}
        {/if}
        {#if network === "testnet"}
            <h4 class="existing-testnet-text text-primary-dim">Not available on TESTNET. Use ADD CUSTOM instead.</h4>
        {/if}
    {/if}
    {#if addType === 2}
        <div class="flex-row flex-align-center" style="position: relative;">
            <InputBox
                id={"contract_name"}
                margin="0 0 2rem 0"
                width="100%"
                on:changed={handleContractInput}
                on:keyup={handleInputKeyUp}
                warningMsg={error || ""}
                placeholder={`Enter Token Contract Name`}
                label={"Contract Name"}
            />
            <div class="loading-box-add-custom flex-row flex-center-center">
                {#if loadingData}
                    <Loading width="22px" mainStyle="margin: -16px 0 0 12px;"/>
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
                disabled={buttonDisabled || adding}/>  
        </div>
    {/if}
</div>