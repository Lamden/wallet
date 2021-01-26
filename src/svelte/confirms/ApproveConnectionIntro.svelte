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
        flex-grow: 1;
        padding: 1rem;
    }
    .approve-items{
        margin: 1rem 0;
    }
    .buttons{
        justify-content: flex-end;
        align-items: center;
        flex-grow: 1;
    }
    .help-link{
        text-align: center;
    }
    .item{
        margin: 0.25rem;
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
    p {
        margin: 0 0 1rem;
    }

</style>

<div class="flex-column detail"
    in:fly="{{delay: 0, duration: 300, x: 500, y: 0, opacity: 0.25, easing: quintOut}}">
    
    <p class="text-body2">
        To interact with {confirmData.messageData.appName}, you need to create a 
        <a class="text-link" href="https://docs.lamden.io/docs/wallet/accounts_linked_overview" rel="noopener noreferrer" target="_blank">linked account</a>. 
        
    </p>

    <p class="text-body2">
        Let us guide you through the process.
    </p>
    

    <div class="approve-items flex-column">
        <div class="item flex-row">
            <SmartContractIcon width="45px" />
            <div class="item_info flex-column">
                <p class="text-body1 text-secondary">Smart Contract Name</p>
                <p class="item_value">{confirmData.messageData.contractName}</p>
            </div>
        </div>
        <div class="item flex-row">
            <NetworkIcon width="45px"/>
            <div class="item_info flex-column">
                <p class="text-body1 text-secondary">Network</p>
                <p class="item_value">{confirmData.messageData.network.name}</p>
            </div>
        </div>
    </div>



    <div class="flex-column buttons">
        <p class="text-body2">Click Next to proceed</p>
        <Button 
            id={'info-next-btn'}
            classes={'button__solid button__primary'}
            name="Next"
            width={'240px'}
            height={'42px'}
            margin={'0 0 0.5rem 0'}
            click={next} />
        <Button 
            id={'deny-btn'}
            classes={'button__solid '}
            name="Not Now"
            width={'240px'}
            height={'42px'}
            margin={'0 0 0.5rem 0'}
            click={close} />
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