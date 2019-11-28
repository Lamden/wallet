<script> 
    import { onMount, getContext } from 'svelte';

    //Stores
    import { breadcrumbs } from '../../js/stores/stores.js';

    //Components
	import { Components }  from '../../js/router.js'
	const { Button } = Components;
	import { backgrounds } from '../../js/images.js';
	const { squares_bg } = backgrounds;

	//Context
    const { switchPage } = getContext('app_functions');

	onMount(() => {
        breadcrumbs.set([{name: 'Restore Wallet', page: {name: ''}}]);
    });

</script>

<style>
.page{
	display: flex;
	flex-direction: column;
}

.hero-rec{
    display: flex;
    flex-direction: column;
	box-sizing: border-box;
	min-height: 310px;
	border-radius: 4px;
	margin-bottom: 18px;
    padding: 40px;
    background-size: cover;
    background-repeat: no-repeat;
}

.buttons{
    display: flex;
    flex-direction: row;
    align-items: flex-end;
    flex-grow: 1;
    margin-top: 4rem;
}

.subtext{
    max-width: 601px;
}


</style>

<div class="page text-primary">
	<div class="hero-rec" style="background-image: url({squares_bg});">
        <h5 class="heading">
            Backing Up Your Lamden Wallet is Very Important
        </h5>
        <div class="subtext text-body2 text-primary-dark">
            All of the information for your keys is stored in this browser. 
            We highly recommend creating a KeyStore file so that you can recover 
            your wallet if anythign happens to this computer.
        </div>
        <div class="buttons">
        	<Button 
                classes={'button__transparent'}
				name="Create Keystore"
                margin={'0 49px 0 0'}
		 		click={() => switchPage('BackupMain')} 
				icon='arrowRight'
                iconPosition='after'/>
        </div>
	</div>
</div>