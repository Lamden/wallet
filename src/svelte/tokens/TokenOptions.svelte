<script>
    import { getContext } from 'svelte';

    //Utils
    import { copyToClipboard, displayBalance, getLogoFromURL, getTokenFromRocketswap } from '../../js/utils.js'

	//Stores
    import { currentNetwork } from '../../js/stores/stores.js';

    //Components
	import { Components }  from '../Router.svelte'
    const { Button, DropDown, TokenEditDetails } = Components;
    
    //Icons
    import SaveIcon from '../icons/SaveIcon.svelte'
    import DeleteIcon from '../icons/DeleteIcon.svelte'
    import RefreshIcon from '../icons/RefreshIcon.svelte'

	//Context
    const { close, setPage, setMessage } = getContext('tokenmodify_functions');
    let { token } = getContext('tokenmodify_functions');

    const MAX_IMAGE_SIZE = 100;
    const buttons = [
        {id: 'close-btn', name: 'Close', click: () => close(), class: 'button__solid button__primary'}
    ]
    let message = {buttons}
    let loadingData = false;
    let tokenRefreshed = false;

    let newTokenMeta = createNewMetaObject()
    
    $: tokenUnChanged = checkIfTokenChanged(newTokenMeta)

    $: options = [
        {id: 'modify-refresh-btn', name: 'Refresh', desc: 'Contract Metadata', iconComponent: RefreshIcon, color: loadingData ? 'grey' : 'primary', click: () => getTokenMeta() },
        {id: 'modify-delete-btn', name: 'Delete', desc: 'Token from Wallet', iconComponent: DeleteIcon, color: 'grey', click: () => showDelete() },
    ]

    const showDelete = () => setPage(2);

    const checkIfTokenChanged = (tokenInfo) => {
        let checker = Object.keys(token).map(key => {
            if (key === "contractName") return true;
            return token[key] === tokenInfo[key]
        })
        return checker.every(val => val === true)
    }

    const handleTokenUpdates = (e) => newTokenMeta = createNewMetaObject(e.detail)

    function createNewMetaObject(update = undefined){
        let newObj = {};
        if (update) {
            if (update.tokenName) newObj.tokenName = update.tokenName
            if (update.tokenSymbol) newObj.tokenSymbol = update.tokenSymbol
            if (update.logo_base64_svg) {
                newObj.logo_base64_svg = update.logo_base64_svg
                newObj.logo_base64_png = null
                newObj.logo_base64_url = null
            }
            if (update.logo_base64_png) {
                newObj.logo_base64_png = update.logo_base64_png
                newObj.logo_base64_svg = null
                newObj.logo_base64_url = null
            }
        }
        return {...token, ...newObj}
    }

    const saveAndClose = () => {
        updateTokenInfo(newTokenMeta)
        close()
    }

    const updateTokenInfo = (tokenInfo) => {
        Object.keys(tokenInfo).forEach(key => !tokenInfo[key] ? delete tokenInfo[key] : null)
        chrome.runtime.sendMessage({type: 'updateToken', data: tokenInfo})
    }

    const getTokenMeta = (contract) => {
        loadingData = true;
        if (!token.rocketswap) {
            chrome.runtime.sendMessage({type: 'getTokenMeta', data: token.contractName}, (result) => {
                loadingData = false;
                if (result) applyTokenMeta({contractName:token.contractName,  ...result})
            })
        } else {
            getTokenFromRocketswap(token.contractName).then(result => {
                loadingData = false;
                applyTokenMeta({contractName:token.contractName,  ...result})
            })
        }
    }

    const applyTokenMeta = async (tokenInfo, contractName) => {
        if (tokenInfo.logo_url) tokenInfo = await getLogoFromURL(tokenInfo, MAX_IMAGE_SIZE)
        if (!checkIfTokenChanged(tokenInfo)){
            tokenRefreshed = true;
            token = tokenInfo
            newTokenMeta = createNewMetaObject()
        }
    }

</script>

<style>
#token-options{
    background: var(--bg-primary);
}
.buttons{
    align-items: center;
    margin-top: 1rem;
}
h2{
    margin: 1rem 0 0.5rem;
}
p{
    margin-bottom: 1rem;
}

</style>

<div id="token-options" class="text-primary">
    <h2> {`${token.tokenName} Options`} </h2>
    <p class="font-primary-dim text-body2">{token.contractName}</p>
    <TokenEditDetails tokenMeta={newTokenMeta} on:changed={handleTokenUpdates}/>

    <div class="options-box flex-row">
        {#each options as option}
            <div id={option.id} class="options flex-column"
                class:options-box-grey={ option.color === 'grey'}
                class:options-box-primary={ option.color === 'primary'}
                on:click={option.click}>
                <svelte:component 
                    this={option.iconComponent} 
                    width="20px" 
                    color={option.color === "primary" ? "var(--color-white)" : "var(--font-primary)"}
                />
                <div class="option-name text-subtitle2">{option.name}</div>
                <div class="option-desc text-caption">{option.desc}</div>
            </div>
        {/each}
    </div>
    <div class="buttons flex-column">
        <Button classes={`button__solid button__primary`}
            id={"token-options-save-btn"}
            width={'232px'}
            margin={'0 0 0 0'}
            name="Save"
            disabled={tokenUnChanged && !tokenRefreshed}
            click={saveAndClose}
        />    
    </div>
</div>
