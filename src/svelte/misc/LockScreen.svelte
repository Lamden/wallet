<script>
    import { onMount } from 'svelte';

    //Components
    import NavLogo from '../nav/NavLogo.svelte';
	import { Components }  from '../../js/router.js'
    const { InputBox } = Components;
    

    //Stores
    import { loggedIn, HashStore, password } from '../../js/stores/stores.js';

    //Utils
    import { checkPassword } from '../../js/utils.js';
    
    //DOM nodes
    let formObj;

    let pwd = '';

    onMount(() => {
		//password.set('');
	});

    function handleSubmit(){
        if (formObj.checkValidity()){
            password.set(pwd);
            loggedIn.set(true);
        }
    }

    function validatePassword(e){
        let obj = e.detail;
        pwd = obj.value
        if (!HashStore.validatePassword(pwd)) {
            obj.setCustomValidity("Incorrect Password");
        } else {
            obj.setCustomValidity('');
        }
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

.page{
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

.submit-button {
    height: 36px;
}

.submit-button-text{
    font-weight: 500;
    font-size: 14px;
    line-height: 16px;
    display: flex;
    align-items: center;
    text-align: center;
    letter-spacing: 0.75px;
    text-transform: uppercase;
}
</style>

<div class="layout">
    <div class="header text-primary">
        <NavLogo />
    </div>
    <div class="content text-primary">
        <div class="page">
            <h6 class="heading">Sign In</h6>
            <div class="text-box text-body1">  
                Access your Lamden Wallet.
            </div>
        
            <form on:submit|preventDefault={() => handleSubmit() } target="_self" bind:this={formObj}>
                <div class="input-box">
                    <InputBox
                        width="100%"
                        label={"Password"}
                        intputType= 'password'
                        on:changed={validatePassword}
                        required={true}/>
                </div>
                <input  value="Save Password"
                        class="button__solid button__purple submit submit-button submit-button-text" 
                        type="submit" >
            </form>
        </div>
    </div>
</div>


