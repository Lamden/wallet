<script>

    import { onMount, getContext } from 'svelte';
    import { fade } from 'svelte/transition';

    //Icons
    import CheckmarkIcon from '../icons/CheckmarkIcon.svelte';
    import CopyIcon from '../icons/CopyIcon.svelte';

    //Utils
    import { copyToClipboard } from '../../js/utils.js'

	//Components
	import { Components, LeftSideFullPage }  from '../Router.svelte'
    const { Button, Mnemonic } = Components;

    //Context
    const { nextPage, back, setVault} = getContext('functions');

    let mnemonics = new Array(24).fill(undefined);
    let copied = false;
    let confirmCopied = false;

    $: mnemonic = mnemonics.join(' ')

    onMount(() => {
        chrome.runtime.sendMessage({type: 'getMnemonic'}, (res) => {
            mnemonics = res.split(" ");
            setVault(res)
        })
    });

    const handleMnemonicsCopy = () => {
        copyToClipboard(mnemonic);
        copied = true;
        setTimeout(() => copied = false, 2000);
    }

</script>

<style>
    .copy{
        display: flex;
        margin: 0 0 1.25rem 0;
        height: 24px;
        line-height: 24px;
        color: var(--accent-color);
        text-decoration: underline;
    }
    .success{
        color: var(--success-color);
    }
    .icon-copy{
        margin-right: 10px;
        display: flex;
        align-items: center;
    } 
    .checkbox-text{
        font-size: 16px;
        margin-bottom: 1.25rem;
    }
    .mark{
        top: 3px
    }
    .wrap{
        width: 347px;
    }
</style>
<LeftSideFullPage title={"Secret Recovery Phrase"} helpLink={"/wallet/backup_overview"}>
    <div slot="body">
        <div class="text-body1 weight-400 desc">
            Your Secret Recovery Phrase makes it easy to back up and restore all your accounts.
            <div class="text-body1 layout-leftside-warning">Never disclose your Secret Recovery Phrase. These words can be used to steal all your accounts.</div>
        </div>
    </div>
    <div class="flex-row flow-page flex-just-center" in:fade="{{delay: 0, duration: 200}}" slot="content">
        <div class="flex-column wrap flex-align-center">
            <h6 class="text-primary text-center">Secret Recovery Phrase</h6>
            <Mnemonic {mnemonics}/>
            <div class="copy text-subtitle3 text-link-secondary flex-just-center" 
                class:success={copied}
                on:click={handleMnemonicsCopy} 
                title="copy account address"
            >   
                <div class="icon-copy">
                    {#if !copied}
                        <CopyIcon width="16px" color="var(--accent-color)"/>
                    {:else}
                        <CheckmarkIcon width="16px" color="var(--success-color)"/>
                    {/if}
                </div>
                Copy Secret Recovery Phrase
            </div>
            <label class="chk-container text-body2 checkbox-text">
                I have copied my Secret Recovery phrase in this exact order on paper, on a USB drive, and in a password manger.
                <input type="checkbox" bind:checked={confirmCopied}>
                <span class="chk-checkmark mark"></span>
            </label>
            <div class="flex-column flow-buttons">
                <Button id="create-wallet"
                        classes={'button__solid button__primary'}
                        margin={'0 0 1rem 0'}
                        name="Next" 
                        width={'347px'}
                        disabled={!confirmCopied}
                        click={() => nextPage()} />
                <Button id="restore-wallet"
                        classes={'button__solid'}
                        margin={'0 0 .625rem 0'}
                        name="Back" 
                        width={'347px'}
                        click={() => back()} />
            </div>
        </div>
    </div>
</LeftSideFullPage>