<script>
    import { onMount, getContext } from 'svelte';

    //Stores
    import { steps } from '../../js/stores/stores.js';

	//Components
	import { Components }  from '../../js/router.js'
    const { Button } = Components;

    //Context
    const { changeStep } = getContext('functions');
    const { switchPage } = getContext('switchPage');

    onMount(() => {
        steps.set({current:0, stepList:[]});
    });

</script>

<style>
.page{
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    width: 498px;
    padding: 156px 24px 0 242px;
}

.text-box{
   height: 144px;
   margin-bottom: 20px;
}

a{
    margin-top: 10px;
    text-decoration: unset;
}

</style>

<div class="page">
    <h6 class="text-primary">Welcome!</h6>
    <div class="text-box text-body1 text-primary">
        Creating a wallet is easy and secure. It's stored in the user’s browser, not on remote servers.
    </div>
    <Button classes={'button__solid button__purple'}
            styles={'margin-bottom: 16px;'}
            name="Create A Wallet" 
            click={() => changeStep(1)} />
    <Button classes={'button__solid'} 
            styles={'margin-bottom: 16px;'}
            name="Restore a Wallet" 
            click={() => switchPage('FirstRunRestoreMain')} />
    <a  class="text-caption text-secondary" 
        href="https://www.lamden.io" 
        target="_blank" 
        rel="noopener noreferrer" >
        Learn More About Lamden
    </a>
</div>