<script>
    import whitelabel from '../../../whitelabel.json'

    import { onMount, getContext } from 'svelte';
    import { fade } from 'svelte/transition';

    //Stores
    import { steps } from '../../js/stores/stores.js';

	//Components
	import { Components, LeftSideFullPage }  from '../Router.svelte'
    const { Button } = Components;

    //Context
    const { changeStep } = getContext('functions');
    const { switchPage } = getContext('app_functions');

    onMount(() => {
        steps.set({current:0, stepList:[]});
    });

</script>

<style>

a{
    margin-top: 10px;
}
h6{
    margin-top: 0;
    margin-bottom: 1.4rem;
    text-align: center;
    font-size: 20px;
    font-weight: 500;
}

</style>
<LeftSideFullPage title={whitelabel.firstRun_setup.intro.title} helpLink={whitelabel.firstRun_setup.intro.helpLink}>
    <div slot="body">
        <div class="text-body1 weight-400 desc">
            {whitelabel.firstRun_setup.intro.message}
        </div>
    </div>
    <div class="flex-row flow-page flex-just-center" in:fade="{{delay: 0, duration: 200}}" slot="content">
        <div class="flex-column">
            <h6 class="text-primary text-center">Get Started</h6>
            <div class="flex-column flow-buttons">
                <Button id="create-wallet"
                        classes={'button__solid button__primary'}
                        margin={'0 0 1rem 0'}
                        name="Create A Wallet" 
                        width={'347px'}
                        click={() => changeStep(1)} />
                <Button id="restore-wallet"
                        classes={'button__solid'}
                        margin={'0 0 1rem 0'}
                        name="Restore a Wallet" 
                        width={'347px'}
                        click={() => switchPage('FirstRunRestoreMain')} />
            </div>
        </div>
    </div>
</LeftSideFullPage>