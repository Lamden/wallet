<script>
    import whitelabel from '../../../whitelabel.json'
    import * as bip39 from "bip39";
    import Lamden from 'lamden-js'

    import { onMount, getContext } from 'svelte';
    import { fade } from 'svelte/transition';

    //Utils
    import { isLamdenKey} from '../../js/utils.js' 

	//Components
	import { Components, LeftSideFullPage }  from '../Router.svelte'

    const { Button, InputBox, DropDown, Mnemonic} = Components;

    //Context
    const { changeStep, back, setKeys, setFile} = getContext('functions');

    let mnemonicDom, privateKeyDom;

    let mnemonics = new Array(24).fill('');
    let currentSelect = 1;
    let fileName;
    let privateKey;
    let disabledButton = true;
    
    let options = [{
        value: 1,
        name: 'Seed Recovery Phrase'
    },{
        value: 2,
        name: 'Keystore File'
    },{
        value: 3,
        name: 'Private Keys'
    }];

    $: dragover = '';

    const handleSelection = (e) => {
        currentSelect = e.detail.selected.value;
        // clear
        disabledButton = true;
        mnemonics = new Array(24).fill('');
        privateKey = undefined;
        fileName = undefined;
    }

    const openPicker = () => {
        let element = document.getElementById('filePicker');
        element.click();
    }

    const handleFileEvent = (ev) => {
        let file;
        ev.preventDefault();

        if (ev.target.files){
            file = ev.target.files[0];
        } else if (ev.dataTransfer.items) {
            ev.dataTransfer.items[0].kind === 'file' ? file = ev.dataTransfer.items[0].getAsFile() : null;
        } else if (ev.dataTransfer.files) {
            ev.dataTransfer.files[0].kind === 'file' ? file = ev.dataTransfer.files[0].getAsFile() : null;
        }
        if (file) {
            if (file.name.includes(".keystore")){
                setFile(file);
                fileName = file.name;
                disabledButton = false;
            }else{
                dragover = false;
            }
        }
    }

    const handleDragover = (e) => {
        if (!dragover) dragover = true;
    }

    const handleDragleave = (e) => {
        if (dragover) dragover = false;
    }

    const restore = () => {
        if (currentSelect === 1) {
            if (!mnemonicDom.validation()) {
                return;
            }
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
            chrome.runtime.sendMessage({type: 'setMnemonic', data: mnemonicStr}, (ok) => {
                if (ok) {
                    setKeys(keys);
                    changeStep(4)
                } 
            })
        } else if (currentSelect === 2) {
            changeStep(2)
        } else {
            let vk = Lamden.wallet.get_vk(privateKey)
            let keys = {
                keyList: [{
                    name: "Lamden",
                    network: "Lamden",
                    nickname: "My TAU Account",
                    symbol: "TAU",
                    sk: privateKey,
                    vk: vk
                }]
            }
            setKeys(keys);
            changeStep(4)
        }
    }

    const handleMnemonicChanged = (e) => {
        let mnemonicsFullFilled = mnemonics.findIndex(word => !word || word === '' ) === -1;
        if (mnemonicsFullFilled) {
            disabledButton = false;
        }  else {
            disabledButton = true;
        }
    }

    const handlePrivatekeyInput = (e) => {
        privateKeyDom.setCustomValidity('');
        if (isLamdenKey(privateKey)) { 
            disabledButton = false;
        } else {
            privateKeyDom.setCustomValidity('The private key is not a valid Private Key');
            privateKeyDom.reportValidity();
        }
    }

</script>

<style>
    h6{
        margin-top: 0;
        margin-bottom: 1.4rem;
        text-align: center;
        font-size: 20px;
        font-weight: 500;
    }
    .caption-box{
        display: inline;
        margin: 16px 0 20px 0;
        width: 347px;
    }

    .caption-box.text-caption{
        text-align: left;
    }
    span{
        cursor: pointer;
    }

    .dropzone{
        border: dashed 2px var(--font-secondary);
        height: 96px;
        margin-bottom: 20px;
        justify-items: center;
        align-items: center;
        justify-content: center;
        width: 342px;
    }

    .dragover{
        background-color: var(--primary-color);
        color: var(--color-white);
        word-break: break-all;
        padding: 0 10px;
    }
</style>
<LeftSideFullPage title={"Restore Accounts"} helpLink={""}>
    <div slot="body">
        <div class="text-body1 weight-400 desc">
            To restore your accounts, please select the type of restore you want to perform then enter the information associated.
        </div>
    </div>
    <div class="flex-row flow-page flex-just-center" in:fade="{{delay: 0, duration: 200}}" slot="content">
        <div class="flex-column">
            <h6 class="text-primary text-center">Restore Accounts</h6>
            <DropDown                 
                items={options} 
                id={'restore-options'}
                label={'Select Restore Type'} 
                margin="0 0 0.5rem 0"
                width={'347px'}
                innerHeight={'56px'}
                required={true}
                on:selected={handleSelection}
            />
            {#if currentSelect === 1}
                <Mnemonic bind:this={mnemonicDom} on:mnemonicChanged={handleMnemonicChanged}  {mnemonics} disabled={false}/>
            {:else if currentSelect === 2}
                <div class="caption-box text-body1">
                    <span class="text-accent" on:click={() => openPicker()}>Click here to choose a file</span>
                    or drag and drop your file below.
                </div>
        
                <div class={`dropzone flex-column text-body1 ${dragover}`}
                    class:dragover={dragover} 
                    on:dragover|preventDefault={(e) => handleDragover(e)}
                    on:dragleave|preventDefault={(e) => handleDragleave(e)}
                    on:drop={(ev) => handleFileEvent(ev)}>
                    {fileName ? fileName : "Drop File Here"}
                </div>
                <input  id="filePicker" type="file" accept=".keystore" on:change={(ev) => handleFileEvent(ev)}>
            {:else}
                <InputBox 
                    id="private-key"
                    label="Private Key"
                    inputType={'text'}
                    width={"100%"}
                    height={"56px"}
                    margin={"5px 0 20px 0"}
                    bind:thisInput={privateKeyDom}
                    bind:value={privateKey}
                    on:keyup={handlePrivatekeyInput}
                />
            {/if}
            <div class="flex-column flow-buttons">
                <Button id="next"
                        classes={'button__solid button__primary'}
                        margin={'0 0 1rem 0'}
                        name="Next" 
                        width={'347px'}
                        disabled={disabledButton}
                        click={restore} />
                <Button id="back"
                        classes={'button__solid'}
                        margin={'0 0 .625rem 0'}
                        name="Back" 
                        width={'347px'}
                        click={() => back()} />
            </div>
        </div>
    </div>
</LeftSideFullPage>