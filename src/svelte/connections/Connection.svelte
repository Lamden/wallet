<script>
    import { getContext, setContext, afterUpdate, createEventDispatcher } from 'svelte';
	import { fly } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';

    //Components
	import { Components }  from '../Router.svelte'
	const { Button, Identicons } = Components;

    //Utils
    import { copyToClipboard } from '../../js/utils.js'  
    import { CoinStore } from '../../js/stores/stores.js' 

    //Images
    import linkedAccount from '../../img/misc/linked_account.svg'
    import logo from '../../img/logo.svg'

    //Icons
    import CheckmarkIcon from '../icons/CheckmarkIcon.svelte';
    import CopyIcon from '../icons/CopyIcon.svelte';
    import PopoutIcon from '../icons/PopoutIcon.svelte';
    import { currentNetwork } from '../../js/stores/stores';

    // Props
    export let dapp;

    let divElm;

    let brokenIconLink = false;
    let brokenCharmIconLink = [];
    let copied = false;

    $: dappLogo = dapp ? dapp.logo || false : false;
    $: dappLogoSrc = dappLogo ? `${dapp.url}${dappLogo}` : undefined;
    $: brokenIconLink = checkIfLogoURLBroken(dappLogoSrc);
    $: addressLookupURL = $currentNetwork.type === "mainnet" ? "https://www.tauhq.com" : $currentNetwork.blockExplorer;
    $: linkedAccountVK = dapp.vk
    $: linkedAccountInfo = CoinStore.getByVk(linkedAccountVK)

    //Context
    const { switchPage, openModal } = getContext('app_functions');

    const checkIfLogoURLBroken = (logoSrc) => {
        return fetch(logoSrc, {cache: "reload"}).then(res => {
            if (res.ok && res.status === 200) return true
            else return false
        }).catch(err => false)
    }

    const handleAddressCopy = () => {
        copyToClipboard(linkedAccountVK)
        copied = true;
        setTimeout(() => copied = false, 2000)
    }
    
</script>

<style>
    .row-box{
        padding: 1.25rem 28px 0.25rem 16px;
        justify-content: flex-start;
        box-sizing: border-box;
    }
    .coin-main-row{
        margin-bottom: 0.5rem;
    }
    .text{
        display: flex;
        align-items: center;
        flex-wrap: wrap;
    }

    .logo{
        display: flex;
        justify-content: center;
        width: 68px;
        height: 35px;
    }

    .text-link{
		color: var(--font-secondary);
	}

    .name{
        width: 85px;
    }

    .name-box{
        line-height: 1.1;
    }

    .dapp-logo{
        position: relative;
        width: 32px;
        margin: 0 36px 0 0;
    }
    .dapp-linked-account-logo{
        position: absolute;
        bottom: 0;
        right: 0;
        width: 14px;
    }


    .icon-copy{
        margin: 0 1em 0 0.5em;
    }

    .buttons{
        margin: 0.5rem 0 0.5rem 68px;
    }

    .account-info{
        width: 100%;
        margin-left: 1em;
        align-items: flex-end;
    }

    .account{
        width: 100%;
        justify-content: flex-end;
    }

    .account-vk{
        width: 50px;
        white-space: nowrap;

    }

    .account-name{
        margin: 0 5em 0 0;
        width: 50px;
    }

    @media (min-width: 550px) {
        .account-info{
            margin-left: 2em;
        }
        .account-name{
            width: 100px;;
        }
        .account-vk{
            width: 100px;
        }
        .name{
            width: 135px;
        }
    }

    @media (min-width: 700px) {
        .account-vk{
            width: 175px;
        }
        .name{
            width: 200px;
        }
        .account-name{
            margin: 0 6em 0 0;
            width: fit-content;
        }
    }

    @media (min-width: 900px) {
        .account-vk{
            width: 175px;
        }
    }

    @media (min-width: 1200px) {
        .account-vk{
            width: 200px;
        }
    }

</style>

<div 
    id={`coin-row-${dapp.id}`} 
    bind:this={divElm}
    class="row-box flex-column" 
    in:fly="{{delay: 0, duration: 500, x: 0, y: 25, opacity: 0.0, easing: quintOut}}"
    >
    <div class="coin-main-row flex-row flex-align-center">
        <div class="logo flex-center-center">
            {#await brokenIconLink}
                <div class="dapp-logo">
                    {@html logo}
                    <div class="dapp-linked-account-logo"> 
                        {@html linkedAccount}
                    </div>
                </div>
            {:then res}
                {#if res}
                    <img class="dapp-logo" src={dappLogoSrc} alt="dapp logo" > 
                {:else}
                    <div class="dapp-logo">
                        {@html logo}
                        <div class="dapp-linked-account-logo"> 
                            {@html linkedAccount}
                        </div>
                    </div>
                {/if}
            {/await}
        </div>
        <div class="name text text-body1">
            <div class="name-box text-ellipsis weight-300">
                <div id={`dapp-appname-${dapp.id}`}  class="nickname text-body1" on:click={() => switchPage('ConnectionDetails', dapp)}>
                    {`${dapp.appName}`}
                </div>
                <a class="text-link text-subtitle1" href={dapp.url} rel="noopener noreferrer" target="_blank">{dapp.url}</a>
            </div>
        </div>
        <div class="account-info flex-column">
            <div class="account flex-row flex-align-center">
                <div>
                    <Identicons iconValue={linkedAccountVK} />
                </div>
                <div class="account-vk text text-body1 weight-300 text-ellipsis">
                    {linkedAccountVK}
                </div>
                <div class="icon-copy" 
                    on:click={handleAddressCopy} 
                    title="copy account address"
                >
                    {#if !copied}
                        <CopyIcon width="18px" color="var(--font-primary)" />
                    {:else}
                        <CheckmarkIcon width="18px" color="var(--success-color)"/>
                    {/if}
                </div>
                <PopoutIcon width="20px" url={`${addressLookupURL}/addresses/${linkedAccountVK}`}/>
            </div>
            <p class="account-name text-secondary text-ellipsis">{linkedAccountInfo.nickname} </p>
        </div>
    </div>
    <div class="buttons flex flex-align-center">
        <Button 					
            id={'details-btn'} 
            classes={'button__primary button__small responsive'}
            margin={'1rem 0'}
            name={"Details"}
            responsive
            click={() => switchPage('ConnectionDetails', dapp)} />
        <Button 					
            id={'details-btn'} 
            classes={'button__primary button__small responsive'}
            margin={'1rem 0 1rem 1em'}
            name={"Change Account"}
            responsive
            click={() => openModal('ConnectionModify', dapp)} />
    </div>
</div>