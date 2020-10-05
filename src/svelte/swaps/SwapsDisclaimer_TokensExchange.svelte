<script>
    import { onMount, getContext } from 'svelte';
    import { fade } from 'svelte/transition';

    //Stores
    import { steps, coinsDropDown, currentNetwork } from '../../js/stores/stores.js';

	//Components
	import { Components }  from '../Router.svelte'
    const { Button, DropDown, InputBox } = Components;

    //Context
    const { changeStep, setLamdenWallet } = getContext('functions');
    const { switchPage } = getContext('app_functions');

    let notScrolled = true;
    let read_and_confirmed = false;
    let inputElm;

    const legalText = `TOKENS EXCHANGE invitation to present an offer for exchange  

IMPORTANT INFORMATION  
This invitation to present an offer for exchange is strictly restricted to current holders of Lamden TAU ERC-20. The information contained herein, as well as the exchange of tokens as such, are not intended for, and must not be accessed by, persons resident or physically present in any jurisdiction where participating in an exchange of tokens is not permitted or is subject to specific registration or licensing requirements. Nothing in this website/app shall be understood as constituting an offer to sell, a solicitation of an offer to buy, or a recommendation in respect of any security. Please read carefully the exchange terms and conditions before offering your Lamden TAU ERC-20 for exchange.  

FROM THE LAMDEN TAU ERC-20 TO THE LAMDEN TAU MAINNET 

Lamden Sàrl, a limited liability company incorporated under the laws of Switzerland, issued tokens called Lamden TAU ERC-20 (based on ERC-20 technology). 

The purpose of this token distributing event was to raise funds in order to finance the development of the Lamden Platform.  

The Lamden Platform that has been developed since then allows users to build blockchain applications easily with the Python programming language. Blockchain applications are in the form of small programs called ‘smart contracts’ and are deployed directly to the Lamden Platform. 

In its White Paper dated September 4th, 2017, Lamden has undertaken to make Lamden TAU ERC-20 available for exchange on the Lamden chain upon achievement of the Lamden Platform.  

The Python-native modular blockchain, a complete new blockchain technology, is now available for use. For that purpose, Lamden has developed a new generation of utility tokens, the Lamden TAU Mainnet, which are based on the new blockchain technology that was developed. These new tokens grant the community access to the tools and the technology provided by the Lamden Platform.  

The Lamden Platform is only accessible to the community of token holders who have converted their existing Lamden TAU ERC-20 into Lamden TAU Mainnet. Indeed, Lamden TAU ERC-20 remain of no use if they are not exchanged for Lamden TAU Mainnet, as they do not provide any access to the Platform.  

Therefore, as a holder of Lamden TAU ERC-20, you are entitled to apply to Lamden Sàrl for converting your tokens into Lamden TAU Mainnet.  

The exchange ratio is 1:1.  

The Lamden TAU Mainnet which you will receive in exchange of your Lamden TAU ERC-20 will exclusively serve the purpose of accessing and using the Lamden Platform, which is fully decentralized and is hosted by a community of members. Lamden does not and will not provide any services to you through the Platform, as the latter will be operated by the community of TAU Mainnet holders, on a decentralized basis. 

For more information on the Lamden Platform, visit www.lamden.io. 

In order to initiate the exchange process, you might be required to access our application from this website/app. Before processing the exchange by way of our application, you will be asked to agree with the Exchange Terms and Conditions.  

Your agreement with the Exchange Terms and Conditions and the tender of your Lamden TAU ERC-20 for exchange will formalize your offer, which will be binding on you. Your offer will be considered accepted if Lamden Sàrl sends the Lamden TAU Mainnet to you in exchange of your Lamden TAU ERC-20. Lamden Sàrl remains free to reject your exchange offer, in the event it considers that the Exchange Terms and Conditions are not met or for any technical reason. 

Once you will be in possession of your Lamden TAU Mainnet, your Lamden TAU ERC-20 will be irrevocably cancelled and the exchange will be definitively completed. 

We invite you to request the exchange of your Lamden TAU ERC-20 to Lamden Sàrl, by clicking ‘Accept & Proceed’ button.  
`
    onMount(() => {
        if (inputElm.scrollHeight - inputElm.scrollTop < inputElm.clientHeight / 0.90 ) notScrolled = false
    })
    const nextPage = () => changeStep(2)

    const handleScroll = (e) => {
        if (inputElm.scrollHeight - inputElm.scrollTop < inputElm.clientHeight / 0.90 ) notScrolled = false
    }

    
</script>

<style>
h3{
    margin: 0 0 1rem;
}
.flow-content-right{
    max-width: 80%;
    align-items: flex-start;
    
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

<div id="swap_exchangeOffer" class="flex-row flow-page" in:fade="{{delay: 0, duration: 200}}">
    <div class="flex-column flow-content-left">
        <h6>Offer for Exchange</h6>
    
        <p class="flow-text-box text-body1 text-primary">
            Please read and <strong class="text-cyan">scroll text all the way to the bottom</strong>, check the box to accept terms and click the button to proceed.
        </p>

        <div class="flex-column flow-buttons">
            <Button id={'proceed-btn'}
                    classes={'button__solid button__purple'}
                    styles={'margin-bottom: 16px;'}
                    width={'100%'}
                    name={"Accept & Proceed"}
                    disabled={!read_and_confirmed}
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
        <h3>TOKENS EXCHANGE - Invitation to present an offer for exchange</h3> 
        <InputBox
            id="exchange_offer"
            inputType="textarea"
            bind:thisInput={inputElm}
            value={legalText}
            margin="-1rem 0 2rem"
            rows="19"
            on:scroll={handleScroll}
            on:mouseup={handleScroll}
            readonly={true}
        />
        <div class="checkbox-box">
            <label  class="chk-container" 
                    id="accept-offer-chk" 
                    class:text-primary-dark={notScrolled} 
                    class:not-accepted={!read_and_confirmed && !notScrolled} 
                    class:accepted={read_and_confirmed && !notScrolled}>
                <input  type="checkbox" bind:checked={read_and_confirmed} disabled={notScrolled}>
                <span class="chk-checkmark"></span>
                I request the exchange of my TAU Lamden tokens and wish to proceed
            </label>
        </div>
    </div>
</div>