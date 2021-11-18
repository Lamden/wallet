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
    .warning{
        margin-top: 1.5rem;
        line-height: 24px;
    }
    .desc{
        line-height: 24px;
    }
    .link{
        color: var(--font-accent);
    }
    a:active{
        text-decoration: underline;
    }
    h6{
        margin-bottom: 5rem;
    }
</style>
<div class="header">
    <NavLogo />
</div>
<div class="flex-column">
    <LeftSideFullPage title={"Password Safety"}>
        <div slot="body">
            <div class="text-body1 weight-400 desc">
                For maximun security we suggest creating a complex password and storing it in a password manager such as <a class="text-link weight-700 link" href="https://www.lastpass.com/" target="_blank">LastPass</a>. 
            </div>
            <div class="text-body1 text-warning warning weight-400">Lamden is not responsible for lost or stolen passwords.</div>
        </div>
    </LeftSideFullPage>
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