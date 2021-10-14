<script> 
    import whitelabel from '../../../whitelabel.json'
    
    import { getContext, onMount } from 'svelte';

    //Stores
    import { 
        DappStore,
        SettingsStore, 
        currentNetwork,
    } from '../../js/stores/stores.js';

    //Components
    import Charms  from '../components/Charms.svelte'
    import { Components }  from '../Router.svelte'
    const { Button } = Components;
    
    //Utils
    import { copyToClipboard } from '../../js/utils.js'

    //Images
    import hero_bg from '../../img/backgrounds/hero_bg.png';
    import dapp_default_bg from '../../img/backgrounds/dapp_default_bg.jpeg';
    import verified_app from '../../img/menu_icons/icon_verified_app.svg';
    import copyWhite from '../../img/menu_icons/icon_copy_white.svg';
    import copyGreen from '../../img/menu_icons/icon_copy_green.svg';

    //Icons
    import SettingsIcon from '../icons/SettingsIcon.svelte'

    //Context
    const { openModal } = getContext('app_functions');

    let brokenLogoLink = false;
    let brokenBGLink = false;
    let copySuccessful = false

    $: dapp = $SettingsStore.currentPage.data
    $: dappInfo = $DappStore[dapp.url]
    $: dappLogo = dappInfo ? dappInfo.logo || false : false;
    $: background = dappInfo ? dappInfo.background ? brokenBGLink ?  dapp_default_bg : `${dappInfo.url}${dappInfo.background}` : dapp_default_bg : hero_bg
    $: thisNetworkApproved = dappInfo ? typeof dappInfo[$currentNetwork.type] === 'undefined' ? false : true : false;
    $: trustedApp = thisNetworkApproved ? dappInfo[$currentNetwork.type].trustedApp : false;
    $: addressLink = dappInfo ? `${$currentNetwork.blockExplorer}/addresses/${dappInfo.vk}`: undefined;

	onMount(() => {
        if (background.includes('http')){
            fetch(background)
                .then(res => {
                    if (res.status !== 200) brokenBGLink = true
                })
                .catch((err) => brokenBGLink = true)
        }
    });
    
    const copyWalletAddress = () => {
        copyToClipboard(dappInfo.vk)
        copySuccessful = true;
    }

</script>

<style>
    h2{
        margin: 0;
    }
    p{
        margin: 0;
    }
    .hero-rec{
        min-height: 247px;
        padding: 40px 40px 26px;
    }

    .wallet-details{
        flex-grow: 1;
    }

    .dapp-logo{
        width: 125px;
    }

    .nickname{
        margin-bottom: 20px;
        color: var(--font-overlay);
    }

    .buttons{
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        align-items: flex-end;
        flex-grow: 1;
        margin-top: 4rem;
    }

    .buttons{
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        align-items: flex-end;
        flex-grow: 1;
        margin-top: 4rem;
    }

    .buttons > *{
        margin: 10px 0px;
    }

    .dapp-name{
        margin: 0;
    }

    .trusted-icon{
        width: 22px;
        margin-right: 10px;
        align-self: center;
    }

    .dapp-info{
        border-left: 1px solid var(--divider-dark);
        padding-left: 20px;
    }

    .flex-row > p {
        margin-right: 12px;
        min-width: fit-content;
    }

    .flex-row.align-center{
        align-items: center;
    }

    .text-link{
        font-size: 0.9em;
        word-break: break-word;
    }

</style>

<div id="dapp-details" class="flex-column text-primary">
	<div class="hero-rec flex-column" style="background-image: url({background});">
        <div class="flex-row">
            <div class="flex-column wallet-details">
                <div class="nickname text-body1">
                    {#if dappInfo}
                        <div class="flex-row">
                            {#if trustedApp}
                                <div class="trusted-icon">
                                    {@html verified_app}
                                </div>
                            {/if}
                            <h2 class="dapp-name">{dappInfo.appName}</h2>
                        </div>
                    {/if}
                </div>
            {#if thisNetworkApproved && dappInfo}
                <div class="dapp-info text-subtitle3">
                    {#if dappInfo}
                        <div class="flex-row align-center">
                            <p>Homepage:</p>
                            <a class="text-link" href={dappInfo.url} rel="noopener noreferrer" target="_blank">{dappInfo.url}</a>
                        </div>
                        <div class="flex-row align-center">
                            <p>Contract Name:</p>
                            <p>{dappInfo[$currentNetwork.type].contractName}</p>
                        </div>
                        <div class="flex-row align-center">
                            <p>Account Address:</p>
                            <a class="text-link" href={addressLink} rel="noopener noreferrer" target="_blank">{dappInfo.vk}</a>
                            <div class="icon copy" on:click={copyWalletAddress}>
                                {#if copySuccessful}
                                    {@html copyGreen}
                                {:else}
                                    {@html copyWhite}
                                {/if}
                            </div>
                        </div>
                    {/if}
                </div>
            {/if}
            </div>
            {#if thisNetworkApproved && dappLogo }
                {#if !brokenLogoLink}
                    <img class="dapp-logo" src={`${dappInfo.url}${dappLogo}`} alt="dapp-logo" on:error={() => brokenLogoLink = true} />
                {/if}
            {/if}
        </div>
        <div class="buttons">
            {#if whitelabel.connectionDetails.buttons.options.show && thisNetworkApproved }
                <div>
                    <Button
                        id={'modify-dapp-btn'} 
                        classes={'button__outlined button__overlay'}
                        name={whitelabel.connectionDetails.buttons.options.name}
                        padding={"12px"}
                        margin={'0 15px 15px 0'}
                        click={() => openModal('ConnectionModify', dappInfo)}
                    >
                        <div slot="icon-before">
                            <SettingsIcon width="15px" color="var(--color-white)" />
                        </div>
                    </Button> 
                </div>
            {/if}
        </div>
            {#if thisNetworkApproved && dappInfo} 
                <p class="text-body2 text-green">
                    Account linked to  
                    <a href="{dappInfo.url}" class="text-link" target="_blank" rel="noopener noreferrer">{`${dappInfo.url}`}</a>
                </p>
            {/if}
            {#if !thisNetworkApproved && dappInfo} 
                <p class="text-body2 text-warning">
                    You have not approved for this app for {$currentNetwork.name}. Vist 
                    <a href="{dappInfo.url}" class="text-link" target="_blank" rel="noopener noreferrer">{`${dappInfo.url}`}</a>
                    to create account link.
                </p>
            {/if}
    </div>
    {#if thisNetworkApproved && $currentNetwork.lamden}
        <Charms dappInfo={dappInfo} />
    {/if}

</div>