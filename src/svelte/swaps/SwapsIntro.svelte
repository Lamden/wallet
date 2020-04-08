<script>
    import { getContext } from 'svelte';
    
    //Stores
    import { steps, currentNetwork } from '../../js/stores/stores.js';

	//Components
	import { Components }  from '../Router.svelte'
    const { Button } = Components;

    //Images
    import MetaMask from '../../img/misc/metamask-fox.svg'
    import checkmarkWhite from '../../img/menu_icons/icon_checkmark-white.svg'

    //Context
    const { changeStep, storeAddress } = getContext('functions');
    const { switchPage } = getContext('app_functions');

    $: installStatus = 'Not Installed'
    $: address = ''

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
		if (message.type === 'metamaskConnected') {
            installStatus = 'Connected'
            address = message.data
            
        }
	})

    const connectMetaMask = () => {
        chrome.runtime.sendMessage({type: 'connectMetamask', data: {}})
    }

    const nextPage = () => {
        storeAddress(address)
        changeStep(1)
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

@media (min-width: 900px) {
    .content-left{
        padding: 0px 24px 0 242px;
        width: 498px;
    }
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

        <div class="buttons">
            <Button id={'connect-btn'}
                    classes={`button__solid ${installStatus === "Connected" ? 'button__green' : 'button__purple'}`}
                    styles={'margin-bottom: 16px;'}
                    width={'100%'}
                    name="Connect MetaMask" 
                    click={connectMetaMask}
                    icon={installStatus === "Connected" ? checkmarkWhite : ''}
                    iconPosition={'after'}
                    iconWidth={'19px'}/>
            <Button id={'continue-btn'}
                    classes={'button__solid button__purple'}
                    styles={'margin-bottom: 16px;'}
                    width={'100%'}
                    name="Continue" 
                    disabled={installStatus === 'Not Installed'}
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
        <div class="metamask-logo">
            {@html MetaMask}
        </div>
        <p  class="text-body1"
            class:red={installStatus === 'Not Installed'}
            class:green={installStatus === 'Connected'}>
            {`MetaMask is ${installStatus}`}
        </p>
        {#if address !== ''}
            <p class="address">{address}</p>
        {/if}
        <a href="https://metamask.io/" class="outside-link" target="_blank" rel="noreferrer noopener">metamask.io</a>
        
    </div>
</div>






