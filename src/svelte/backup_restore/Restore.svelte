<script> 
    import { getContext } from 'svelte';

    //Components
	import { Components }  from '../Router.svelte'
    const { Button } = Components;
    
    //Images
    import squares_bg from '../../img/backgrounds/squares_bg.png';
    import arrowRight from '../../img/menu_icons/icon_arrow-right.svg';

	//Context
    const { switchPage } = getContext('app_functions');

</script>

<style>
.restore{
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

<div class="restore text-primary">
	<div class="hero-rec" style="background-image: url({squares_bg});">
        <h2 class="heading">
            Restoring Accounts to Your Lamden Wallet is Quick & Easy
        </h2>
        <div class="subtext text-body2 text-primary-dark">
            It only takes a few minutes, please have your original Keystore file ready,
            and be prepared to provide the password for it.
        </div>
        <div class="buttons">
        	<Button
                id={'restore-btn'} 
                classes={'button__transparent button__blue'}
				name="Restore Now"
                margin={'0 49px 0 0'}
		 		click={() => switchPage('RestoreMain')} 
				icon={arrowRight}
                iconPosition='after'/>
        </div>
	</div>
</div>