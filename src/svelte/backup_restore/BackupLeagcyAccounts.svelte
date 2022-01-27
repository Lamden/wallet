<script>
    import whitelabel from '../../../whitelabel.json'

    import { getContext } from 'svelte';
    import { fade } from 'svelte/transition';
    
    //Stores
    import { steps } from '../../js/stores/stores.js';

	//Components
	import { Components, LeftSideFullPage}  from '../Router.svelte'
    const { Button } = Components;

    //Context
    const { changeStep, setSelectedType} = getContext('functions');
    const { appHome } = getContext('app_functions');

    export let vaultExist = false;

</script>

<style>
    h6{
        margin-top: 0;
        margin-bottom: 1.4rem;
        text-align: center;
        font-size: 20px;
        font-weight: 500;
    }
</style>

<LeftSideFullPage title={`Backup Legacy Accounts`} helpLink={'/wallet/backup_overview'}>
    <div slot="body">
        <div class="text-body1 weight-400 desc">
            This process will allow you to either create an encrypted keystore or decrypt and 
            view your all of your secret keys.
            <div class="text-body1 layout-leftside-warning">Keeping backups safe is your responsibility.</div>
        </div>
    </div>
    <div class="flex-row flow-page flex-just-center" in:fade="{{delay: 0, duration: 200}}" slot="content">
        <div class="flex-column">
            <h6 class="text-primary text-center">Backup Legacy Accounts</h6>
            <div class="text-body1 text-primary font18">
                Description...
            </div>
            <div class="flex-column flow-buttons">
                <Button id={'create-btn'}
                    classes={'button__solid button__primary'}
                    margin="1.5rem 0 0 0"
                    name="Next" 
                    width={'347px'}
                    click={() => {
                        setSelectedType(2) 
                        changeStep(3)
                    }} />
                <Button
                    id={'home'} 
                    name="Back To Home"
                    width={'347px'}
                    margin={'1rem 0 0 0'}
                    classes={'button__solid button__secondary'}
                    click={() => appHome()}
                />
            </div>
        </div>
    </div>
</LeftSideFullPage>






