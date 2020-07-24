<script>
    import { onMount, getContext } from 'svelte';

	//Stores
    import { currentNetwork } from '../../js/stores/stores.js';

    //Components
    import { Modals, Components } from '../Router.svelte';
    const { Button } = Components;

    //Icons
    import verified_app from '../../img/menu_icons/icon_verified_app.svg'
    import arrow_right from '../../img/menu_icons/icon_arrow-right.svg'
    import smart_contract from '../../img/menu_icons/icon_smartcontract.svg'    
    import click from '../../img/menu_icons/icon_click.svg' 

	//Context
    const { setMessage, setPage, home } = getContext('coinDappOptions_functions');

    //Props
    export let dappInfo;

    let trusted = dappInfo[$currentNetwork.type].trustedApp;
    let sending = false;

    const buttons = [
        {id: 'back-btn', name: 'Back', click: () => home(), class: 'button__solid button__purple'}
    ]
    let message = {buttons}

    const handleChange = () => {
        sending = true;
        chrome.runtime.sendMessage({type: 'setTrusted', data: {dappUrl: dappInfo.url, networkType: $currentNetwork.type, trusted}}, (trustedSet) => {
            sending = false;
        })
    }


</script>

<style>
    .padding{
        padding: 0.5rem 60px;
    }
    .flow{
        width: 50%;
        justify-content: space-around;
        align-items: center;
        margin: 2rem auto;
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
    p{
        font-size: 1.1em;
        align-self: flex-start;
        margin: 0.25rem 0;
        line-height: 1.4;
    }
    p.text{
        font-size: 1.2em;
    }

    label{
        display: flex;
        margin: 0.2rem auto;
    }
    label > input {
        height: 14px;
        margin-right: 10px;
    }
    label > strong {
        color: var(--font-accent);
        margin-right: 10px;
    }
</style>

<div id="coin-dapp-trusted" class="flex-column">
    <h1>Automatic Transactions</h1>
    <p class="text-body2">
        Automatic transactions make for a better user experience as some Apps can send frequent transactions.
        Once automatic transactions are enabled you will no longer receive popups when <strong>{dappInfo.appName}</strong> sends transations
        to its smart contract <strong>{dappInfo[$currentNetwork.type].contractName}</strong>.
    </p>
    <h2>Is this safe?</h2>
    <p class="text-body2">
        Since <strong>{dappInfo.appName}</strong> is locked to only sending transactions through its smart contract, it cannot spend your TAU directly.
        The Apps will however spend your <strong>{$currentNetwork.currencySymbol}</strong>, a bit at a time, as it makes transactions. For added security
        it is advised that you only transfer over as much <strong>{$currentNetwork.currencySymbol}</strong> to this account as the Apps needs to operate.
    </p>
    <a class="outside-link" href="www.lamden.io">learn more about automatic transactions</a>
    <div class="flex-row flow">
        <div class="icon" >
            <img src={`${dappInfo.url}${dappInfo.logo}`} alt="app logo" />
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

    <div class="flex-column padding text-body2">
        <label>
            <input id="trusted" type="radio" bind:group={trusted} value={true} on:change={handleChange} disabled={sending}>
            <strong>Automatic</strong>Transactions from {dappInfo.appName} to its smart contract are approved by the wallet automatically
        </label>

        <label >
            <input id="not-trusted" type="radio" bind:group={trusted} value={false} on:change={handleChange} disabled={sending}>
            <strong>Manual</strong>Approve all transactions from {dappInfo.appName} to its smart contract via a popup
        </label>
    </div>
    <Button 
        id={"back-btn"}
        classes={'button__solid button__purple'} 
        width={'260px'}
        margin={'1rem 0'}
        styles={'align-self: center;'}
        name="Back" 
        click={home} />  
</div>