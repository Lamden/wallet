<script>
    import { getContext } from 'svelte';
    
    //Stores
    import { steps } from '../../js/stores/stores.js';

	//Components
	import { Components }  from '../Router.svelte'
    const { Button } = Components;

    //Context
    const { changeStep } = getContext('functions');
    const { appHome } = getContext('app_functions');

</script>

<style>
.backup-intro{
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    width: 498px;
    padding: 50px 24px 0 242px;
}

.text-box{
    margin-bottom: 8px;
}

.text-box2{
    color: cyan;
    margin-bottom: 60px;
}

a{
    text-decoration: unset;
}
</style>

<div class="backup-intro">
    <h6>Backup Lamden Wallet</h6>
    
    <div class="text-box text-body1 text-primary">
        This process will allow you to either create an encrypted keystore or decrypt and 
        view your all of your secret keys.
    </div>

    <div class="text-box2 text-body1">
        Keeping backups safe is your responsibility. 
    </div>

    <div class="buttons">
        <Button id={'create-btn'}
                classes={'button__solid button__purple'}
                styles={'margin-bottom: 16px;'}
                width={'100%'}
                name="Create Backup File" 
                click={() => changeStep(3)} />
        <Button id={'view-keys-btn'}
                classes={'button__solid'} 
                styles={'margin-bottom: 16px;'}
                width={'100%'}
                name="View Account Keys" 
                click={() => changeStep(2)} />
        <Button id={'back-btn'}
                classes={'button__solid'} 
                styles={'margin-bottom: 16px;'}
                width={'100%'}
                name="Back" 
                click={() => appHome()} />  
    </div>


    <a  class="text-caption text-secondary" 
        href="https://www.lamden.io" 
        target="_blank" 
        rel="noopener noreferrer" >
        Help & FAQ
    </a>
</div>






