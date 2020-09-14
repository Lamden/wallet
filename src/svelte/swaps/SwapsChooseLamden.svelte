<script>
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
        changeStep(4)
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

        <div class="flex-column flow-buttons">
            <Button id={'continue-btn'}
                    classes={'button__solid button__purple'}
                    styles={'margin-bottom: 16px;'}
                    width={'100%'}
                    name={"Select Account"}
                    disabled={typeof selectedWallet === 'undefined'}
                    click={nextPage} />
            <Button id={'back-btn'}
                    classes={'button__solid'} 
                    styles={'margin-bottom: 16px;'}
                    width={'100%'}
                    name="Cancel" 
                    click={() => switchPage('Swaps')} />  

            <a  class="text-caption text-secondary" 
                href="https://docs.lamden.io/wallet/" 
                target="_blank" 
                rel="noopener noreferrer" >
                Help & FAQ
            </a>
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

