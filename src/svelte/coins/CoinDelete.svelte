<script>
    import whitelabel from '../../../whitelabel.json'

    import { getContext } from 'svelte';

    //Stores
    import { currentNetwork, BalancesStore, NetworksStore } from '../../js/stores/stores.js';

    //Components
	import { Components }  from '../Router.svelte'
    const { Button, InputBox } = Components;

    //Utils
    import { hashStringValue } from '../../js/utils.js'

    //Images
    import caution from '../../img/menu_icons/icon_caution.svg';

	//Context
    const { switchPage } = getContext('app_functions');
    const { home, setPage, getDappInfo, getSelectedAccount, setHash } = getContext('coinmodify_functions');

    //DOM Nodes
    let formObj, passwordObj;

    let passwordOkay = false;
    let account = getSelectedAccount();
    let dappInfo = getDappInfo();
    let tauBalance = BalancesStore.getBalance(NetworksStore.mainnetNetwork, account.vk) || 0

    const handleSubmit = (form) => {
        if (passwordOkay){
            if (formObj.checkValidity()){
                setPage(4);
            }
        }else{
            setHash(hashStringValue(passwordObj.value))
            chrome.runtime.sendMessage({type: 'validatePassword', data: hashStringValue(passwordObj.value)}, (valid) => {
                if (!valid || chrome.runtime.lastError){
                    setValidity(passwordObj, "Incorrect Password")
                    passwordOkay = false;
                } else {
                    passwordOkay = valid;
                }
            })
        }
    }

    const setValidity = (node, message) => {
        node.setCustomValidity(message);
        node.reportValidity();
    }

    const refreshValidityKeyup = (e) => {
        if (e.detail.keyCode !== 13) setValidity(passwordObj, '')
    }
</script>

<style>
.coin-delete{
    background: inherit;
}
form{
    width: 260px;
    margin: 1rem auto;
}
.buttons{
    align-items: center;
    margin: 2rem 0 1rem;
}

.back-it-up{
    cursor: pointer;
}
.icon{
    margin-right: 22px;
    width: 93px;
}

.submit{
    width: 260px;
}
.caution{
    color: var(--font-warning);
}

.dapp-caution{
    align-items: center;
    justify-content: center;
    margin: 1rem 0;
    line-height: 1.4;
}
.underline{
    text-decoration: underline;
}
.linked{
    cursor: pointer;
}
.linked:hover{
    color: var(--font-accent);
}
</style>

<div class="coin-delete">
    <h2> Delete Account </h2>
    <div class="text-body2">
        {`Deleting this Account will remove it from your Lamden Vault. If you have currency on it, remember to`}
        <span class="text-accent back-it-up" on:click={() => switchPage('BackupMain')}> back it up</span> 
    </div>

    {#if tauBalance > 0}
        <div class="flex-row dapp-caution">
            <div class="icon">{@html caution}</div>
            <p class="caution text-body2">
                This account has a <strong>MainNet</strong> balance of <strong class="underline">{tauBalance.toLocaleString('en')} TAU</strong>.
                After deleting this account you  <strong >WILL</strong> lose access to this TAU.
                Createing a backup of your account first is <strong class="underline linked" on:click={() => switchPage('BackupMain')}>STRONGLY RECOMMENDED.</strong>
            </p>
        </div>
    {/if}

    {#if dappInfo}
        <div class="flex-row dapp-caution">
            <div class="icon">{@html caution}</div>
            <p class="caution text-body2">
                This account is linked to 
                <strong>{dappInfo.appName}</strong> 
                (<a class="text-link" href="{dappInfo.url}">{dappInfo.url}</a>).
                You <strong >WILL</strong> lose all assocations with its smart contract.
                Createing a backup of your account first is <strong class="underline linked" on:click={() => switchPage('BackupMain')}>STRONGLY RECOMMENDED.</strong>
            </p>
        </div>
    {/if}

    <form on:submit|preventDefault={() => handleSubmit(formObj) } bind:this={formObj} target="_self">
        {#if passwordOkay ==- false}
            <InputBox
                id={'pwd-input'}
                bind:thisInput={passwordObj}
                label={"Password"}
                placeholder={`Enter ${whitelabel.companyName} Lamden Vault Password`}
                margin="0 0 2rem 0"
                on:changed={() => setValidity(passwordObj, '')}
                on:keyup={refreshValidityKeyup}
                inputType={"password"}
                required={true}/>
        {/if}
        <div class="buttons flex-column">
            <input  id={"validate-btn"}
                    class="button__solid submit submit-button submit-button-text submit"
                    class:button__red={passwordOkay}
                    class:button__primary={!passwordOkay}
                    type="submit" 
                    value={passwordOkay ? "DELETE ACCOUNT" : "Validate Vault Password"}>
            <Button 
                    id={"back-btn"}
                    classes={'button__solid buttom__primary'} 
                    width={'260px'}
                    margin={'10px 0 0 0'}
                    name="Back" 
                    click={() => home()} />  
        </div>
    </form>
</div>