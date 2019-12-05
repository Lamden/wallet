<script>
    import { onMount, getContext } from 'svelte';

	//Stores
    import { CoinStore } from '../../js/stores/stores.js';

    //Components
	import { Components }  from '../../js/router.js'
    const { Button, InputBox } = Components;

    //Images
    import { icons } from '../../js/images.js';
    const { warning } = icons;

	//Context
    const { switchPage } = getContext('app_functions');
    const { home, setPage } = getContext('coinmodify_functions');

    //DOM Nodes
    let formObj;

    //Props
    export let coin;

    let pwd;
    let passwordOkay = false;

    function handleSubmit(form){
        if (form.checkValidity()){
            if (!passwordOkay){
                passwordOkay = true;
            }else{
                setPage(4);
            }
        } else {
            alert('no')
        }
    }

    function validatePassword(e){
        let obj = e.detail.target;
        if (!CoinStore.validatePassword(pwd)) {
            obj.setCustomValidity("Incorrect Wallet Password");
        } else {
            obj.setCustomValidity('');
        }
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
                    bind:value={pwd}
                    label={"Password"}
                    placeholder={`Enter Lamden Wallet Password`}
                    styles={`margin-bottom: 17px;`}
                    on:changed={ (e) => validatePassword(e) }
                    inputType={"password"}
                    required={true}
                />
            {:else}
                <div class="warning-message flex-row">
                    <img class="icon" src={warning} alt="warning icon" />
                    <h6>Please Confirm Wallet Deletion</h6>
                </div>
                
            {/if}
        </div>
        <div class="buttons flex-column">
            <input  class="button__solid submit submit-button submit-button-text submit-button-size"
                    class:button-red={passwordOkay}
                    class:button-purple={!passwordOkay}
                    type="submit" 
                    value={passwordOkay ? "Confirm Wallet Deletion" : "Validate Wallet Password"}>
            <Button classes={'button__solid buttom__purple'} 
                    width={'232px'}
                    margin={'10px 0 0 0'}
                    name="Back" 
                    click={() => home()} />  
        </div>
    </form>
</div>