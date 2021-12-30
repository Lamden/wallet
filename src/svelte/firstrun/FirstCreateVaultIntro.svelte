<script>    
    import { getContext } from 'svelte';
    //Components
	import { Components, LeftSideFullPage}  from '../Router.svelte'
    const { Button } = Components;

    //Context
    const { back, nextPage } = getContext('functions');
    const { switchPage } = getContext('app_functions');
</script>

<style>
h6{
    margin-bottom: 0.8rem;
    margin-top: 0;
    text-align: center;
    font-size: 20px;
    font-weight: 500;
}
.comment{
    width: 347px;
    margin-bottom: 1.5rem;
}
</style>
<LeftSideFullPage title={'Seed Recovery Phrase'} helpLink={''}>
    <div slot="body">
        <div class="text-body1 weight-400 desc">
            Your Seed Recovery Phrase makes it easy to back up and restore all your accounts.
            <div class="text-body1 layout-leftside-warning">Never disclose your Seed Recovery Phrase. These words can be used to steal all your accounts.</div>
        </div>
    </div>
    <div class="text-primary flex flex-just-center" slot="content">
        <div class="flex-column">
            <h6 class="text-primary text-center">Seed Recovery Phrase</h6>
            <div class="text-body1 comment">Vault accounts make it easier to backup and restore your accounts with our new seed recovery phrase. For vault accounts, your seed recovery phrase will save all your current and future accounts.</div>
            <div class="flex-column flow-buttons">
                <Button id="create-wallet"
                        classes={'button__solid button__primary'}
                        margin={'0 0 1.25rem 0'}
                        name="VIEW SEED RECOVER PHRASE" 
                        width={'347px'}
                        click={() => nextPage()} />
                <Button id="restore-wallet"
                        classes={'button__solid'}
                        margin={'0 0 1.25rem 0'}
                        name="Back" 
                        width={'347px'}
                        click={() => switchPage('CoinsMain')} />
            </div>
        </div>
    </div>
</LeftSideFullPage>