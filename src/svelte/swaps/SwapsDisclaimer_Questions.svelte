<script>
    import { onMount, getContext } from 'svelte';
    import { fade } from 'svelte/transition';

    //Stores
    import { steps, coinsDropDown, currentNetwork } from '../../js/stores/stores.js';

	//Components
	import { Components }  from '../Router.svelte'
    const { Button, DropDown } = Components;

    //Utils
    import ClearingHouse_API from '../../js/crypto/clearingHouseAPI'

    //Context
    const { changeStep, setAnswers } = getContext('functions');
    const { switchPage } = getContext('app_functions');

    let checked = false;

    onMount(() => {
        steps.set({
            currentStep: 1,
            stepList: [
                {number: 1, name: 'Disclaimers', desc: 'accept'},
                {number: 2, name: 'Lamden Account', desc: 'choose'},
                {number: 3, name: 'Connect MetaMask', desc: 'connect'},
                {number: 4, name: `Approve ${$currentNetwork.currencySymbol}`, desc: 'approve'},
                {number: 5, name: `Send ${$currentNetwork.currencySymbol}`, desc: 'send'},
                {number: 6, name: 'Get Lamden', desc: ''},
            ]
        });
    })

    const nextPage = () => {
        setAnswers([1,2,3])
        changeStep(1)
    }

</script>

<style>
.flow-content-right{
    max-width: 80%;
    align-items: flex-start;
    
}
ul{
    list-style-type: none
}
li {
    margin: 0 0 1rem;
    font-size: 13px;
}
.accepted{
    color: var(--font-success)
}
.not-accepted{
    color: var(--font-warning)
}
.chk-checkmark{
    top: -3px;
}
.chk-container{
    font-size: 15px;
}
</style>

<div class="flex-row flow-page" in:fade="{{delay: 0, duration: 200}}">
    <div class="flex-column flow-content-left">
        <h6>Accept Swap Disclaimer</h6>
    
        <div class="flow-text-box text-body1 text-primary">
            {`Please read and accept the swap disclaminer to begin the process.`}
        </div>

        <div class="flex-column flow-buttons">
            <Button id={'continue-btn'}
                    classes={'button__solid button__purple'}
                    styles={'margin-bottom: 16px;'}
                    width={'100%'}
                    name={"Accept Terms"}
                    disabled={!checked}
                    click={nextPage} />
            <Button id={'back-btn'}
                    classes={'button__solid'} 
                    styles={'margin-bottom: 16px;'}
                    width={'100%'}
                    name="Cancel" 
                    click={() => switchPage('Swaps')} />  
         </div>
    </div>
    <div class="flex-column flow-content-right" in:fade="{{delay: 0, duration: 200}}">
        <h3>
            By accessing this section of the website, you confirm that
        </h3>    
            <ul>
                <li><strong>(i)</strong> You currently own TAU Lamden token(s) for your own account.</li>
                <li><strong>(ii)</strong> You were neither a Swiss resident nor physically present in Switzerland at the time you purchased your Lamden TAU tokens nor are you at the time of the exchange of your TAU Lamden tokens a Swiss resident or physically present in Switzerland.</li>
                <li><strong>(iii)</strong> You are not residing nor are you physically present in any jurisdiction where participating in an exchange of tokens is not permitted or is subject to specific registration or licensing requirements.</li>
            </ul>
        
        <div class="checkbox-box">
            <label class="chk-container" id="chk-all" class:not-accepted={!checked} class:accepted={checked}>
                <input  type="checkbox" bind:checked={checked} >
                <span class="chk-checkmark"></span>
                I confirm that I have read the ablove statements and they are all true.
            </label>
        </div>
    </div>
</div>

