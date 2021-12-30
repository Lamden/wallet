<script>
    import { setContext, getContext } from 'svelte'; 

    import ChangePasswordFinish from './ChangePasswordFinish.svelte';

    import { LeftSideFullPage } from '../Router.svelte'

    //Components
	import { Components, Pages }  from '../Router.svelte'
    import NavLogo from '../nav/NavLogo.svelte';
    const { Button, InputBox, StrongPW } = Components;
    
    //DOM Nodes
    let formField, pwdInput1, pwdInput2, pwdInput3, hintObj;

    //Context
    const { switchPage } = getContext('app_functions');

    //Utils
    import { hashStringValue } from '../../js/utils.js'

    let pwd = '';
    let currentStep = 1;
    let showStrongpd = false;
    let pattern = `(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\|,.<>\\/? ]).{10,}`;

    setContext('changepw_functions', {
        next: () => next(),
		done: () => chrome.runtime.sendMessage({type: 'lockWallet'})
	});

    const next = () => {
        currentStep = currentStep + 1
    }

	const pwd1Validity = () => {
        pwdInput1.setCustomValidity("")
		pwdInput1.checkValidity()
		pwdInput1.reportValidity()
	}
	
	const pwd2Validity = () => {
		pwdInput2.checkValidity()
		pwdInput2.reportValidity()
    }

    const pwd3Validity = () => {
		pwdInput3.checkValidity()
		pwdInput3.reportValidity()
    }

    const strongPasswordUpdate = () => {
        showStrongpd = true;
        pwd = pwdInput2.value;
    }

    const confirmPasswprdCheck = () => {
        if (pwdInput2.value === pwdInput3.value){
            pwdInput3.setCustomValidity("");
        } else {
            pwdInput3.setCustomValidity("Passwords do not match");
            pwdInput3.reportValidity()
        }
    }

    const handleSubmit = () => {
        if (formField.checkValidity()){
            let oldpd = hashStringValue(pwdInput1.value)
            let newpd = hashStringValue(pwdInput2.value)
            chrome.runtime.sendMessage({type: 'changePassword', data: {newpd, oldpd} }, (success) => {
                if (!success || chrome.runtime.lastError) {
                    setValidity(pwdInput1, "Incorrect Password")
                    return
                }
                next()
            })
        }
    }

    const setValidity = (node, message) => {
        node.setCustomValidity(message);
        node.reportValidity();
    }

</script>

<style>
    .submit-btn{
        width: 347px;
        margin: 0 0 1rem 0;
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
</style>
<div class="header">
    <NavLogo />
</div>
<div class="flex-column">
    {#if currentStep === 1}
        <LeftSideFullPage title={"Password Safety"}>
            <div slot="body">
                <div class="text-body1 weight-400 desc">
                    For maximun security we suggest creating a complex password and storing it in a password manager such as <a class="text-link weight-700 link" href="https://www.lastpass.com/" target="_blank">LastPass</a>. 
                </div>
                <div class="text-body1 text-warning warning weight-400">Lamden is not responsible for lost or stolen passwords.</div>
            </div>
        <div slot="content">
            <h6>Change Password</h6>
            <form id="change-pd-form" class="inputs" on:submit|preventDefault={() => handleSubmit() } bind:this={formField} target="_self">
                <InputBox
                    id={'pwd1-input'} 
                    label={"Confirm Current Password"}
                    placeholder={"At least 10 symbols"}
                    bind:thisInput={pwdInput1}
                    on:changed={() => pwd1Validity()}
                    inputType={"password"}
                    width={"347px"}
                    height={"56px"}
                    margin="0 0 0.5rem 0"
                    disabledPWShowBtn={false}
                    required={true}/>
                <InputBox
                    id={'pwd2-input'}
                    label={"New Password"}
                    placeholder={"At least 10 symbols"}
                    bind:thisInput={pwdInput2}
                    on:changed={() => pwd2Validity()}
                    on:keyup={() => strongPasswordUpdate()}
                    inputType={"password"}
                    {pattern}
                    required={true}
                    width={"347px"}
                    height={"56px"}
                    margin="0 0 0.5rem 0"
                    disabledPWShowBtn={false}
                    autofocus={true}/>
                {#if showStrongpd}
                    <StrongPW password={pwd} charLength={15}/>
                {/if}
                <InputBox
                    id={'pwd3-input'}
                    label={"Confirm New Password"}
                    placeholder={"At least 10 symbols"}
                    bind:thisInput={pwdInput3}
                    on:changed={() => pwd3Validity()}
                    on:keyup={() => confirmPasswprdCheck()}
                    inputType={"password"}
                    required={true}
                    width={"347px"}
                    height={"56px"}
                    margin="0 0 1.5rem 0"
                    disabledPWShowBtn={false}
                    autofocus={true}/>
                <input  
                    id={'change-pw-btn'}
                    form="change-pd-form"
                    value="CHANGE PASSWORD"
                    class="button__solid button__primary submit submit-button submit-button-text submit-btn" 
                    type="submit" > 
                <Button
                    id={'back-btn'} 
                    width={'347px'}
                    margin={'0 0 .625rem 0'}
                    classes={'button__solid button__secondary'}
                    name={"BACK"}
                    click={ () => {switchPage("Settings")}}
                />
            </form>
        </div>
    </LeftSideFullPage>
    {/if}
    {#if currentStep === 2}
        <ChangePasswordFinish />
    {/if}
</div>