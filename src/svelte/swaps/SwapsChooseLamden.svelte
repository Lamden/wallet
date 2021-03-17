<script>
    import whitelabel from '../../../whitelabel.json'
    
    import { onMount, getContext } from 'svelte';
    import { fade } from 'svelte/transition';

    //Stores
    import { steps, coinsDropDown, currentNetwork } from '../../js/stores/stores.js';

	//Components
	import { Components }  from '../Router.svelte'
    const { Button, DropDown } = Components;

    //Context
    const { changeStep, setLamdenWallet } = getContext('functions');
    const { switchPage } = getContext('app_functions');

    let selectedWallet;

    onMount(() => {
        steps.update(stepsStore => {
            stepsStore.currentStep = 2;
            return stepsStore
        })
    })

    const handleSelectedWallet = (e) => {
        selectedWallet = e.detail.selected.value
    }

    const nextPage = () => {
        setLamdenWallet(selectedWallet)
        changeStep(5)
    }

    const gotoRecover = () => {
        changeStep(3) 
    }
    
</script>

<style>
.flow-content-right{
    max-width: 80%;
    align-items: flex-start;
}
</style>

<div id="swap_chooseLamden" class="flex-row flow-page" in:fade="{{delay: 0, duration: 200}}">
    <div class="flex-column flow-content-left">
        <h6>Choose Lamden Account</h6>
    
        <div class="flow-text-box text-body1 text-primary">
            {`Pick the Account we should send the Lamden ${currentNetwork.currencySymbol} to.`}
        </div>

        <div class="flow-text-box text-body1 text-primary text-accent">
            {`Have a failed swap? Click the RECOVER FAILED SWAP button to restart it.`}
        </div>

        <div class="flex-column flow-buttons">
            <Button id={'continue-btn'}
                    classes={'button__solid button__primary'}
                    styles={'margin-bottom: 16px;'}
                    width={'100%'}
                    name={"Select Account"}
                    disabled={typeof selectedWallet === 'undefined'}
                    click={nextPage} />
                        <div class="flow-text-box text-body1 text-primary text-accent">
            {`Click `}
        </div>
            <Button id={'continue-btn'}
                    classes={'button__solid button__primary'}
                    styles={'margin-bottom: 16px;'}
                    width={'100%'}
                    name={"RECOVER FAILED SWAP"}
                    click={gotoRecover} />
            <Button id={'back-btn'}
                    classes={'button__solid'} 
                    styles={'margin-bottom: 16px;'}
                    width={'100%'}
                    name="Cancel" 
                    click={() => switchPage('Swaps')} />  

            {#if whitelabel.helpLinks.show}
                <a  class="text-link text-caption text-secondary" 
                    href={whitelabel.helpLinks.masterURL || "https://docs.lamden.io/docs/wallet/token_swap"}
                    target="_blank" 
                    rel="noopener noreferrer" >
                    Help & FAQ
                </a>
            {/if} 
         </div>
    </div>
    <div class="flex-column flow-content-right" in:fade="{{delay: 0, duration: 200}}">
        <DropDown  
            items={$coinsDropDown} 
            id={'mycoins'} 
            label={'Lamden Account'}
            margin="0 0 1rem 0"
            maxWidth="550px"
            required={true}
            on:selected={handleSelectedWallet}
        />
    </div>
</div>

