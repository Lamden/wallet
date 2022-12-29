<script>
    import { getContext } from 'svelte';
    import Lamden from 'lamden-js'
    
	//Stores
    import { coinsDropDown, NodesStore, CoinStore, currentNetwork, networkKey, SettingsStore } from '../../js/stores/stores.js';

    import {  formatAccountAddress, isLamdenKey, randomString} from '../../js/utils'

    //Components
	import { Components, Modals }  from '../Router.svelte'
    const { Button, DropDown, InputBox } = Components;

    //Context
    const { closeModal } = getContext('app_functions');

    const handleSelectedWallet = (e) => {
        if (!e.detail.selected.value) return;
        selectedWallet = e.detail.selected.value;
    }

    const handleSelectedNode = (e) => {
        if (!e.detail.selected.value) {
            showSKInput = false 
            return
        }
        selectedWallet = e.detail.selected.value;
        showSKInput = true
    }

    //DOM Nodes
    let formObj, privateKeyDom, nicknameObj;
    let addType = 1
    let privateKey

    let resultMsg = undefined
    let step = 0
    let showSKInput = false

    let selectedWallet;

    let createNew = true

    let buttons = [{
        id: "home-btn",
        name: "ok",
        click: () => closeModal(),
        class: "button__solid button__primary",
    },];

    $: buttonGroup = [
            {id:"add-existing-token-btn", name: 'Add Existing', click: () => handleButtonGroupChange(1), class: addType === 1 ? ' button__primary buttonGroup__left' : 'buttonGroup__left' },
            {id:"add-custom-token-btn", name: 'BRAND NEW', click: () =>  handleButtonGroupChange(2), class: addType === 2 ? ' button__primary buttonGroup__right' : 'buttonGroup__right' },
        ]
    $: buttonGroup2 = [
            {id:"add-existing-token-btn", name: 'Create New Account', click: () => handleButtonGroup2Change(true), class: createNew? ' button__primary buttonGroup__left' : 'buttonGroup__left' },
            {id:"add-custom-token-btn", name: 'Already Have An Account', click: () =>  handleButtonGroup2Change(false), class: !createNew? ' button__primary buttonGroup__right' : 'buttonGroup__right' },
        ]
    $: netKey = networkKey($currentNetwork)
    $: nodes = createExistingNodes($NodesStore, $CoinStore)
    $: nodesCoinList = createNodesCoinList($coinsDropDown, $NodesStore, netKey)

    const createExistingNodes = (NodesStore, CoinStore) => {
        const list = [{
            value: undefined,
            name: `Select Node`,
            selected: true
        }]

        NodesStore.filter(n => n.netKey === netKey && n.status === "node" && CoinStore.findIndex(c => c.vk === n.vk) === -1).forEach(k => {
            list.push({
                value: k,
                name: `${formatAccountAddress(k.vk, 8, 10)}`,
                selected: false
            })
        })
        return list
    }

    const createNodesCoinList = (coinsDropDown, NodesStore, netKey) => {
        return coinsDropDown.filter(c => c.name === "Select Account" || NodesStore.findIndex(d => d.vk === c.value.vk && d.netKey === netKey ) === -1)
    }

    const handlePrivatekeyInput = (e) => {
        privateKeyDom.setCustomValidity('');
        if (!isLamdenKey(privateKey)) { 
            privateKeyDom.setCustomValidity('The private key is not a valid Private Key');
            privateKeyDom.reportValidity();
        }
    }

    const handleSubmit = () => {
        if(formObj.checkValidity()){
            if (addType === 1) {
                privateKeyDom.setCustomValidity('')
                let vk = Lamden.wallet.get_vk(privateKey)
                if (vk === selectedWallet.vk) {
                    const account = {
                        'network': 'lamden',
                        'name': 'Lamden',
                        'nickname' : `Node-Wallet-${randomString(6)}`,
                        'symbol': $currentNetwork.currencySymbol,
                        'vk': vk,
                        'sk': privateKey
                    }
                    chrome.runtime.sendMessage({type: 'accountsAddOne', data: account}, (result) => {
                        if (result.added){
                            resultMsg = {type:'success', text: result.reason}
                            SettingsStore.setLastCoinAddedType('normal')
                            chrome.runtime.sendMessage({type: 'joinSocket', data: account.vk})
                            chrome.runtime.sendMessage({type: 'balancesStoreUpdateOne', data: account.vk})
                        }

                        if (!result.added){
                            if (result.reason.includes("already exists")) resultMsg = {type:'warning', text: result.reason}
                            else resultMsg = {type:'error', text: result.reason}
                        }
                        resultMsg.buttons = buttons
                        finish()
                    })
                } else {
                    privateKeyDom.setCustomValidity('The private key is error')
                    privateKeyDom.reportValidity()
                }
            } else {
                if (createNew) {
                    addNewAccount()
                } else {
                    chrome.runtime.sendMessage({type: 'addUnregisterNode', data: selectedWallet.vk}, (response) => {
                        if (response.success) chrome.runtime.sendMessage({type: 'updateNodes'})
                        resultMsg = {
                            type: response.success ? "success" : "error",
                            text: response.msg,
                            buttons
                        }
                        finish()
                    })
                }
            }
        }
    }

    const finish = () => step = 1

    const handleButtonGroupChange = (type) => {
        addType = type
    }

    const handleButtonGroup2Change = (bol) => {
        createNew = bol
    }

    const addNewAccount = () => {
        // create new wallet
        let keyPair = Lamden.wallet.new_wallet()
        let nickname = nicknameObj.value === '' ? `Node-Wallet-${randomString(6)}` : nicknameObj.value;
        let coinInfo = {
            'network': "Lamden",
            'name': "lamden",
            'nickname' : nickname,
            'symbol': "TAU",
            'vk': keyPair.vk,
            'sk': keyPair.sk
        }
        chrome.runtime.sendMessage({type: 'accountsAddOne', data: coinInfo}, (result) => {
            if (result.added){
                resultMsg = {type:'success', text: result.reason}
                let type = 'normal';
                SettingsStore.setLastCoinAddedDate();
                SettingsStore.setLastCoinAddedType(type)
                chrome.runtime.sendMessage({type: 'joinSocket', data: coinInfo.vk})
                chrome.runtime.sendMessage({type: 'balancesStoreUpdateOne', data: coinInfo.vk})

                chrome.runtime.sendMessage({type: 'addUnregisterNode', data: coinInfo.vk}, (response) => {
                    if (response.success) chrome.runtime.sendMessage({type: 'updateNodes'})
                    resultMsg = {
                        type: response.success ? "success" : "error",
                        text: response.success ? `${nickname} Success Created. Please backup the account in time.` : response.msg ,
                        buttons
                    }
                    finish()
                })
            }

            if (!result.added){
                if (result.reason.includes("already exists")) resultMsg = {type:'warning', text: result.reason}
                else resultMsg = {type:'error', text: result.reason}
                finish()
            }
        })
    }

</script>

<style>
.confirm-tx{
    width: 500px;
    background: inherit;
}

.buttons{
    flex-grow: 1;
    display: flex;
    padding-top: 27px;
    justify-content: center;
    align-items: center;
}
.disabled{
    background: var(--bg-secondary);
}
h2 {
    margin-bottom: 1rem;
}
.header{
    margin-top: 20px;
}
.mr20 {
    margin-bottom: 20px;
}
</style>


{#if step === 0}
        <div class="confirm-tx flex-column">
            <div class="flex-column">
                <h2>{`Add Node`}</h2>
                <h3 class="header">Choose Action</h3>
                <div class="button-group flex-row">
                    {#each buttonGroup as button}
                        <Button
                            id={button.id} 
                            classes={`button__solid ${button.class}`} 
                            width={'100%'}
                            name={button.name}
                            click={button.click}
                            tabIndex={"-1"} />
                    {/each}        
                </div>
                {#if addType === 1}
                    <p class="text-body1">Use this option if you are the owner of a current node participating in the network. You will be asked for your secret key to prove you are the owner of that node.</p>
                    <h3 class="header">Select Existing Node</h3>
                    <DropDown  
                        items={nodes}
                        id={'nodes'} 
                        label={'Nodes In Network'}
                        margin="0 0 1rem 0"
                        required={true}
                        on:selected={(e) => handleSelectedNode(e)}
                    />
                    <form on:submit|preventDefault={() => handleSubmit() } bind:this={formObj} target="_self">
                        {#if showSKInput}
                            <InputBox 
                                id="private-key"
                                label="Private Key"
                                inputType={'password'}
                                width={"100%"}
                                required={true}
                                bind:thisInput={privateKeyDom}
                                bind:value={privateKey}
                                disabledPWShowBtn={false}
                                on:keyup={handlePrivatekeyInput}
                            />
                        {/if}
                        <div class="buttons flex-column">
                            <input  id="confirmTx-btn"
                                    value="Confirm"
                                    class="button__solid button__primary submit submit-button submit-button-text"
                                    class:disabled={selectedWallet === undefined}
                                    disabled={selectedWallet === undefined ? 'disabled' : ''}
                                    type="submit" >
                            <Button classes={'button__text text-caption'} 
                                    width={'125px'}
                                    height={'24px'}
                                    padding={0}
                                    margin={'17px 0'}
                                    name="Cancel" 
                                    click={() => closeModal()} />
                        </div>
                    </form>
                {:else}
                    <p class="text-body1">
                        Use this option if you are creating a node that you would like to register to be added to the network. 
                        It is not advised to use you Main Lamden account as your node account. Create a new one for your node.
                    </p>
                    <div class="button-group flex-row">
                        {#each buttonGroup2 as button}
                            <Button
                                id={button.id} 
                                classes={`button__solid ${button.class}`} 
                                width={'100%'}
                                name={button.name}
                                click={button.click}
                                tabIndex={"-1"} />
                        {/each}        
                    </div>
                    <div class="mr20"></div>
                    {#if createNew}
                        <InputBox
                            bind:thisInput={nicknameObj}
                            id={"nickname"}
                            margin="0 0 1rem 0"
                            placeholder={`Account Nickname`}
                            label={"Account Nickname (Optional)"}
                        />
                        
                    {:else}
                        <DropDown  
                            items={nodesCoinList}
                            id={'nodes'} 
                            label={'Select Node Wallet'}
                            margin="0 0 1rem 0"
                            required={true}
                            on:selected={(e) => handleSelectedWallet(e)}
                        />
                    {/if}
                    <form on:submit|preventDefault={() => handleSubmit() } bind:this={formObj} target="_self">
                        <div class="buttons flex-column">
                            <input  id="confirmTx-btn"
                                    value="Confirm"
                                    class="button__solid button__primary submit submit-button submit-button-text"
                                    class:disabled={!createNew && selectedWallet === undefined}
                                    disabled={!createNew && selectedWallet === undefined ? 'disabled' : ''}
                                    type="submit" >
                            <Button classes={'button__text text-caption'} 
                                    width={'125px'}
                                    height={'24px'}
                                    padding={0}
                                    margin={'17px 0'}
                                    name="Cancel" 
                                    click={() => closeModal()} />
                        </div>
                    </form>
                {/if}
            </div>
        </div>
{:else}
    <svelte:component this={Modals['MessageBox']} message={resultMsg} />
{/if}