<script>
    import { getContext } from 'svelte';
    //Components
    import { Modals, Components }  from '../Router.svelte'
    const { Button, QR } = Components

    //Icons
    import CheckmarkIcon from '../icons/CheckmarkIcon.svelte';
    import CopyIcon from '../icons/CopyIcon.svelte';

    //Utils
    import { copyToClipboard } from '../../js/utils.js' 

    //Stores
    import { currentNetwork } from '../../js/stores/stores.js';

    //Context
	const { closeModal } = getContext('app_functions');

    //Props
    export let modalData;

    let copied = false;

    $: coin = modalData.coin;
    $: addressLookupURL = $currentNetwork.type === "mainnet" ? "https://www.tauhq.com" : $currentNetwork.blockExplorer;

    const handleAddressCopy = () => {
        copyToClipboard(coin.vk)
        copied = true;
        setTimeout(() => copied = false, 2000)
    }

    const openHQTab = () => {
        const url = `${addressLookupURL}/addresses/${coin.vk}`;
		window.open(url, '_blank');
	}
</script>

<style>
    .nickname{
        margin-bottom: 17px;
        font-size: 18px;
    }
    .qr-container{
        width: 160px;
        height: 160px;
        margin-bottom: 17px;
    }
    .address{
        padding: 5px 10px;
        margin-bottom: 17px;
        background: var(--bg-secondary);
        cursor: pointer;
        height: 30px;
    }
</style>
    <div class="receive flex-column flex-center-center">
        <strong class="nickname">{coin.nickname}</strong>
        <div class="qr-container">
            <QR text={coin.vk} />
        </div>
        <button class="button__solid button__small address flex-row" 
            class:success={copied} 
            on:click={handleAddressCopy} 
            title="copy account address"
        >
            {coin.vk}
            <div class="icon-copy">
                {#if !copied}
                    <CopyIcon width="9px" color="var(--font-primary)"/>
                {:else}
                    <CheckmarkIcon width="10px" color="var(--success-color)"/>
                {/if}
            </div>
        </button>
        <Button id="lamden-view-account"
            classes={'button__solid button__primary'} 
            width={'300px'}
            margin={'0 0 17px 0'}
            name="View Account on Lamden" 
            click={() => openHQTab() }
        />
        <Button id="lamden-close"
            classes={'button__solid button__primary'} 
            width={'300px'}
            margin={'0 0 17px 0'}
            name="Close" 
            click={() => closeModal() }
        />
    </div>

