<script>

    import { getContext } from 'svelte';
    import { fade } from 'svelte/transition';


	//Components
	import { Components, LeftSideFullPage }  from '../Router.svelte'
    const { Button } = Components;

    //Context
    const { changeStep, back } = getContext('functions');
    const { switchPage } = getContext('app_functions');

    let remember = false;

</script>

<style>
    .desc{
        width: 338px;
        margin-bottom: 1.5rem;
        margin-top: 1.5rem;
    }
    .wrap{
        width: 347px;
    }
    .font18{
        font-size: 18px;
    }
</style>
<LeftSideFullPage title={"Remember"} helpLink={""}>
    <div slot="body">
        <div class="text-body1 weight-400 desc">
            Enter a new Recovery Phrase for your Lamden Vault. 
            <div class="text-body1 layout-leftside-warning">Caution, if a different Recovery Phrase is used this will delete all your current Lamden Vault accounts.</div>
        </div>
    </div>
    <div class="flex-row flow-page flex-just-center" in:fade="{{delay: 0, duration: 200}}" slot="content">
        <div class="flex-column flex-align-center wrap">
            <h6 class="text-primary text-center">Remember</h6>
            <div class="text-body1 font18">If you restore using another Secret Recovery Phrase, your current Lamden Vault, accounts and assets will be removed from this app permanently. This action cannot be undone.<div>
            <label class="chk-container text-body1 checkbox-text desc">
                I Understand
                <input type="checkbox" bind:checked={remember}>
                <span class="chk-checkmark mark"></span>
            </label>
            <div class="flex-column flow-buttons">
                <Button id="create-wallet"
                        classes={'button__solid button__primary'}
                        margin={'0 0 1rem 0'}
                        name="I Understand" 
                        width={'347px'}
                        disabled={!remember}
                        click={() => changeStep(10)} />
                <Button id="restore-wallet"
                        classes={'button__solid'}
                        margin={'0 0 1rem 0'}
                        name="Back" 
                        width={'347px'}
                        click={() => back()} />
            </div>
        </div>
    </div>
</LeftSideFullPage>