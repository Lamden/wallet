<script>
    import { getContext } from 'svelte';

    //Stores
    import { steps, currentNetwork } from '../../js/stores/stores.js';

	//Components
	import { Components }  from '../Router.svelte'
    const { Button } = Components;

    //Images
    import flag from '../../img/menu_icons/icon_flag.svg'

    //Context
    const { changeStep } = getContext('functions');
    const { switchPage } = getContext('app_functions');


</script>

<style>
.flag{
    width: 20vw;
}
</style>

<div class="flex-row swaps-intro">
    <div class="flex-column content-left">
        <h6>Swap Finished!</h6>
    
        <div class="text-box text-body1 text-primary">
            {`Go back to the main page and refresh your balances to see your Lamden Tokens.`}
        </div>
        <div class="flex-column buttons">
            <Button id={'complete-btn'}
                    classes={'button__solid button__green'}
                    styles={'margin-bottom: 16px;'}
                    width={'100%'}
                    name="Complete" 
                    click={switchPage('CoinsMain')} />
         </div>
    </div>
    <div class="flex-column content-right">
        <div class="flex-column sent-message">
            <div class="flag">{@html flag}</div>
        </div>
    </div>
</div>

