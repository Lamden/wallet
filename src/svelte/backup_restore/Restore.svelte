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
    const { switchPage } = getContext('switchPage');

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
	height: 310px;
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
}

.subtext{
    max-width: 601px;
}


</style>

<div class="page text-primary">
	<div class="hero-rec" style="background-image: url({squares_bg});">
        <h5 class="heading">
            Restoring You Lamden Wallet is Quick & Easy
        </h5>
        <div class="subtext text-body2 text-primary-dark">
            It only taktes a few minutes, please have your original Keystore file ready,
            and be prepared to provide the password for it.
        </div>
        <div class="buttons">
        	<Button 
                classes={'button__transparent'}
				name="Restore Now"
				padding={'13px 16px'}
                margin={'0 49px 0 0'}
		 		click={() => switchPage('RestoreMain')} 
				icon='arrowRight'
                iconPosition='after'/>
        </div>
	</div>
</div>