<script>
    import { onMount, getContext } from 'svelte';

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
        steps.set({
            currentStep: 1,
            stepList: [
                {number: 1, name: 'Lamden Account', desc: ''},
                {number: 2, name: 'Connect MetaMask', desc: ''},
                {number: 3, name: `Ethereum ${$currentNetwork.currencySymbol} Approval`, desc: ''},
                {number: 4, name: 'Validate & Comfirm', desc: ''},
                {number: 5, name: 'Perform Swap', desc: ''},
            ]
        });
    })

    const handleSelectedWallet = (e) => {
        selectedWallet = e.detail.selected.value
    }

    const nextPage = () => {
        setLamdenWallet(selectedWallet)
        changeStep(1)
    }
    
</script>

<div class="flex-row swaps-intro">
    <div class="flex-column content-left">
        <h6>Choose Lamden Account</h6>
    
        <div class="text-box text-body1 text-primary">
            {`Pick the account we should send the Lamden ${currentNetwork.currencySymbol} to.`}
        </div>

        <div class="flex-column buttons">
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
                href="https://www.lamden.io" 
                target="_blank" 
                rel="noopener noreferrer" >
                Help & FAQ
            </a>
         </div>
    </div>
    <div class="flex-column content-right">
        <DropDown  
            items={$coinsDropDown} 
            id={'mycoins'} 
            label={'Lamden Account'}
            styles="margin-bottom: 19px;"
            required={true}
            on:selected={(e) => handleSelectedWallet(e)}
        />
    </div>
</div>

