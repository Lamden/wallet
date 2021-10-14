<script>
    import whitelabel from '../../../whitelabel.json'

    import { getContext, setContext, afterUpdate, createEventDispatcher } from 'svelte';
	import { fly } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';

    //Utils
    import { copyToClipboard } from '../../js/utils.js'  

    //Images
    import linkedAccount from '../../img/misc/linked_account.svg'
    import logo from '../../img/logo.svg'

    //Icons
    import CheckmarkIcon from '../icons/CheckmarkIcon.svelte';
    import CopyIcon from '../icons/CopyIcon.svelte';

    // Props
    export let dapp;
    export let token;

    let divElm;

    let brokenIconLink = false;
    let brokenCharmIconLink = [];
    let copied = false;

    $: dappLogo = dapp ? dapp.logo || false : false;
    $: dappLogoSrc = dappLogo ? `${dapp.url}${dappLogo}` : undefined;
    $: brokenIconLink = checkIfLogoURLBroken(dappLogoSrc);

    //Context
    const { switchPage } = getContext('app_functions');

    const checkIfLogoURLBroken = (logoSrc) => {
        return fetch(logoSrc, {cache: "reload"}).then(res => {
            if (res.ok && res.status === 200) return true
            else return false
        }).catch(err => false)
    }

    const handleAddressCopy = () => {
        copyToClipboard(dapp.vk)
        copied = true;
        setTimeout(() => copied = false, 2000)
    }
    
</script>

<style>
.row-box{
    padding: 1.25rem 28px 0.25rem 16px;
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

.name{
	width: 234px;
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
.name-box{
    line-height: 1.1;
}

.icon-copy{
    width: 10px;
    height: 10px;
    margin-left: 8px;
}

.account{
    justify-content: flex-end;
	width: 90px;
    flex-grow: 1;
}

</style>

<div 
    id={`coin-row-${dapp.id}`} 
    bind:this={divElm}
    class="row-box flex-column" 
    in:fly="{{delay: 0, duration: 500, x: 0, y: 25, opacity: 0.0, easing: quintOut}}"
    >
    <div class="coin-main-row flex-row flex-center-center">
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
        <div>
            <div class="name text text-body1">
                <div class="name-box">
                    <div id={`dapp-appname-${dapp.id}`}  class="nickname text-body1 " on:click={() => switchPage('ConnectionDetails', dapp)}>
                        {`${dapp.appName}`}
                    </div>
                    <a class="text-link text-subtitle1" href={dapp.url} rel="noopener noreferrer" target="_blank">{dapp.url}</a>
                </div>
            </div>
        </div>
        <div class="account flex-row">
            <div class="text text-body1">
                {dapp.vk}
            </div>
            <div class="icon-copy" 
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
</div>