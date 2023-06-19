<script>
    import { getContext, onDestroy, onMount} from 'svelte';
	//Components
    import { Components, LeftSideFullPage }  from '../Router.svelte'
    import NavLogo from '../nav/NavLogo.svelte';
    import { fade } from 'svelte/transition';

    //Stores
	import { SettingsStore } from '../../js/stores/stores.js';

    //Utils
    import { hashStringValue } from '../../js/utils.js'

    //Context
    const { switchPage, appHome} = getContext('app_functions');

    const { Button, InputBox } = Components;

    let oldPwd;

    let password;
    let vaultExist = false;
    let step = 1;
    let repairSuccess = false;

    onMount(() => {
		chrome.runtime.sendMessage({type: 'isVaultCreated'}, (ok) => {
			vaultExist = ok;
		})
	});


    onDestroy(()=> password = "")

    const repair = () => {
        chrome.runtime.sendMessage({
            type: "repairVault",
            data: hashStringValue(oldPwd.value),
        }, (success) => {
            if (!success || chrome.runtime.lastError) {
                repairSuccess = false
            } else {
                repairSuccess = true
            }
            step = 2
        });
    }
    
</script>

<style>
.layout{
    display: flex;
    flex-direction: column;
    flex-grow: 1;
}

.content{
    flex-grow: 1;
    display: flex;
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
.alignc {
    align-items: center;
}
</style>

<div class="layout">
    <div class="header">
        <NavLogo />
    </div>
    <div class="content">
        <LeftSideFullPage title={`Repair Vault`}>
        <div slot="body">
            <div class="text-body1 weight-400 desc">
                This process will allow you to repair your vault if you have changed your password in version 2.5.0
            </div>
        </div>
        <div class="flex-row flow-page flex-just-center" in:fade="{{delay: 0, duration: 200}}" slot="content">
            <div class="flex-column">
                {#if step === 1} 
                <h6 class="text-primary text-center">Repair Vault</h6>
                <div class="flex-column flow-buttons">
                    {#if vaultExist}
                    <InputBox 
                        id="oldPwd"
                        bind:thisInput={oldPwd}
                        label={"Old Password"}
                        placeholder={"The password you previously used"}
                        inputType={'password'}
                        width={"347px"}
                        height={"56px"}
                        margin="0 0 0.5rem 0"
                        disabledPWShowBtn={false}
                        required={true}/>
                    <Button id={'confirm-btn'}
                        classes={'button__solid button__primary'}
                        margin="1rem 0 1rem"
                        name="Repair" 
                        width={'347px'}
                        click={repair} />
                    {:else}
                    <div class="flow-text-box text-body1">Valut not exists</div>
                    <Button id={'back-btn'}
                        classes={'button__solid button__primary'}
                        margin="1rem 0 1rem"
                        name="Home" 
                        width={'347px'}
                        click={appHome} />
                    {/if}
                </div>
                {:else}
                <div class="flex-column flow-buttons alignc">
                    {#if repairSuccess}
                    
                        <h3 class="flow-text-box text-body1 text-green">  Your vault has been successfully repaired!</h3>
                        <Button id={'home-btn'}
                            classes={'button__solid button__primary'}
                            margin="1rem 0 1rem"
                            name="Home" 
                            width={'347px'}
                            click={appHome} />
                    {:else}
                        <h3 class="flow-text-box text-body1 text-error"> Repair vault failed. Please try again or contact the developer</h3>
                        <Button id={'back-btn'}
                            classes={'button__solid button__primary'}
                            margin="1rem 0 1rem"
                            name="Back" 
                            width={'347px'}
                            click={() => { step = 1}} />
                        <Button id={'home-btn'}
                            classes={'button__solid button__primary'}
                            margin="1rem 0 1rem"
                            name="Home" 
                            width={'347px'}
                            click={appHome} />
                    {/if}
                </div>
                {/if} 
            </div>

        </div>

        </LeftSideFullPage>
    </div>
</div>

