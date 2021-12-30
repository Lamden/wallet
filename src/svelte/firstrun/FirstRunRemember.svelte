<script>

    import { getContext } from 'svelte';
    import { fade } from 'svelte/transition';


	//Components
	import { Components, LeftSideFullPage }  from '../Router.svelte'
    const { Button } = Components;

    //Context
    const { nextPage, back } = getContext('functions');
    const { switchPage } = getContext('app_functions');

    let remember = false;

</script>

<style>
    h6{
        margin-top: 0;
        margin-bottom: 1.4rem;
        text-align: center;
        font-size: 20px;
        font-weight: 500;
    }
    .desc{
        width: 338px;
        margin-bottom: 1.5rem;
    }
</style>
<LeftSideFullPage title={"Lamden Vault Security"} helpLink={""}>
    <div slot="body">
        <div class="text-body1 weight-400 desc">
            Storing your password, seed recovery phrase, and backing up your Lamden Vault is <strong class="text-warning">your responsibility</strong>. This is important to keeping your cryptocurrency safe.
        </div>
    </div>
    <div class="flex-row flow-page flex-just-center" in:fade="{{delay: 0, duration: 200}}" slot="content">
        <div class="flex-column flex-align-center">
            <h6 class="text-primary text-center">Remember</h6>
            <label class="chk-container text-body2 checkbox-text desc">
                I understand that it is my responsibility to keep my password and seed recovery phrase safe.
                <input type="checkbox" bind:checked={remember}>
                <span class="chk-checkmark mark"></span>
            </label>
            <div class="flex-column flow-buttons">
                <Button id="i-understand"
                        classes={'button__solid button__primary'}
                        margin={'0 0 1rem 0'}
                        name="I Understand" 
                        width={'347px'}
                        disabled={!remember}
                        click={() => nextPage()} />
                <Button id="back"
                        classes={'button__solid'}
                        margin={'0 0 .625rem 0'}
                        name="Back" 
                        width={'347px'}
                        click={() => back()} />
            </div>
        </div>
    </div>
</LeftSideFullPage>