<script>
    import { getContext } from 'svelte';
    
    //Stores
    import { steps, currentNetwork } from '../../js/stores/stores.js';

	//Components
	import { Components }  from '../Router.svelte'
    const { Button } = Components;

    //Context
    const { changeStep } = getContext('functions');
    const { switchPage } = getContext('app_functions');

    const nextPage = () => {
        changeStep(2)
    }

</script>

<style>
.swaps-intro{
    flex-grow:1;
    padding-top: 156px;
}
.content-left{
    box-sizing: border-box;
    padding: 0px 24px 0 60px;
    width: 300px;
    justify-content: flex-start;
}
.content-right{
    align-items: center;
    justify-content: flex-start;
    flex-grow: 1;
}
.text-box{
    margin-bottom: 8px;
}

@media (min-width: 900px) {
    .content-left{
        padding: 0px 24px 0 242px;
        width: 498px;
    }
}

</style>

<div class="flex-row swaps-intro">
    <div class="flex-column content-left">
        <h6>Send Token Approval</h6>
    
        <div class="text-box text-body1 text-primary">
            {`In this step you send a transactions using MetaMask that will grant the Lamden Token Controller access to your Ethereum Tokens`}
        </div>

        <div class="buttons">
            <Button id={'continue-btn'}
                    classes={'button__solid button__purple'}
                    styles={'margin-bottom: 16px;'}
                    width={'100%'}
                    name="Continue" 
                    click={nextPage} />
            <Button id={'back-btn'}
                    classes={'button__solid'} 
                    styles={'margin-bottom: 16px;'}
                    width={'100%'}
                    name="Back" 
                    click={() => switchPage('Swaps')} />  
        </div>

        <a  class="text-caption text-secondary" 
            href="https://www.lamden.io" 
            target="_blank" 
            rel="noopener noreferrer" >
            Help & FAQ
        </a>
    </div>
    <div class="flex-column content-right">

    </div>
</div>






