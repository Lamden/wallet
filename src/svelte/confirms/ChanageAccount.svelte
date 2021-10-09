<script>
    import whitelabel from '../../../whitelabel.json'
    
    import { getContext, onMount } from 'svelte'
    import { fly } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';

    //Components
    import Button from '../components/Button.svelte'
    import ApprovConnectionAccount from './ApprovConnectionAccount.svelte';
    
    import logo from '../../img/logo.svg'

    //Utils
    import { formatAccountAddress, copyToClipboard } from '../../js/utils.js' 

    //Icons
    import CheckmarkIcon from '../icons/CheckmarkIcon.svelte';
    import CopyIcon from '../icons/CopyIcon.svelte';

    //Images
    import hero_bg from '../../img/backgrounds/hero_bg.png';;

    //Context
    const { approveApp, close, logoFormat } = getContext('confirm_functions');

    export let confirmData;

    let copied = false
    let changeConfirm = false

    const handleAddressCopy = () => {
        copyToClipboard(confirmData.messageData.wallet.vk)
        copied = true;
        setTimeout(() => copied = false, 2000)
    }

    const changeAccount = (change) => {
        if (change.detail) {approveApp()}
    }

</script>


<style>
    .detail{
        flex-grow: 1;
        padding: 2rem 1rem 1rem 1rem;
        justify-content: space-between;
    }
    .logo{
        display: flex;
        justify-content: center;
        width: 16px;
        position: relative;
        margin-right: 8px;
    }

    .card{
        display: flex;
        flex-direction: column;
        margin-bottom: 16px;
        min-width: 23%;
        background: var(--bg-secondary);
        padding: 16px;
        border-radius: 16px;
    }

    .card-selected{
        border: 1px solid var(--accent-color);
    }

    .card-head{
        margin-bottom: 1rem;
        justify-content: space-between;
    }

    .icon-copy{
        width: 10px;
        height: 10px;
        margin-left: 8px;
    }

    .icon-copy:hover{
        margin-top: 1px;
    }

    p.confirm{
        font-size: 1.1rem;
        text-align: center;
    }

    .buttons{
        align-items: center;
        flex-grow: 1;
        justify-content: flex-end;
    }

    .text-link, .text-link:visited, .text-link:focus{
        color: var(--font-warning);
        margin: 0.5rem 0 0 0;
    }

    .tag{
        padding: 4px;
        border-radius: 8px;
        color: var(--button-primary-text-color);
        background-color: var(--button-primary-color);
        box-shadow: 0px 1px 8px rgba(0, 0, 0, 0.1), 0px 2px 4px rgba(0, 0, 0, 0.12), 0px 1px 2px rgba(0, 0, 0, 0.16);
    }

</style>

<div class="flex-column detail"
    in:fly="{{delay: 0, duration: 300, x: 500, y: 0, opacity: 0.25, easing: quintOut}}">

    <div class="flex-column hero-rec popup" style="background-image: url({hero_bg})" >
        <h3> Linked Account Change </h3>
        <div class="flex-row dapp-name">
            <img src={`${confirmData.messageData.url}/${logoFormat(confirmData.messageData.logo)}`} alt="app logo" />
            <p class="text-body1">{confirmData.messageData.appName}</p>
        </div>
        <a class="text-link" href={confirmData.messageData.url} rel="noopener noreferrer" target="_blank">{`source ${confirmData.messageData.url}`}</a>
    </div>
    {#if !changeConfirm}
        <div class="detail flex-column">
            <div class="card card-selected">
                <div class="flex-row card-head flex-align-center">
                    <div class="text-body2">{`Linked with ${confirmData.messageData.appName}`}</div>
                    <span class='tag'>Current</span>
                </div>
                <div class="flex flex-align-center">
                    <div class="logo"> {@html logo} </div>
                    <div class="text-bold">{confirmData.messageData.wallet.nickname} ({formatAccountAddress(confirmData.messageData.wallet.vk, 10, 4)})</div>
                    <div class="icon-copy" 
                        class:success={copied} 
                        on:click={handleAddressCopy} 
                        title="copy account address"
                    >
                        {#if !copied}
                            <CopyIcon width="9px" color="var(--font-primary)"/>
                        {:else}
                            <CheckmarkIcon width="10px" color="var(--success-color)"/>
                        {/if}
                    </div>
                </div>
            </div>
            <p class="confirm">{`Change the account linked with ${confirmData.messageData.appName}?`}</p>
            <div class="flex-column buttons">
                <Button 
                    id={'change-btn'}
                    classes={'button__solid button__primary'}
                    name="Change"
                    width={'240px'}
                    height={'42px'}
                    margin={'0 0 0.5rem 0'}
                    click={()=>{changeConfirm = true}}
                    />
                <Button 
                    id={'deny-btn'}
                    classes={'button__solid'}
                    name="Cancel"
                    width={'240px'}
                    height={'42px'}
                    margin={'0 0 0.5rem 0'}
                    click={close} />
        
                    {#if whitelabel.helpLinks.show}
                        <a  class="text-link text-subtitle4" 
                            href={whitelabel.helpLinks.masterURL || "https://docs.lamden.io/docs/wallet/accounts_linked_approval"}
                            target="_blank" 
                            rel="noopener noreferrer" >
                            what is this?
                        </a>
                    {/if}   
            </div>
        </div>
    {:else}
        <ApprovConnectionAccount {confirmData}
            on:changeAccount={changeAccount} 
        />
    {/if}
</div>