<script>
    import whitelabel from '../../../whitelabel.json'

    import { getContext } from 'svelte';

    //Icons
    import CheckmarkIcon from '../icons/CheckmarkIcon.svelte';

    //Stores
    import { currentNetwork, BalancesStore, NetworksStore, CoinStore} from '../../js/stores/stores.js';

    //Components
	import { Components }  from '../Router.svelte'
    const { Button, InputBox } = Components;

    //Utils
    import { hashStringValue, formatAccountAddress, copyToClipboard} from '../../js/utils.js';

	//Context
    const { home, getSelectedAccount, setHash } = getContext('coinmodify_functions');

    //DOM Nodes
    let formObj, passwordObj;

    let passwordOkay = false;
    let copySuccessful = false;
    let account = getSelectedAccount();
    let sk;

    const handleSubmit = () => {
        passwordObj.setCustomValidity('');
        if (passwordOkay){
            if (formObj.checkValidity()){
                copyWalletAddress()
            }
        }else{
            setHash(hashStringValue(passwordObj.value))
            chrome.runtime.sendMessage({type: 'viewPrivateKey', data: { 
                password: hashStringValue(passwordObj.value),
                vk: account.vk
            }}, (res) => {
                if (!res.success || chrome.runtime.lastError){
                    setValidity(passwordObj, "Incorrect Password")
                    passwordOkay = false;
                } else {
                    passwordOkay = true;
                    sk = res.data.sk;
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

    const copyWalletAddress = () => {
        copyToClipboard(sk)
        copySuccessful = true;
        setTimeout(() => copySuccessful = false, 2000)
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

.submit{
    width: 260px;
}

.copy-icon{
    margin-left: 10px
}
</style>

<div class="coin-delete">
    <h2> View Private Key </h2>
    <div class="text-body2">
        Never disclose your Private Key. This key can be used to steal all your accounts.
    </div>

    <form on:submit|preventDefault={() => handleSubmit(formObj) } bind:this={formObj} target="_self">
        {#if passwordOkay === false}
            <InputBox
                id={'pwd-input'}
                bind:thisInput={passwordObj}
                label={"Password"}
                placeholder={`Enter Lamden Vault Password`}
                margin="0 0 2rem 0"
                on:changed={() => setValidity(passwordObj, '')}
                on:keyup={refreshValidityKeyup}
                inputType={"password"}
                required={true}/>
        {:else}
            <InputBox
            id={'private-sk'}
            label={"Private Key"}
            margin="0 0 2rem 0"
            inputType={"text"}
            required={true}
            disabled={true}
            value={formatAccountAddress(sk, 10, 4)}/>
        {/if}
        <div class="buttons flex-column">
            <button  id={"validate-btn"}
                class="button__solid submit button__primary submit-button submit-button-text submit"
                type="submit" >
                    {passwordOkay ? copySuccessful? "COPY SUCCESS" : "COPY KEY" : "Validate Vault Password"}
                    {#if copySuccessful} 
                        <span class="copy-icon">
                            <CheckmarkIcon width="20px" color="var(--success-color)"/>
                        </span>
                    {/if}
            </button>
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