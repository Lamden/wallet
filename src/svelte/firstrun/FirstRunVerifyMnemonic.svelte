<script>
    import whitelabel from '../../../whitelabel.json'
    import Lamden from 'lamden-js'

    import { onMount, getContext } from 'svelte';
    import { fade } from 'svelte/transition';

	//Components
	import { Components, LeftSideFullPage }  from '../Router.svelte'
    const { Button, Mnemonic } = Components;

    //Context
    const { nextPage, back, getVault} = getContext('functions');
    const { switchPage } = getContext('app_functions');

    // doms
    let mnemonicDom;

    let errmsg;
    let disabledButton = true;

    let mnemonics;
    let disableInputs = [];

    onMount(() => {
        let vals = new Array(24).fill('');
        let disArr = [];
        let vault = getVault();
        let words = vault.mnemonic.split(' ');
        let arr = generateRandom();
        for (let i=0;i < 12;i++){
            let index = arr[i];
            vals[index] = words[index];
            disArr.push(index)
        }
        disableInputs = disArr;
        mnemonics = vals;
	});

    function generateRandom(){ 
        let data = [];
        let arr = [];
        for (let i=0;i<24;i++){
            data.push(i)
        }
        for (let i=0;i < 12;i++){
            let index = Math.floor(Math.random()*(23-i));
            let rand = data.splice(index, 1)[0];
            arr.push(rand);
        }
        return arr;
    } 

    const valid = () => {
        if (!mnemonicDom.validation()) { 
            return false;
        } 
        let vault = getVault();
        if (vault.mnemonic === mnemonics.join(' ')) {
            return true
        }
        errmsg = "The mnemonic word you entered is wrong"
        return false
    }
    const next = () => {
        if (valid()) {
            nextPage();
        }
    } 

    const handleMnemonicChanged = (e) => {
        errmsg = undefined;
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
<LeftSideFullPage title={"About Seed Recovery Phrases"} helpLink="/wallet/first_vault_install">
    <div slot="body">
        <div class="text-body1 weight-400 desc">
            Your Secret Recovery Phrase makes it easy to back up and restore all your accounts.
            <div class="text-body1 layout-leftside-warning">Never disclose your Secret Recovery Phrase. These words can be used to steal all your accounts.</div>
        </div>
    </div>
    <div class="flex-row flow-page flex-just-center" in:fade="{{delay: 0, duration: 200}}" slot="content">
        <div class="flex-column flex-align-center">
            <h6 class="text-primary text-center">Verify Seed Recovery Phrase</h6>
            <Mnemonic bind:this={mnemonicDom} on:mnemonicChanged={handleMnemonicChanged} {disableInputs} {mnemonics} disabled={false}/>
            {#if errmsg}
                <p class="text-warning">{errmsg}</p>
            {/if}
            <div class="flex-column flow-buttons">
                <Button id="next"
                        classes={'button__solid button__primary'}
                        margin={'0 0 1rem 0'}
                        name="Next" 
                        width={'347px'}
                        disabled={disabledButton}
                        click={() => next()} />
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