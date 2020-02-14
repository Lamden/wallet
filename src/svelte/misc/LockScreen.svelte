<script>
    //Components
    import NavLogo from '../nav/NavLogo.svelte';
	import { Components }  from '../Router.svelte'
    const { InputBox } = Components;

    //DOM nodes
    let formObj, pwdObj;

    export let loaded;

    function handleSubmit(){
        if (formObj.checkValidity()){
            chrome.runtime.sendMessage({type: 'unlockWallet', data: pwdObj.value}, (walletIsLocked) => {
                console.log(walletIsLocked)
                if (walletIsLocked || chrome.runtime.lastError) {
                    setValidity(pwdObj, "Incorrect Password")
                }
            })
        }
    }

    function setValidity(node, message){
        node.setCustomValidity(message);
        node.reportValidity();
    }

    function refreshValidityKeyup(e){ 
        if (e.detail.keyCode !== 13) setValidity(pwdObj, '')
    }
</script>

<style>
.layout{
    display: flex;
    flex-direction: column;
}

.layout-padding{
    padding-left: 218px;
    padding-top: 140px;
}

.layout-width{
    width: 100%
}

.loading{
    display: flex;
    flex-direction: column;
    height: calc(100% - 97px);
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


<div class="layout" class:layout-padding={loaded} class:layout-width={!loaded}>
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
                        on:changed={() => setValidity(pwdObj, '')}
                        on:keyup={refreshValidityKeyup}
                        width="100%"
                        label={"Password"}
                        inputType= 'password'
                        autofocus={true}
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


