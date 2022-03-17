<script>
    import whitelabel from '../../../whitelabel.json'
    import * as bip39 from "bip39";
    import Lamden from 'lamden-js'

    import { onMount, getContext } from 'svelte';
    import { fade } from 'svelte/transition';

    //Icons
    import CheckmarkIcon from '../icons/CheckmarkIcon.svelte';
    import CopyIcon from '../icons/CopyIcon.svelte';

    //Utils
    import { copyToClipboard } from '../../js/utils.js' 

    //Stores
    import { steps, CoinStore} from '../../js/stores/stores.js';

	//Components
	import { Components, LeftSideFullPage }  from '../Router.svelte'

    const { Button, InputBox, Mnemonic } = Components;

    //Context
    const { changeStep, back, setKeys, setMnemonic} = getContext('functions');

    let mnemonicDom;

    let mnemonics = new Array(24).fill('');
    let oldMnemonic;
    let vaultExist = false;
    let disabledButton = true;
    let useAnyway = false;
    let errmsg;

    $: vaultAccounts = $CoinStore ? [...$CoinStore].map((coin, index) => {
		coin.id = index
		return coin
	}).filter(c => c.type === "vault") : [];
    $: isVaultAccountsExists = vaultAccounts.length > 0 ? true : false

    onMount(() => {
        chrome.runtime.sendMessage({type: 'getMnemonic'}, (res) => {
            oldMnemonic = res
        })
        chrome.runtime.sendMessage({type: 'isVaultCreated'}, (ok) => {
			vaultExist = ok;
		})
    });

    const restore = () => {
        if (!mnemonicDom.validation()) {
            disabledButton = true;
            return;
        }
        if (mnemonics.join(' ').trim().split(/\s+/g).length < 12) {
            disabledButton = true;
            errmsg = "Must input at least 12 words."
            return;
        }
        if (!useAnyway) {
            if (!Lamden.wallet.validateMnemonic(mnemonics.join(' '))) {
                disabledButton = true;
                errmsg = "One of the entered words does not match the word list."
                return;
            }
        }

        let isSameMnemonic = oldMnemonic === mnemonics.join(' ');
        if (!vaultExist) {
            let mnemonicStr = mnemonics.join(' ');
            let seed = bip39.mnemonicToSeedSync(mnemonicStr).toString('hex');
            let account = Lamden.wallet.new_wallet_bip39(seed, 0);
            account.name = "Lamden"
            account.network = "lamden"
            account.nickname = "My TAU Account"
            account.symbol =  "TAU"
            account.type = "vault"
            let keys = {
                keyList: [account]
            }
            setMnemonic(mnemonicStr)
            chrome.runtime.sendMessage({type: 'setMnemonic', data: mnemonicStr}, (ok) => {
                if (ok) {
                    setKeys(keys);
                    changeStep(4)
                } 
            })
        } else {
            if (isSameMnemonic && isVaultAccountsExists) {
                changeStep(12)
            } else {
                let mnemonicStr = mnemonics.join(' ');
                let seed = bip39.mnemonicToSeedSync(mnemonicStr).toString('hex');
                let account = Lamden.wallet.new_wallet_bip39(seed, 0);
                account.name = "Lamden"
                account.network = "lamden"
                account.nickname = "My TAU Account"
                account.symbol =  "TAU"
                account.type = "vault"
                let keys = {
                    keyList: [account]
                }
                setMnemonic(mnemonicStr);
                setKeys(keys);
                changeStep(11);
            }
        }
    }

    const handleMnemonicChanged = (e) => {
        errmsg = undefined;
        if (useAnyway) {
            disabledButton = false
            return
        }

        let mnemonicsFullFilled = mnemonics.findIndex(word => !word || word === '' ) === -1;
        if (mnemonicsFullFilled) {
            disabledButton = false;
        } else {
            disabledButton = true;   
        }
    }

    const handleChange = (e) => {
        errmsg = undefined;
        if (useAnyway) {
            disabledButton = false
        }
    }
</script>

<style>
    .checkbox-text{
        font-size: 16px;
        margin-bottom: 1.5rem;
        align-self: flex-start;
    }
    p{
        margin-top: 0;
        align-self: flex-start;
    }
</style>
<LeftSideFullPage title={"Remember"} helpLink={"/wallet/restore_overview"}>
    <div slot="body">
        <div class="text-body1 weight-400 desc">
            Enter a new Recovery Phrase for your Lamden Vault
            <div class="text-body1 layout-leftside-warning">Caution, if a different Recovery Phrase is used this will delete all your current Lamden Vault accounts.</div>
        </div>
    </div>
    <div class="flex-row flow-page flex-just-center" in:fade="{{delay: 0, duration: 200}}" slot="content">
        <div class="flex-column flex-align-center">
            <h6 class="text-primary text-center">Restore with Seed Recovery Phrase</h6>
            <Mnemonic {mnemonics} bind:this={mnemonicDom} on:mnemonicChanged={handleMnemonicChanged} disabled={false} {useAnyway}/>
            {#if errmsg}
                <p class="text-warning">{errmsg}</p>
            {/if}
            <label class="chk-container text-body1 checkbox-text desc">
                Use non-standard phrase.
                <input type="checkbox" bind:checked={useAnyway} on:change={handleChange}>
                <span class="chk-checkmark mark"></span>
            </label>
            <div class="flex-column flow-buttons">
                <Button id="create-wallet"
                        classes={'button__solid button__primary'}
                        margin={'0 0 1rem 0'}
                        name="Next" 
                        width={'347px'}
                        disabled={disabledButton}
                        click={restore} />
                <Button id="restore-wallet"
                        classes={'button__solid'}
                        margin={'0 0 1rem 0'}
                        name="Back" 
                        width={'347px'}
                        click={() => back()} />
            </div>
        </div>
    </div>
</LeftSideFullPage>