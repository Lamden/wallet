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

<LeftSideFullPage title={`Restore Lamden Vault`} helpLink={'/wallet/backup_overview'}>
    <div slot="body">
        <div class="text-body1 weight-400 desc">
            This process will allow you to restore your Valut Accounts and Legacy Accounts accounts.
        </div>
    </div>
    <div class="flex-row flow-page flex-just-center" in:fade="{{delay: 0, duration: 200}}" slot="content">
        <div class="flex-column">
            <h6 class="text-primary text-center">Restore Lamden Vault</h6>
            <div class="flex-column flow-buttons">
                <Button id={'restore-seed-btn'}
                        classes={'button__solid button__primary'}
                        margin="0 0 1rem"
                        name="Restore from Recovery Phrase" 
                        width={'347px'}
                        click={() => {
                            setSelectedType(1)
                            changeStep(9)
                        }} />
                <Button id={'restore-legacy-btn'}
                        classes={'button__solid'} 
                        margin="0 0 1rem"
                        name="Restore Legacy Accounts" 
                        width={'347px'}
                        click={() => {
                            setSelectedType(2)
                            changeStep(1)
                        }} />
                <Button id={'restore-private-btn'}
                        classes={'button__solid'} 
                        margin="0 0 1rem"
                        width={'347px'}
                        name="Restore With Private Key" 
                        click={() => {
                        setSelectedType(3)
                        changeStep(8)}} />  
                <Button id={'back-btn'}
                    classes={'button__solid'} 
                    margin="0 0 1rem"
                    width={'347px'}
                    name="Back" 
                    click={() => changeStep(0)} />  
            </div>
        </div>
    </div>
</LeftSideFullPage>






