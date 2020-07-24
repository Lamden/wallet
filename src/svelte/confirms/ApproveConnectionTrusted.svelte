<script>
    import { getContext } from 'svelte'
    import { fly } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';

    //Components
    import Button from '../components/Button.svelte'

    //Icons
    import verified_app from '../../img/menu_icons/icon_verified_app.svg'
    import arrow_right from '../../img/menu_icons/icon_arrow-right.svg'
    import smart_contract from '../../img/menu_icons/icon_smartcontract.svg'    
    import click from '../../img/menu_icons/icon_click.svg' 

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
        align-items: center;
        flex-grow: 1;
        justify-content: space-between;
        padding-top: 2rem;
    }
    .padding{
        flex-grow: 1;
        justify-content: space-evenly;
        padding: 0 2rem;
    }
    .flow{
        width: 100%;
        justify-content: space-evenly;
        align-items: center;

    }
    img{
        width: 100%;
    }
    .icon{
        width: 60px;
    }
    .icon > .checkmark{
        width: 50px;
        margin: 0 auto;
    }
    .icon-arrows{
        width: 22px;
    }
    .buttons{
        margin-bottom: 0.5rem;
    }
    .help-link{
        text-align: center;
    }
    p{
        font-size: 1.1em;
        align-self: flex-start;
        margin: 0.25rem 0;
        line-height: 1.4;
    }
    p.text{
        font-size: 1.2em;
    }
    strong{
        text-decoration: underline;
        font-weight: 400;
        min-width: fit-content;
    }
    .buttons{
        padding: 1rem 0;
    }
    label{
        display: flex;
    }
    label > input {
        margin: 0 10px 0 0;
        position: relative;
        top: -6px;
    }
    label > strong {
        color: var(--font-accent);
        margin-right: 10px;
    }
    .text-primary-dark{
        align-self: center;
    }
</style>
<div class="flex-column detail"
    in:fly="{{delay: 0, duration: 300, x: 500, y: 0, opacity: 0.25, easing: quintOut}}">

    <div class="flex-row flow">
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
                <div class="checkmark">{@html click}</div>
            {/if}
        </div>
        <div class="icon-arrows" >
            {@html arrow_right}
        </div>
         <div class="icon" >
            {@html smart_contract}
        </div>    
    </div>

    <div class="flex-column padding">
        <label>
            <input id="trusted" type=radio bind:group={trusted} value={true} on:changed={() => console.log("changed")}>
            <strong>Automatic</strong>Transactions from {confirmData.messageData.appName} to its smart contract are approved by the wallet automatically
        </label>

        <label >
            <input id="not-trusted" type=radio bind:group={trusted} value={false}>
            <strong>Manual</strong>Approve all transactions from {confirmData.messageData.appName} to its smart contract via a popup
        </label>
    </div>

    <p class="text-primary-dark">You can adjust this option later in the account's settings.</p>

    <div class="flex-column">
        <div class="buttons flex-row">
            <Button 
                id={'trusted-back-btn'}
                classes={'button__solid '}
                name="Back"
                width={'175px'}
                height={'42px'}
                margin={'0 20px 0 0'}
                click={back} />

            <Button 
                id={'trusted-next-btn'}
                classes={'button__solid button__purple'}
                name="Approve App"
                width={'175px'}
                height={'42px'}
                click={setChoice} />
        </div>
        <div class="help-link">
            <a class="outside-link" href="www.lamden.io">learn more about automatic transactions</a>
        </div>  
    </div>
</div>    