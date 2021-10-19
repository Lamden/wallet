<script>
    import whitelabel from '../../../whitelabel.json'
    
    import { getContext, onMount } from 'svelte'
    import { fly } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';

    //Components
    import Button from '../components/Button.svelte'
    
    import logo from '../../img/logo.svg'

    //Utils
    import { formatAccountAddress } from '../../js/utils.js' 

    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    //Context
    const { setAccount, close } = getContext('confirm_functions');

    export let confirmData
    
    let selectedAccountVk = null; // selected account Id

    $: accountList = confirmData.messageData.accounts

    const next = () => {
        setAccount(accountList.find(account => account.vk === selectedAccountVk));
        dispatch('setStep', 3);
    }

    const back = () => {
        let backStep = 1;
        if (confirmData.messageData.accounts.length === 0) backStep = 1;
        dispatch('setStep', backStep)
    }

    const selectAccount = (vk) => {
        selectedAccountVk = vk;
    }
</script>


<style>
    .detail{
        flex-grow: 1;
        padding: 1rem;
    }
    .buttons{
        justify-content: flex-end;
        align-items: center;
        flex-grow: 1;
    }
    .help-link{
        text-align: center;
    }
    p {
        margin: 0 0 1rem;
    }

    .card{
        display: flex;
        flex-direction: row;
        margin-bottom: 16px;
        min-width: 23%;
        background: var(--bg-secondary);
        padding: 16px;
        cursor: pointer;
    }

    .card-selected{
        border: 1px solid var(--accent-color);
        filter: brightness(125%);
    }

    .logo{
        display: flex;
        justify-content: center;
        width: 32px;
        position: relative;
        margin-right: 8px;
    }

    .inline{
        display: inline;
    }

    .change{
        padding-top: 4px;
    }
    .no-accounts{
        margin-top: 1rem;
    }
</style>

<div class="flex-column detail"
    in:fly="{{delay: 0, duration: 300, x: 500, y: 0, opacity: 0.25, easing: quintOut}}">

    <p class="text-body2">
        {`Please chose an account to linked with ${confirmData.messageData.appName}`}
    </p>
    {#if accountList.length > 0}
        <div class="flex-column">
            {#each accountList as account, index (account.vk)}
                <div id={`account-${index}`} class="card" class:card-selected={selectedAccountVk === account.vk} on:click={() => selectAccount(account.vk)}>
                    <div class="logo flex-center-center"> {@html logo} </div>
                    <div>
                        <div class="inline text-bold">{account.nickname} ({formatAccountAddress(account.vk, 10, 4)})</div>
                        <div class="change text-accent">{selectedAccountVk === account.vk ? "Selected" : "Switch to this account"}</div>
                    </div>
                </div>
            {/each}
        </div>
    {:else}
        <p class="no-accounts"><strong>Your Lamden Wallet does not have any accounts.</strong></p>
        <p>
            Please 
            <a href="https://docs.lamden.io/docs/wallet/accounts_creation" class="text-link" target="_blank" rel="noopener noreferrer">add an account</a> 
            and retry this connection.
        </p>
    {/if}

    <div class="flex-column buttons">
        <p class="text-body2">Click Next to proceed</p>
        <Button 
            id={'account-link-btn'}
            classes={'button__solid button__primary'}
            name="Next"
            width={'240px'}
            height={'42px'}
            margin={'0 0 0.5rem 0'}
            disabled={selectedAccountVk === null}
            click={next} />
        <Button 
            id={'account-deny-btn'}
            classes={'button__solid '}
            name="Back"
            width={'240px'}
            height={'42px'}
            margin={'0 0 0.5rem 0'}
            click={back} />
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