<script>
    import whitelabel from '../../../whitelabel.json'

	import { fly } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
    
    //Components
    import NavLogo from '../nav/NavLogo.svelte';
	import { Components, LeftSideFullPage}  from '../Router.svelte'
    const { InputBox } = Components;

    //Utils
    import { hashStringValue } from '../../js/utils.js'

    //DOM nodes
    let formObj, pwdObj;

    export let loaded;


    const handleSubmit = () => {
        if (formObj.checkValidity()){
            chrome.runtime.sendMessage({type: 'unlockWallet', data: hashStringValue(pwdObj.value)}, (unlocked) => {
                if (!unlocked || chrome.runtime.lastError) {
                    setValidity(pwdObj, "Incorrect Password")
                }
            })
        }
    }

    const setValidity = (node, message) => {
        node.setCustomValidity(message);
        node.reportValidity();
    }

    const refreshValidityKeyup = (e) => { 
        if (e.detail.keyCode !== 13) setValidity(pwdObj, '')
    }
</script>

<style>

.header{
    display: flex;
    flex-direction: row;
    position: absolute;
    left: 0%;
    right: 0%;
    top: 0%;
    bottom: 0%;
    right: 0;
    height: 97px;
    border-bottom: 1px solid var(--divider-light);
}

.heading{
    margin-bottom: 16px;
}

.text-box{
    margin-bottom: 16px;
}

.lockscreen{
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    width: 280px;
}

form{
    display: flex;
    flex-direction: column;
}

.input-box{
    margin-bottom: 14px;
}

.fullpage{
    display: flex;
    flex-direction: column;
    flex-grow: 1;
}
.btn{
    width: 100%;
}
</style>
<div class="fullpage">
    <div class="header text-primary">
        <NavLogo />
    </div>
    <LeftSideFullPage title={'Trouble signing in?'} helpLink={'/wallet/lock_unlock'}>
        <div class="text-primary flex flex-just-center" slot="content">
            <div class="lockscreen" in:fly="{{delay: 100, duration: 300, x: -200, y: 0, opacity: 0, easing: quintOut}}">
                <h6 class="heading">Sign In</h6>
                <div class="flow-text-box text-body1">  
                    Access your Lamden Vault.
                </div>
            
                <form on:submit|preventDefault={() => handleSubmit() } target="_self" bind:this={formObj}>
                    <div class="input-box">
                        <InputBox
                            id="pwd-input"
                            bind:thisInput={pwdObj}
                            on:changed={() => setValidity(pwdObj, '')}
                            on:keyup={refreshValidityKeyup}
                            width="100%"
                            height="56px"
                            label={"Password"}
                            inputType= 'password'
                            autofocus={true}
                            disabledPWShowBtn={false}
                            required={true}/>
                    </div>
                    <input  id="login-btn"
                            value="Login"
                            class="button__solid button__primary submit submit-button submit-button-text btn" 
                            type="submit" >
                </form>
            </div>
        </div>
    </LeftSideFullPage>
</div>