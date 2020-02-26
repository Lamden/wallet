<script>
    import { getContext } from 'svelte';

    //Components
	import { Components }  from '../Router.svelte'
    const { Button, InputBox } = Components;

    //Utils
    import { hashStringValue } from '../../js/utils.js'

    //Images
    import warning from '../../img/menu_icons/icon_warning.svg';

	//Context
    const { switchPage } = getContext('app_functions');
    const { home, setPage } = getContext('coinmodify_functions');

    //DOM Nodes
    let formObj, passwordObj;

    let passwordOkay = false;

    function handleSubmit(form){
        if (passwordOkay){
            if (formObj.checkValidity()){
                setPage(4);
            }
        }else{
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

    function setValidity(node, message){
        node.setCustomValidity(message);
        node.reportValidity();
    }

    function refreshValidityKeyup(e){ 
        if (e.detail.keyCode !== 13) setValidity(passwordObj, '')
    }
</script>

<style>
.buttons{
    align-items: center;
    margin: 37px 0 13px;
}

.button-red{
    color: #FFFFFF;
    background: red;
}

.button-purple{
    color: #FFFFFF;
    background: var(--primary-color);
}

.back-it-up{
    cursor: pointer;
    color: cyan;
}

.subtitle{
    height: 60px;
}

.content-box{
    height: 70px;
}

.warning-message{
    align-items: center;
    justify-content: center;
}

.icon{
    margin-right: 10px;
    width: 20px;
}

.submit{
    width: 260px;
}
</style>

<div class="coin-delete">
    <h5> Delete Wallet </h5>


    <div class="subtitle text-subtitle3">
        Deleting this wallet will remove it from your Lamden Wallet.
        If you have currency on it, remember to
        <span class="back-it-up" on:click={() => switchPage('Backup')}> back it up</span> 
    </div>

    <form on:submit|preventDefault={() => handleSubmit(formObj) } bind:this={formObj} target="_self">
        <div class="content-box">
            {#if passwordOkay ==- false}
                <InputBox
                    id={'pwd-input'}
                    bind:thisInput={passwordObj}
                    label={"Password"}
                    placeholder={`Enter Lamden Wallet Password`}
                    styles={`margin-bottom: 17px;`}
                    on:changed={() => setValidity(passwordObj, '')}
                    on:keyup={refreshValidityKeyup}
                    inputType={"password"}
                    required={true}/>
            {:else}
                <div id={'warning-msg'} class="warning-message flex-row">
                    <div class="icon" >{@html warning}</div>
                    <h6>Please Confirm Wallet Deletion</h6>
                </div>
                
            {/if}
        </div>
        <div class="buttons flex-column">
            <input  class="button__solid submit submit-button submit-button-text submit"
                    class:button-red={passwordOkay}
                    class:button-purple={!passwordOkay}
                    type="submit" 
                    value={passwordOkay ? "Confirm Wallet Deletion" : "Validate Wallet Password"}>
            <Button 
                    id={"back-btn"}
                    classes={'button__solid buttom__purple'} 
                    width={'260px'}
                    margin={'10px 0 0 0'}
                    name="Back" 
                    click={() => home()} />  
        </div>
    </form>
</div>