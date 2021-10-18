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

    //Icons
    import CheckmarkIcon from '../icons/CheckmarkIcon.svelte';
    import CopyIcon from '../icons/CopyIcon.svelte';
    import SettingsIcon from '../icons/SettingsIcon.svelte'
    import PopoutIcon from '../icons/PopoutIcon.svelte'

    //Context
    const { openModal } = getContext('app_functions');

    let brokenLogoLink = false;
    let brokenBGLink = false;
    let copied = false


    $: dapp = $SettingsStore.currentPage.data
    $: dappInfo = $DappStore[dapp.url]
    $: dappLogo = dappInfo ? dappInfo.logo || false : false;
    $: dappLinkedAccount = dappInfo ? dappInfo.vk : false;
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

    const handleAddressCopy = () => {
        copyToClipboard(dapp.vk)
        copied = true;
        setTimeout(() => copied = false, 2000)
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
        height: 380px;
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

    .current-linked-account{
        margin-top: 1rem;
    }

    .account-buttons{
        margin-bottom: 1rem;
    }

    .account-vk{
        width: 175px;
        margin-left: 1em;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
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
            {#if whitelabel.connectionDetails.buttons.edit.show && thisNetworkApproved }
                <div>
                    <Button
                        id={'modify-dapp-btn'} 
                        classes={'button__outlined button__overlay'}
                        name={whitelabel.connectionDetails.buttons.edit.name}
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
            {#if !thisNetworkApproved && dappInfo} 
                <p class="text-body2 text-warning">
                    You have not approved for this app for {$currentNetwork.name}. Vist 
                    <a href="{dappInfo.url}" class="text-link" target="_blank" rel="noopener noreferrer">{`${dappInfo.url}`}</a>
                    to create account link.
                </p>
            {/if}
    </div>
    {#if thisNetworkApproved && dappLinkedAccount}
        <div class="flex-row flex-align-center current-linked-account text-body1">
            <strong>Currently Linked Account:</strong>
            <span class="account-vk">{dappLinkedAccount}</span>
            <PopoutIcon width="20px" url={`https://www.tauhq.com/addresses/${dappInfo.vk}`}/>
        </div>
        <div class="flex-row flex-align-center account-buttons">
            <Button 					
                id={'change-account-btn'} 
                classes={'button__small button__primary run-button'}
                height={'unset'}
                padding={"1em 2em"}
                margin={'1rem 0 1rem'}
                name={"copy account"}
                click={handleAddressCopy}>
                    <div slot="icon-before">
                        {#if copied}
                            <CheckmarkIcon width="13px"/>
                        {:else}
                            <CopyIcon width="13px" />
                        {/if}
                    </div>
            </Button>
            <Button 					
                id={'change-account-btn'} 
                classes={'button__small button__primary run-button'}
                height={'unset'}
                padding={"1em 2em"}
                margin={'1rem 0 1rem 1em'}
                name={"change account"}
                click={() => openModal('ConnectionModify', dappInfo)} />
        </div>
        
    {/if}
    {#if thisNetworkApproved && $currentNetwork.lamden}
        <Charms dappInfo={dappInfo} />
    {/if}
</div>