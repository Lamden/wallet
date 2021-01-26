<script>
    import whitelabel from '../../../whitelabel.json'
    
    import { getContext } from 'svelte'
    import { fly } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';

    //Components
    import Button from '../components/Button.svelte'
    

    //Icons
    import SmartContractIcon from '../icons/SmartContractIcon.svelte'
    import verified_app from '../../img/menu_icons/icon_verified_app.svg'
    import arrow_right from '../../img/menu_icons/icon_arrow-right.svg'  

	import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    //Context
    const { openNewTab, setTrusted, logoFormat } = getContext('confirm_functions');

    export let confirmData;

    let trusted = true;

    const setChoice = () => {
        setTrusted(trusted)
        next();
    }

    const next = () => {
        dispatch('setStep', 4)
    }

    const back = () => {
        let nextStep = 2;
        if (confirmData.messageData.accounts.length === 0) nextStep = 1;
        dispatch('setStep', nextStep)
    }    
</script>


<style>
    .detail{
        flex-grow: 1;
        padding: 1rem;
    }
    .flow1{
        width: 100%;
        justify-content: space-evenly;
        align-items: center;
        box-sizing: border-box;
        padding: 0 15%;

    }
    img{
        width: 100%;
    }
    .icon{
        width: 30px;
    }
    .icon > .checkmark{
        width: 50px;
    }
    .icon-arrows{
        width: 22px;
    }
    .buttons{
        justify-content: flex-end;
        align-items: center;
        flex-grow: 1;
    }
    .help-link{
        text-align: center;
    }
    strong{
        text-decoration: underline;
        font-weight: 400;
        min-width: fit-content;
    }
    label{
        display: flex;
        margin: 0.5rem 0;
    }
    label > input {
        margin: 0 15px 0 0;
    }
    label > strong {
        color: var(--font-accent);
        align-self: center;
        text-decoration: none;
        margin-right: 15px;
        font-size: 1.2em;
    }
    p{
        margin: 1rem 0;
    }
    p.choice{
        font-size: 1em;
        font-weight: 300;
        margin: 0;
    }
</style>
<div class="flex-column detail"
    in:fly="{{delay: 0, duration: 300, x: 500, y: 0, opacity: 0.25, easing: quintOut}}">

    <div class="flex-row flow1">
        <div class="icon" >
            <img src={`${confirmData.url}/${logoFormat(confirmData.messageData.logo)}`} alt="app logo" />
        </div>
        <div class="icon-arrows" >
            {@html arrow_right}
        </div>
        <div class="icon" >
            {#if trusted}
                {@html verified_app}
            {:else}
                <div class="checkmark">
                    <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="24" height="24" fill="none" rx="0" ry="0"></rect>
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M10.9266 2.6C10.9266 2.3 11.2266 2 11.5266 2C11.9266 2 12.1266 2.2 12.1266 2.6V3.4C12.1266 3.7 11.8266 4 11.5266 4C11.2266 4 10.9266 3.7 10.9266 3.4V2.6ZM14.9267 7.7C14.6267 7.7 14.3267 7.4 14.3267 7.1C14.3267 6.7 14.6267 6.5 14.9267 6.5H16.1267C16.4267 6.5 16.7267 6.8 16.7267 7.1C16.7267 7.4 16.4267 7.7 16.1267 7.7H14.9267ZM8.12666 6.5H6.92667C6.62667 6.5 6.32666 6.8 6.32666 7.1C6.32666 7.4 6.62667 7.7 6.92667 7.7H8.12666C8.42666 7.7 8.72667 7.4 8.72667 7.1C8.72667 6.8 8.52666 6.5 8.12666 6.5ZM7.92673 3.4C8.12673 3.2 8.52674 3.2 8.72674 3.4L9.42673 4.1C9.62673 4.3 9.62673 4.7 9.42673 4.9C9.32673 5 9.12672 5.1 9.02672 5.1C8.92672 5.1 8.72673 5 8.62673 4.9L7.92673 4.2C7.72673 4 7.72673 3.6 7.92673 3.4ZM14.2266 5C14.4266 5 14.5266 4.90001 14.6266 4.80001L14.6266 4.8L15.2266 4.2C15.4266 4 15.4266 3.6 15.2266 3.4C15.0266 3.2 14.6266 3.2 14.4266 3.4L13.8266 4C13.6266 4.2 13.6266 4.6 13.8266 4.8C13.9266 5 14.0266 5 14.2266 5ZM13.3267 18.3999H18.3946C18.3946 18.3999 18.3879 18.5918 18.3267 18.7931L18.2469 19.565L13.3267 19.5999C13.0267 19.5999 12.7267 19.2999 12.7267 18.9999C12.7267 18.6999 13.0267 18.3999 13.3267 18.3999Z
                        " fill=var(--accent-color)></path>
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M20.6267 12.6C20.6267 11.9 20.3267 11.4 20.1267 11.2C19.8267 10.9 19.3267 10.7 18.9267 10.7C18.6267 10.7 18.3267 10.8 18.0267 10.9C17.7267 10.4 17.2267 9.99998 16.5267 9.99998H16.3267C15.9267 9.99998 15.5267 10.2 15.2267 10.4C14.9267 10.1 14.5267 9.99998 14.1267 9.99998H13.9267C13.7267 9.99998 13.5267 9.99998 13.4267 10.1V6.69998C13.4267 4.39998 9.72673 4.39998 9.72673 6.69998V13.9C9.42673 13.6 9.02672 13.3 8.52672 12.9C7.42672 12.1 6.32672 12.2 5.52672 13.1C5.22672 13.4 5.02672 13.9 5.12672 14.4C5.22672 14.9 5.42672 15.3 5.82672 15.6C6.42672 16 7.12672 16.6 7.62672 17C9.02672 18.1 9.82672 19.7 9.82672 21.4C9.82672 21.7 10.1267 22 10.4267 22H19.0267C19.2267 22 19.3267 21.9 19.4267 21.8C19.5267 21.7 19.6267 21.5 19.5267 21.3L19.3267 18.9C20.2267 17.5 20.7267 15.2 20.6267 12.6ZM18.2267 19.6L18.3267 20.8H11.0267C10.8267 19 9.92672 17.3 8.42672 16.1C7.92672 15.7 7.22672 15.1 6.62672 14.7C6.52672 14.6 6.42672 14.5 6.42672 14.3C6.42672 14.2 6.42672 14 6.52672 13.9C6.92672 13.4 7.32672 13.4 7.92672 13.8C9.02672 14.6 9.72673 15.3 9.72673 15.4C9.92673 15.6 10.2267 15.7 10.5267 15.6C10.8267 15.5 11.0267 15.2 11.0267 14.9V6.69998C11.0267 6.19998 11.6267 6.09998 11.7267 6.09998C11.8267 6.09998 12.4267 6.09998 12.4267 6.69998V11.7V13.1C12.4267 13.4 12.7267 13.7 13.0267 13.7C13.3267 13.7 13.6267 13.4 13.6267 13.1V11.7C13.6267 11.4 13.8267 11.2 14.1267 11.2H14.3267C14.6267 11.2 14.8267 11.4 14.8267 11.7V13.1C14.8267 13.4 15.1267 13.7 15.4267 13.7C15.7267 13.7 16.0267 13.4 16.0267 13.1V11.7C16.0267 11.4 16.2267 11.2 16.5267 11.2H16.7267C17.0267 11.2 17.2267 11.4 17.2267 11.7V13.1C17.2267 13.4 17.5267 13.7 17.8267 13.7C18.1267 13.7 18.4267 13.4 18.4267 13.1V12.6C18.4267 11.8 19.2267 11.8 19.4267 12C19.5267 12.1 19.6267 12.3 19.6267 12.5C19.6267 15 19.2267 17.1 18.4267 18.3C18.3677 18.4576 18.3267 18.6148 18.3267 18.8L18.2267 19.6Z
                        " fill=var(--font-primary)></path>
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M11.5266 2C11.2266 2 10.9266 2.3 10.9266 2.6V3.4C10.9266 3.7 11.2266 4 11.5266 4C11.8266 4 12.1266 3.7 12.1266 3.4V2.6C12.1266 2.2 11.9266 2 11.5266 2ZM14.3267 7.1C14.3267 7.4 14.6267 7.7 14.9267 7.7H16.1267C16.4267 7.7 16.7267 7.4 16.7267 7.1C16.7267 6.8 16.4267 6.5 16.1267 6.5H14.9267C14.6267 6.5 14.3267 6.7 14.3267 7.1ZM6.92667 6.5H8.12666C8.52666 6.5 8.72667 6.8 8.72667 7.1C8.72667 7.4 8.42666 7.7 8.12666 7.7H6.92667C6.62667 7.7 6.32666 7.4 6.32666 7.1C6.32666 6.8 6.62667 6.5 6.92667 6.5Z
                        " fill=var(--font-primary) fill-opacity="0.3">
                        </path>
                    </svg>
                </div>
            {/if}
        </div>
        <div class="icon-arrows" >
            {@html arrow_right}
        </div>
        <SmartContractIcon width="38px"/>
    </div>

    <div class="flex-column">
        <p class="text-body2 weight-600">
            Do you want to authorize 
            <a class="text-link" href="https://docs.lamden.io/docs/wallet/accounts_linked_create#make-account-trusted" rel="noopener noreferrer" target="_blank">automatic transactions</a> 
            for this wallet?
        </p>
        <label>
            <input id="trusted" type=radio bind:group={trusted} value={true}>
            <strong>Yes</strong> 
            <p class="choice">
                Automatically approve transactions from {confirmData.messageData.appName} to its smart contract. 
                Does not include transactions to send {confirmData.messageData.network.currencySymbol}. However, will generate 
                <a class="text-link" href="https://docs.lamden.io/docs" rel="noopener noreferrer" target="_blank">transaction costs</a>.
            </p>
        </label>


        <label >
            <input id="not-trusted" type=radio bind:group={trusted} value={false}>
            <strong>No</strong>
            <p class="choice">Approve all transactions from {confirmData.messageData.appName} to its smart contract manually via popup window.</p>
        </label>
    </div>

    <p class="font-primary-dim">You can adjust this option later in the account's settings.</p>

    <div class="flex-column buttons">
            <Button 
                id={'trusted-next-btn'}
                classes={'button__solid button__primary'}
                name="Create Account"
                width={'240px'}
                height={'42px'}
                margin={'0 0 0.5rem 0'}
                click={setChoice} />
            <Button 
                id={'trusted-back-btn'}
                classes={'button__solid '}
                name="Back"
                width={'240px'}
                height={'42px'}
                margin={'0 0 0.5rem 0'}
                click={back} />

        <div class="help-link">
            {#if whitelabel.helpLinks.show}
                <a  class="text-link" 
                    href="https://docs.lamden.io/docs/wallet/accounts_linked_create"
                    target="_blank" 
                    rel="noopener noreferrer" >
                    learn about automatic transactions
                </a>
            {/if} 
        </div>  
    </div>
</div>    