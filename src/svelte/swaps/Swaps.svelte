<script> 
    import { getContext } from 'svelte';

    //Stores
    import { currentNetwork } from '../../js/stores/stores.js';

    //Components
	import { Components }  from '../Router.svelte'
    const { Button, SwapsStatus } = Components;
    
    //Images
    import squares_bg from '../../img/backgrounds/squares_bg.png';
    import plus from '../../img/menu_icons/icon_plus.svg';

	//Context
    const { switchPage } = getContext('app_functions');

</script>

<style>
.swaps{
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
    line-height: 1.4;
    /*color: var(--font-primary-dark)*/
}
</style>

<div class="swaps text-primary">
	<div class="hero-rec" style="background-image: url({squares_bg});">
        <h2 class="heading">
            {`Swap your Ethereum ${$currentNetwork.currencySymbol} Tokens for Lamden ${$currentNetwork.currencySymbol}`}
        </h2>
        
        <div class="subtext text-body1">
            {`
                During this process you will send your Ethereum ${$currentNetwork.currencySymbol} tokens to an Ethereum Swap Contract and 
                Lamden will send you the equivalent number of Lamden ${$currentNetwork.currencySymbol} Tokens on ${$currentNetwork.name}.
            `}
        </div>
        
        <div class="buttons">
        	<Button
                id={'start-swap-btn'} 
                classes={'button__transparent button__blue'}
				name="Start Swap"
                margin={'0 49px 0 0'}
		 		click={() => switchPage('SwapsMain')}
                icon={plus}
                iconWidth={'19px'}
            />
        </div>
	</div>
    <SwapsStatus />
</div>
