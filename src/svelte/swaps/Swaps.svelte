<script> 
    import { getContext } from 'svelte';

    //Stores
    import { currentNetwork, NetworksStore } from '../../js/stores/stores.js';

    //Components
	import { Components }  from '../Router.svelte'
    const { Button, SwapsStatus } = Components;
    
    //Images
    import hero_bg from '../../img/backgrounds/hero_bg.png';
    import plus from '../../img/menu_icons/icon_plus.svg';

	//Context
    const { switchPage } = getContext('app_functions');

    const handleNetworkChange = () => {
        NetworksStore.setCurrentNetwork(NetworksStore.mainnetNetwork)
    }

</script>

<style>
.swaps{
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
.text-warning{
    margin-top: 1rem;
}
strong{
    color: var(--font-accent);
    font-weight: 400;
    cursor: pointer;
}
</style>

<div class="swaps text-primary">
	<div class="hero-rec" style="background-image: url({hero_bg});">
        <h2 class="heading">
            {`Swap your Ethereum ERC-20 TAU Tokens for Lamden Mainnet TAU`}
        </h2>
        
        <div class="subtext text-body1 text-opacity-1">
                {`
                    During this process you will send your Ethereum ERC-20 TAU tokens to an Ethereum Swap Contract and 
                    Lamden will send you the equivalent number of Lamden TAU Tokens on Lamden Mainnet.
                `}
        </div>
        {#if $currentNetwork.type !== 'mainnet' && $currentNetwork.lamden}
            <div class="subtext text-body1 text-warning" >
                The Token Swap process is only available on Lamden Mainnet. <br> 
                <strong on:click={handleNetworkChange}>Click here to change network.</strong>
            </div>
        {/if}
        
        <div class="buttons">
        	<Button
                id={'start-swap-btn'} 
                classes={'button__outlined button__overlay'}
				name="Start Swap"
                margin={'0 49px 0 0'}
		 		click={() => switchPage('SwapsMain')}
                icon={plus}
                disabled={$currentNetwork.type !== 'mainnet'}
                iconWidth={'19px'}
            />
        </div>
	</div>
    <SwapsStatus />
</div>
