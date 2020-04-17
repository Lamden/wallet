<script>
    import { getContext, onMount, onDestroy, afterUpdate } from 'svelte';
    
    //Stores
    import { steps, currentNetwork } from '../../js/stores/stores.js';

	//Components
	import { Components }  from '../Router.svelte'
    const { Button } = Components;

    //Images
    import MetaMask from '../../img/misc/metamask-fox.svg'
    import checkmarkWhite from '../../img/menu_icons/icon_checkmark-white.svg'

    //Context
    const { changeStep, setSwapInfo } = getContext('functions');
    const { switchPage } = getContext('app_functions');

    const ethNetworkTypes = {
        'dTAU' : ['Kovan Network'],
        'TAU' : ['Main Network']
    }

    $: metamaskInfo = null;
    $: installStatus = !metamaskInfo ? 'Not Installed' : 'Installed'
    $: isCorrectNetwork = !metamaskInfo ? false : metamaskInfo.chainInfo.tauSymbol === $currentNetwork.currencySymbol
    $: metaMaskButton = !metamaskInfo ? "Connect MetaMask" : isCorrectNetwork ? 'Connected' : 'Connect Again'
    $: address = !metamaskInfo ? '' : metamaskInfo.address

    onMount(() => {
        steps.update(stepsStore => {
            stepsStore.currentStep = 2;
            return stepsStore
        })
    })

    onDestroy(() =>{
        chrome.runtime.onMessage.removeListener(metamaskConnected)
    })

    const nextPage = () => {
        setSwapInfo(metamaskInfo)
        changeStep(2)
    }

    const connectMetaMask = () => {
        chrome.runtime.sendMessage({type: 'connectToMetamask', data: {}}, (res) => console.log(res))
    }

    const metamaskConnected = (message, sender, sendResponse) => {
		if (message.type === 'metamaskConnected') {
            metamaskInfo = message.data
        }
    }

    chrome.runtime.onMessage.addListener(metamaskConnected)

</script>

<style>
.text-box2{
    color: cyan;
    margin-bottom: 60px;
}
a{
    text-decoration: unset;
}
.metamask-logo{
    width: 20vw;
}
p{
    width: max-content;
    margin: 1rem 0 0;
}
p.address{
    margin: 0 0 0.5rem;
}
p.red {
    color:red;
    }
p.green {
    color: green;
}

</style>

<div class="flex-row swaps-intro">
    <div class="flex-column content-left">
        <h6>Connect To Metamask</h6>
    
        <div class="text-box text-body1 text-primary">
            {'The Ethereum portion of the swap will use MetaMask'}
        </div>

        <div class="text-box2 text-body1">
            <span>{`To install metamask follow the instructions on `}
                <a href="https://metamask.io/" class="outside-link" target="_blank" rel="noreferrer noopener">metamask.io</a>
            </span>
        </div>

        <div class="flex-column buttons">
            <Button id={'check-btn'}
                    classes={`button__solid ${installStatus === "Installed" && isCorrectNetwork ? 'button__green' : 'button__purple'}`}
                    styles={'margin-bottom: 16px;'}
                    width={'100%'}
                    name={metaMaskButton}
                    click={connectMetaMask}
                    icon={installStatus === "Installed" && isCorrectNetwork ? checkmarkWhite : ''}
                    iconPosition={'after'}
                    iconWidth={'19px'}/>
            <Button id={'continue-btn'}
                    classes={'button__solid button__purple'}
                    styles={'margin-bottom: 16px;'}
                    width={'100%'}
                    name="Continue" 
                    disabled={!isCorrectNetwork}
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
        <div class="metamask-logo">
            {@html MetaMask}
        </div>
        <a href="https://metamask.io/" class="outside-link" target="_blank" rel="noreferrer noopener">metamask.io</a>
        <p  class="text-body1"
            class:red={installStatus === 'Not Installed'}
            class:green={installStatus === 'Installed'}>
            {`MetaMask is ${installStatus}`}
        </p>
        {#if address !== ''}
            <p class="address">{address}</p>
        {/if}
        {#if installStatus === 'Installed'}
            {#if isCorrectNetwork}
                <p>{`Connected to Ethereum ${ethNetworkTypes[$currentNetwork.currencySymbol]}`}</p>
            {:else}
                <p class="red">{`Please switch MetaMask to ${ethNetworkTypes[$currentNetwork.currencySymbol]} and connect again.`}</p>
            {/if}
        {/if}
    </div>
</div>






