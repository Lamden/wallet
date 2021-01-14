<script>
    import whitelabel from '../../../whitelabel.json'
    
    import { getContext } from 'svelte'
    import { fly } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';

    //Components
    import Button from '../components/Button.svelte'
    import InputBox from '../components/InputBox.svelte'
    
    import { createEventDispatcher } from 'svelte';
    
    //Icons
    import NetworkIcon from '../icons/NetworkIcon.svelte'
    import SmartContractIcon from '../icons/SmartContractIcon.svelte'

    const dispatch = createEventDispatcher();
    const next = () => {
        let nextStep = 2;
        if (confirmData.messageData.accounts.length === 0) nextStep = 3;
        dispatch('setStep', nextStep)
    }
        
    //Context
    const { close, openNewTab } = getContext('confirm_functions');

    export let confirmData;

</script>


<style>
    .detail{
        align-items: center;
        justify-content: space-between;
        flex-grow: 1;
        padding-top: 2rem;
    }
    .approve-items{
        justify-content: center;
        text-align: center;
        align-content: space-around;
        width: 100%;
    }
    .description{
        font-weight: 600;
        font-size: 1.2em;
        text-align: center;
    }
    .buttons{
        margin-bottom: 0.5rem;
    }
    .help-link{
        text-align: center;
    }
    .item{
        width: 265px;
        margin: 0.25rem auto;
    }
    .item_icon{
        width: 60px;
    }
    .item_info{
        margin: auto 0 auto 20px;
        text-align: initial;
    }
    .item_info > p {
        margin: 0;
    }
    .item_value{
        font-size: 1.2em;
    }
    .buttons{
        padding: 1rem 0;
    }
    p {
        margin: 0;
    }
    p.intro{
        font-size: 1.2em;
        text-align: center;
        line-height: 1.5;
    }
</style>

<div class="flex-column detail"
    in:fly="{{delay: 0, duration: 300, x: 500, y: 0, opacity: 0.25, easing: quintOut}}">
    
    <p class="intro">
        To interact with {confirmData.messageData.appName}, you need to create a 
        <a class="text-link" href="https://docs.lamden.io/docs/wallet/accounts_linked_overview" rel="noopener noreferrer" target="_blank">linked account</a>. 
        Let us help you through the process.
    </p>
    

    <div class="approve-items flex-column">
        <div class="item flex-row">
            <div class="item_icon">
                <SmartContractIcon />
            </div>
            <div class="item_info flex-column">
                <p class="text-body1 text-secondary">Smart Contract Name</p>
                <p class="item_value">{confirmData.messageData.contractName}</p>
            </div>
        </div>
        <div class="item flex-row">
            <div class="item_icon">
                <NetworkIcon />
            </div>
            <div class="item_info flex-column">
                <p class="text-body1 text-secondary">Network</p>
                <p class="item_value">{confirmData.messageData.network.name}</p>
            </div>
        </div>
    </div>

    <p class="intro">
        Click next to proceed
    </p>

    <div class="flex-column">
        <div class="buttons flex-row">
            <Button 
                id={'deny-btn'}
                classes={'button__solid '}
                name="Not Now"
                width={'175px'}
                height={'42px'}
                margin={'0 20px 0 0'}
                click={close} />

            <Button 
                id={'info-next-btn'}
                classes={'button__solid button__primary'}
                name="Next"
                width={'175px'}
                height={'42px'}
                click={next} />
        </div>
        <div class="help-link">
            {#if whitelabel.helpLinks.show}
                <a  class="text-link" 
                    href={whitelabel.helpLinks.masterURL || "https://docs.lamden.io/docs/wallet/accounts_linked_create"}
                    target="_blank" 
                    rel="noopener noreferrer" >
                    learn about linked accounts
                </a>
            {/if} 
        </div>   
    </div>
</div>