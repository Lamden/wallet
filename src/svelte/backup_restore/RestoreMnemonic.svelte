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
    import { steps } from '../../js/stores/stores.js';

	//Components
	import { Components, LeftSideFullPage }  from '../Router.svelte'

    const { Button, InputBox, Mnemonic } = Components;

    //Context
    const { changeStep, back, setKeys, setMnemonic} = getContext('functions');

    let mnemonics = new Array(24).fill('');
    let oldMnemonic;
    let vaultExist = false;
    let disabledButton = true;

    onMount(() => {
        chrome.runtime.sendMessage({type: 'getMnemonic'}, (res) => {
            oldMnemonic = res
        })
        chrome.runtime.sendMessage({type: 'isVaultCreated'}, (ok) => {
			vaultExist = ok;
		})
    });

    const restore = () => {
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
            if (isSameMnemonic) {
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
        let mnemonicsFullFilled = mnemonics.findIndex(word => !word || word === '' ) === -1;
        if (mnemonicsFullFilled) {
            disabledButton = false;
        } else {
            disabledButton = true;
        }
    }
</script>

<style>
</style>
<LeftSideFullPage title={"Seed Phrase"} helpLink={""}>
    <div slot="body">
        <div class="text-body1 weight-400 desc">
            Enter a new seed phrase for your Lamden Vault. 
            <div class="text-body1 layout-leftside-warning">Caution, if a different seed phrase is used this will delete all your current Lamden Vault accounts.</div>
        </div>
    </div>
    <div class="flex-row flow-page flex-just-center" in:fade="{{delay: 0, duration: 200}}" slot="content">
        <div class="flex-column">
            <h6 class="text-primary text-center">Seed Phrase</h6>
            <Mnemonic {mnemonics} on:mnemonicChanged={handleMnemonicChanged} disabled={false}/>
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