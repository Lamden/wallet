<script>
    import { getContext } from 'svelte';

    //Utils
    import { copyToClipboard, displayBalance } from '../../js/utils.js'

	//Stores
    import { currentNetwork } from '../../js/stores/stores.js';

    //Components
	import { Components }  from '../Router.svelte'
    const { Button, DropDown, TokenEditDetails } = Components;
    
    //Images
    import SaveIcon from '../icons/SaveIcon.svelte'
    import DeleteIcon from '../icons/DeleteIcon.svelte'

	//Context
    const { token, close, setPage, setMessage } = getContext('tokenmodify_functions');

    let options = [
        {id: 'modify-delete-btn', name: 'Delete', desc: 'Token from Wallet', iconComponent: DeleteIcon, color: 'grey', click: () => showDelete() },
    ]
    const buttons = [
        {id: 'close-btn', name: 'Close', click: () => close(), class: 'button__solid button__primary'}
    ]
    let message = {buttons}

    let newTokenMeta = createNewMetaObject()
    
    $: tokenUnChanged = (() => {
        let checker = Object.keys(newTokenMeta).map(key => {
            if (typeof token[key] === 'undefined') return true;
            return token[key] === newTokenMeta[key]
        })

        return checker.every(val => val === true)

    })()
    $: balance =  '0'

    const showDelete = () => setPage(2);

    const handleTokenUpdates = (e) => newTokenMeta = createNewMetaObject(e.detail)

    function createNewMetaObject(update = undefined){
        let newObj = {};
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
        return {...token, ...newObj}
    }

    const saveAndClose = () => {
        if (!tokenUnChanged) updateTokenInfo()
        close()
    }

    const updateTokenInfo = () => {
        chrome.runtime.sendMessage({type: 'updateToken', data: newTokenMeta})
    }

</script>

<style>
#token-options{
    background: inherit;
}
.options-box{
    justify-content: space-evenly;
    background: inherit;
}
.options{
    cursor: pointer;
    box-sizing: border-box;
    align-items: center;
    justify-content: space-between;
    width: 150px;
    height: 95px;
    border-radius: 8px;
    padding: 16px 0;
}

.primary{
    background-color: var(--primary-color);
}

.primary:hover{
    filter: brightness(125%);
}

.grey{
    background-color: var(--bg-secondary);
}

.grey:hover{
    filter: brightness(125%);
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
                class:grey={ option.color === 'grey'}
                class:primary={ option.color === 'primary'}
                on:click={option.click}>
                <svelte:component this={option.iconComponent} width="20px"/>
                <div class="option-name text-subtitle2">{option.name}</div>
                <div class="option-desc text-caption">{option.desc}</div>
            </div>
        {/each}
    </div>
    <div class="buttons flex-column">
        <Button classes={`button__solid button__primary`}
            width={'232px'}
            margin={'0 0 0 0'}
            name={tokenUnChanged ? "Close" : "Save & Close"}
            click={saveAndClose} />    
    </div>
</div>
