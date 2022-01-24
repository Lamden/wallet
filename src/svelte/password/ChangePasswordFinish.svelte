<script>
    import { getContext } from 'svelte'; 

    import { LeftSideFullPage } from '../Router.svelte'

    //Components
	import { Components }  from '../Router.svelte'
    import NavLogo from '../nav/NavLogo.svelte';
    const { Button, InputBox, StrongPW } = Components;
    
    //DOM Nodes
    let formField, pwdInput1, pwdInput2, pwdInput3, hintObj;

    //Context
    const { done } = getContext('changepw_functions');
</script>

<style>
    h6{
        margin-top: 0;
        margin-bottom: 1.4rem;
        text-align: center;
        font-size: 20px;
        font-weight: 500;
        margin-bottom: 5rem;
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
        border-bottom: 1px solid var(--divider-light);
    }
    .desc{
        line-height: 24px;
    }
</style>
<div class="header">
    <NavLogo />
</div>
    <LeftSideFullPage title={"Password Safety"} helpLink="/wallet/settings_changepassword">
        <div slot="body">
            <div class="text-body1 weight-400 desc">
                You've successfully changed your Lamden Vault password! The next time you sign in, you’ll be asked for your new password.
            </div>
        </div>
    <div slot="content">
        <h6 class="text-green">Password Changed!</h6>
        <Button
            id={'change-done-btn'} 
            width={'347px'}
            margin={'0 0 .625rem 0'}
            classes={'button__solid button__primary'}
            name={"DONE"}
            click={done}
        />
    </div>
</LeftSideFullPage>