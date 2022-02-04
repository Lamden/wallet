<script>
    import { getContext } from 'svelte';

	//Components
	import { Components }  from '../Router.svelte'
    const { Button } = Components;

    //Context
    const { switchPage, openModal } = getContext('app_functions');
</script>

<style>
.buttons{
    display: flex;
    justify-content: flex-start;
    margin-top: 1rem;
}
.comment{
    margin-top: 1.3rem;
}
</style>

<div id="coin-empty">
    <div class="text-body1 comment">
        Our new Vault accounts are all backed up under one Recovery Phrase!
    </div>
    <div class="buttons">
        <Button 
                id={"empty-add-btn"}
                classes={'button__solid button__primary'}
                styles={'margin-right: 23px;'}
                width={'232px'}
                name="Create Vault" 
                click={() => switchPage('FirstCreateVault')} />
        <Button 
                id={"empty-restore-btn"}
                classes={'button__solid'} 
                width={'232px'}
                name="Learn More" 
                click={() => window.open('https://docs.lamden.io/docs/wallet/overview', '_blank')} />
    </div>
</div>