<script>
    //Components
    import NavLogo from '../nav/NavLogo.svelte';
	import { Components }  from '../Router.svelte'
    const { InputBox } = Components;
    
    //Stores
    import { loggedIn, CoinStore } from '../../js/stores/stores.js';
    
    //DOM nodes
    let formObj, pwdObj;

    function handleSubmit(){
        if (!CoinStore.validatePassword(pwdObj.value)) {
            pwdObj.setCustomValidity("Incorrect Password");
        } else {
            pwdObj.setCustomValidity('');
        }
        pwdObj.reportValidity()
        if (formObj.checkValidity()){
            CoinStore.setPwd(pwdObj.value);
        }
    }

    function refreshValidity(e){
        e.detail.target.setCustomValidity('');
    }

    function refreshValidityKeyup(e){ 
        if (e.detail.keyCode !== 13) pwdObj.setCustomValidity('');
    }
</script>

<style>
.layout{
    display: flex;
    flex-direction: column;
    padding-left: 218px;
    padding-top: 140px;
}

.content{
    flex-grow: 1;
}

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
    border-bottom: 1px solid #3D3D3D;
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
    padding: 16px 24px 0 24px;
}

form{
    display: flex;
    flex-direction: column;
}

.input-box{
    margin-bottom: 14px;
}
</style>

<div class="layout">
    <div class="header text-primary">
        <NavLogo />
    </div>
    <div class="content text-primary">
        <div class="lockscreen">
            <h6 class="heading">Sign In</h6>
            <div class="text-box text-body1">  
                Access your Lamden Wallet.
            </div>
        
            <form on:submit|preventDefault={() => handleSubmit() } target="_self" bind:this={formObj}>
                <div class="input-box">
                    <InputBox
                        id="pwd-input"
                        bind:thisInput={pwdObj}
                        on:changed={refreshValidity}
                        on:keyup={refreshValidityKeyup}
                        width="100%"
                        label={"Password"}
                        inputType= 'password'
                        required={true}/>
                </div>
                <input  id="login-btn"
                        value="Login"
                        class="button__solid button__purple submit submit-button submit-button-text" 
                        type="submit" >
            </form>
        </div>
    </div>
</div>


