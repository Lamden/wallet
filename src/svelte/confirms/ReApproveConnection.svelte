<script>
    import { getContext } from 'svelte'
    import { fly } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';

    //Components
    import Button from '../components/Button.svelte'
    import InputBox from '../components/InputBox.svelte'
    import { createEventDispatcher } from 'svelte';
    
    //Icons
    import SmartContractIcon from '../icons/SmartContractIcon.svelte'
    import NetworkIcon from '../icons/NetworkIcon.svelte'
    
    const dispatch = createEventDispatcher();
    const next = () => {
        dispatch('setStep', 5)
    }
        
    //Context
    const { close, openNewTab } = getContext('confirm_functions');

    export let confirmData;

    let oldSmartContract = confirmData.messageData.oldConnection[confirmData.messageData.networkType].contractName

</script>


<style>
    .detail{
        flex-grow: 1;
        padding: 1rem;
    }
    .approve-items{
        margin: 1rem;
    }
    .buttons{
        justify-content: flex-end;
        align-items: center;
        flex-grow: 1;
    }
    .item{
        width: 300px;
        margin: 0.25rem auto;
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
        margin: 0;
    }
    p.intro{
        font-size: 1.2em;
        text-align: center;
        line-height: 1.5;
    }
    p > strong {
        color: var(--font-warning);
        font-weight: 400;
    }
    .text-link{
        text-decoration: underline;
    }
    .text-link, .text-link:visited, .text-link:focus{
        color: var(--font-warning);
    }
</style>

<div class="flex-column detail"
    in:fly="{{delay: 0, duration: 300, x: 500, y: 0, opacity: 0.25, easing: quintOut}}">
    
    <p class="text-body2 ">
        <a class="text-link" href={confirmData.url} rel="noopener noreferrer" target="_blank">{confirmData.messageData.oldConnection.appName}</a>
        <strong>has requested a change the smart contract name for this Linked Account. </strong> 
    </p>    

    <div class="approve-items flex-column">
        <div class="item flex-row">
            <SmartContractIcon width="60px"/>
            <div class="item_info flex-column">
                <p class="text-body2 text-secondary">OLD Smart Contract</p>
                <p class="item_value" style="margin-bottom: 0.5rem;">{oldSmartContract}</p>
                <p class="text-body2 text-secondary">NEW Smart Contract</p>
                <p class="item_value">{confirmData.messageData.contractName}</p>
            </div>
        </div>
        <div class="item flex-row">
            <NetworkIcon width="60px"/>
            <div class="item_info flex-column">
                <p class="text-body2 text-secondary">Network</p>
                <p class="item_value">{confirmData.messageData.network.name}</p>
            </div>
        </div>
    </div>

    <p class="text-body3 text-primary-dim">
        Before accepting, it is recommended that you contact the owner of the DAPP to understand why.
    </p>
    <div class="flex-column buttons">
        <Button 
            id={'approve-btn'}
            classes={'button__solid button__primary'}
            name="Accept Change"
            width={'240px'}
            height={'42px'}
            margin={'0 0 0.5rem 0'}
            click={next} />
        <Button 
            id={'deny-btn'}
            classes={'button__solid '}
            name="Close"
            width={'240px'}
            height={'42px'}
            margin={'0 0 0.5rem 0'}
            click={close} />
    </div>
</div>