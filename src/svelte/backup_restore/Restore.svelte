<script> 
    import whitelabel from '../../../whitelabel.json'

    import { getContext } from 'svelte';

    //Components
	import { Components }  from '../Router.svelte'
    const { Button } = Components;
    
    //Images
    import hero_bg from '../../img/backgrounds/hero_bg.png';

    //Icons 
    import DirectionalArrowIcon from '../icons/DirectionalArrowIcon.svelte'

	//Context
    const { switchPage } = getContext('app_functions');

</script>

<style>
.restore{
	display: flex;
	flex-direction: column;
}

.hero-rec{
	min-height: 310px;
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
    line-height: 1.4;
}


</style>

<div class="restore text-primary">
	<div class="hero-rec" style="background-image: url({hero_bg});">
        <h2 class="heading">
            Restoring Accounts to Your {whitelabel.companyName} Wallet is Quick & Easy
        </h2>
        <div class="subtext text-body1 text-opacity-1">
            It only takes a few minutes, so please have your original keystore file ready, and be prepared to provide the password for it.
        </div>
        <div class="buttons">
            <Button
                id={'restore-btn'} 
                classes={'button__outlined button__overlay'}
                name="Restore Now"
                click={() => switchPage('RestoreMain')}
            >
                <div slot="icon-after">
                    <DirectionalArrowIcon width="12px" direction="right" color="var(--color-white)" />
                </div>
            </Button> 
        </div>
	</div>
</div>