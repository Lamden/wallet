<script>
    import { getContext } from 'svelte';
    
	//Stores
    import { CoinStore, coinMeta, password, supportedCoins, SettingsStore, currentNetwork } from '../../js/stores/stores.js';

    //Components
    import { Components, Modals } from '../../js/router.js';
    const { Button, InputBox, DropDown, MessageBox } = Components;
    
	//Utils
    import { pubFromPriv, keysFromNew, validateAddress } from '../../js/crypto/wallets.js';
    import { encryptStrHash, decryptStrHash, stripCoinRef } from '../../js/utils.js';

	//Context
    const { closeModal } = getContext('app_functions');
    const { nextPage, setMessage, detailsPage } = getContext('coinadd_functions');
    
    //DOM NODES
    let formObj, privateKeyObj, publicKeyObj, nicknameObj
    
    let returnMessage = {type:'', text:'', buttons: []};
    let selectedInput;
    let keyPair = {};
    let addType = 1;

    let returnMessageButtons = [
            {id: "home-btn", name: 'Home', click: () => closeModal(), class: 'button__solid button__purple'},
            {id: "another-btn", name: 'Add Another', click: () => detailsPage(), class: 'button__solid'}
        ]

    $: buttonGroup = [
            {id:"create-new-btn", name: 'Create New', click: () => addType = 1, class: addType === 1 ? ' button__purple buttonGroup__left' : 'buttonGroup__left' },
            {id:"add-existing-btn", name: 'Add Existing', click: () => addType = 2, class: addType === 2 ? ' button__purple buttonGroup__center' : 'buttonGroup__center' },
            {id:"track-address-btn", name: 'Track Address', click: () => addType = 3, class: addType === 3 ? ' button__purple buttonGroup__right' : 'buttonGroup__right' }
        ]

    $: supportedCoinsList = createCoinList();
    $: selected = selectedInput ? selectedInput.value : selectedInput;

    async function handleSubmit(){
        if (addType === 2) validatePrivateKey();
        if (addType === 3) validatePublicKey();
        
        if (formObj.checkValidity()){
            if (addType === 1) {
                createAndSaveKeys();
            } else {
                saveKeys();
            }
            sendMessage();
            nextPage();
        }
    }

    function refreshValidity(e){
        e.detail.target.setCustomValidity('');
    }

    function refreshValidityKeyup(e){ 
        if (e.detail.keyCode !== 13) e.detail.target.setCustomValidity('');
    }

    function sendMessage(){
        if (returnMessage.type !== 'error' && returnMessage.type !== 'warning') {
            returnMessage.type = 'success';
            returnMessage.text = `${selected.name} (${selected.symbol}) Wallet Added Successfully`;
        }
        returnMessage.buttons = returnMessageButtons
        setMessage(returnMessage)
    }

    function validatePrivateKey(){
        privateKeyObj.setCustomValidity('');
        try{
            keyPair.vk = pubFromPriv(selected.network, selected.symbol, privateKeyObj.value);
            keyPair.sk = privateKeyObj.value;
        } catch (e) {
            console.log(e)
            privateKeyObj.setCustomValidity(e);
        }
        privateKeyObj.reportValidity()
    }

    function validatePublicKey(){
        publicKeyObj.setCustomValidity('');
        try{
            keyPair.vk = validateAddress(selected.network, publicKeyObj.value);
        } catch (e) {
            console.log(e)
            publicKeyObj.setCustomValidity(e);
        }
        publicKeyObj.reportValidity()
    }

    function saveKeys(){
        if ($CoinStore.filter(f =>  f.network === selected.network &&
                                    f.symbol === selected.symbol &&
                                    f.vk === keyPair.vk).length > 0){
            returnMessage = {type:'warning', text: "Coin already exists in wallet"}
            return;
        }

        CoinStore.update(coinstore => {
            let nickname = nicknameObj.value === '' ? `New ${selected.name} Wallet` : nicknameObj.value;
            let coinInfo = {
                'network': selected.network,
                'name': selected.name,
                'nickname' : nickname,
                'symbol': selected.symbol,
                'vk': keyPair.vk,
                'sk': addType === 3 ? 'watchOnly' : encryptStrHash($password, keyPair.sk),
            }

            if (coinInfo.vk === "") {
                returnMessage = {type:'warning', text: "VK was left blank"}
            }else{
                coinstore.push(coinInfo);
            }

            return coinstore;
        });
    }

    function createAndSaveKeys(){
        try {
            keyPair = keysFromNew(selected.network, selected.symbol);
            saveKeys();
        } catch (e){
            console.log(e)
            returnMessage = {type:'error', text: e}
        }
        mintMockchainCoins();
    }

    function createCoinList(){
        let coinList = []
        Object.keys(supportedCoins).forEach(network => {
            coinList.push(...supportedCoins[network].map(coin => {
                return {name: coin.name, value: {network, ...coin}}
            }))
        })
        return coinList
    }

    function mintMockchainCoins(){
        let mockchain = $SettingsStore.networks.find(f => f.name === "Lamden Public Testnet")
        if (mockchain){
            let body = JSON.stringify({
                "vk" : keyPair.vk,
                "amount" : 1000000,
            })
            fetch(`http://${mockchain.ip}:${mockchain.port}/mint`, {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json'
                },
                body
            })
            .then(res => res.json())
            .then(res => {
                if (currentNetwork.ip === mockchain.ip && currentNetwork.port === mockchain.port) CoinStore.updateAllBalances(currentNetwork);
            })
            .catch(err => console.log(err))
        }
    }


</script>
<style>
.coin-add-details{
    width: 100%;
    height: 570px;
}

.header{
    margin-top: 30px;
}

.button-group{
    margin-bottom: 31px;
}
.submit-button-box{
    flex-grow: 1;
    justify-content: flex-end;
    align-items: center;
    padding-bottom: 20px;
}

.submit-button-size{
    width: 232px;
    height: 46px;
}
</style>

<form  class="coin-add-details flex-column" on:submit|preventDefault={() => handleSubmit() } 
    target="_self" bind:this={formObj}>
    <h5 class="header">Select Wallet</h5>
    <div class="text-subtitle3">
        Select from the drop down to add a coin wallet.
    </div>
    <DropDown  
        items={supportedCoinsList}
        initial={"Select One"}
        id={'suppportedCoins'} 
        label={'Select a Coin'}
        styles="margin-bottom: 19px;"
        required={true}
        on:selected={(e) => selectedInput = e.detail.selected}
    />
    {#if selected}
        <h5 class="header">Choose Action</h5>
        <div class="button-group flex-row">
            {#each buttonGroup as button, index}
                <Button
                    id={button.id} 
                    classes={`button__solid ${button.class}`} 
                    width={'222px'}
                    name={button.name}
                    click={button.click}
                    tabIndex={"-1"} />
            {/each}        
        </div>
        
        {#if addType === 2}
            <InputBox
                id="private-key"
                width="100%"
                bind:thisInput={privateKeyObj}
                label={"Enter Private Key"}
                placeholder={`Private Key`}
                styles={`height: 46px; margin-bottom: 17px;`}
                on:changed={refreshValidity}
                on:keyup={refreshValidityKeyup}
                spellcheck={false}
                required={true}
            />
        {/if}

        {#if addType === 3}
            <InputBox
                id="public-key"
                width="100%"
                bind:thisInput={publicKeyObj}
                label={"Enter Public Key"}
                placeholder={`Public Key`}
                styles={`height: 46px; margin-bottom: 17px;`}
                on:changed={refreshValidity}
                on:keyup={refreshValidityKeyup}
                spellcheck={false}
                required={true}
            />
        {/if}

        <InputBox
            id={"nickname"}
            width="100%"
            bind:thisInput={nicknameObj}
            placeholder={`Wallet Nickname`}
            label={"Wallet Nickname (Optional)"}
            styles={`height: 46px; margin-bottom: 17px;`}
        />

        <div class={"submit-button-box flex-column"}>
            <input class="button__solid button__purple submit submit-button submit-button-text submit-button-size" type="submit" value="Save">
        </div>
    {/if}
</form>
