<script>
    import whitelabel from '../../../whitelabel.json'
    import * as bip39 from "bip39";
    import Lamden from 'lamden-js'

    import { onMount, getContext } from 'svelte';
    import { fade } from 'svelte/transition';

    //Utils
    import { isLamdenKey } from '../../js/utils.js';

	//Components
	import { Components, LeftSideFullPage }  from '../Router.svelte'

    const { Button, InputBox } = Components;

    //doms
    let inputdom;

    //Context
    const { changeStep, back, setKeys } = getContext('functions');
    let privateKey;
    let disabledButton = true;

    const restore = () => {
        inputdom.setCustomValidity('');
        if (!isLamdenKey(privateKey)) {
            inputdom.setCustomValidity('Unvalided Lamden Address');
            inputdom.reportValidity();
            return;
        }
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

    const handleKeyup = (e) => {
        disabledButton = e.detail.target.value === "";
    }

</script>

<style>
    .btns{
        margin-top: 1rem;
    }
    .wrap{
        width: 347px;
    }
</style>
<LeftSideFullPage title={"Restore With Private Key"} helpLink={""}>
    <div slot="body">
        <div class="text-body1 weight-400 desc">
            Restore a Legacy account using it's Private Key.
            <div class="text-body1 layout-leftside-warning">Any accounts restored in this way are not contained in your Lamden Vault and as such not backed up under your Recovery Phrase</div>
        </div>
    </div>
    <div class="flex-row flow-page flex-just-center" in:fade="{{delay: 0, duration: 200}}" slot="content">
        <div class="flex-column wrap">
            <h6 class="text-primary text-center">Restore With Private Key</h6>
            <InputBox 
                bind:thisInput={inputdom}
                id="private-key"
                label="Private Key"
                inputType={'text'}
                width={"100%"}
                height={"56px"}
                margin={"5px 0 20px 0"}
                bind:value={privateKey}
                on:keyup={handleKeyup}
            />
            <div class="flex-column flow-buttons btns">
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