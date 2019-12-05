<script>
    import { getContext } from 'svelte';
    
	//Stores
    import { CoinStore, coinMeta, password, supportedCoins } from '../../js/stores/stores.js';

    //Components
    import { Components, Modals } from '../../js/router.js';
    const { Button, InputBox, DropDown, MessageBox } = Components;
    
	//Utils
    import { pubFromPriv, keysFromNew, validateAddress } from '../../js/crypto/wallets.js';
    import { encryptStrHash, decryptStrHash, stripCoinRef } from '../../js/utils.js';

	//Context
    const { closeModal } = getContext('app_functions');
    const { nextPage, setMessage } = getContext('coinadd_functions');
    
    //DOM NODES
    let formObj
    
    let returnMessage = {type:'', text:''};
    let selectedInput;
    let keyAttributes = {publicKey: '', privateKey: '', nickname: '' };
    let keyPair = {};
    let addType = 1;

    returnMessage.buttons = [
            {name: 'Home', click: () => closeModal(), class: 'button__solid button__purple'},
            {name: 'Add Another', click: () => currentStep = 1, class: 'button__solid'}
        ]

    $: buttonGroup = [
            {name: 'Create New', click: () => addType = 1, class: addType === 1 ? ' button__purple ' : '' },
            {name: 'Add Existing', click: () => addType = 2, class: addType === 2 ? ' button__purple ' : '' },
            {name: 'Track Address', click: () => addType = 3, class: addType === 3 ? ' button__purple ' : '' }
        ]

    $: supportedCoinsList = createCoinList();
    $: selected = selectedInput ? selectedInput.value : selectedInput;

    async function handleSubmit(){
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

    function sendMessage(){
        if (returnMessage.type !== 'error' && returnMessage.type !== 'warning') {
            returnMessage.type = 'success';
            returnMessage.text = `${selected.name} (${selected.symbol}) Wallet Added Successfully`;
        }
        setMessage(returnMessage)
    }

    function reValidateInputBox(){
        keyAttributes.privateKey = "";
        keyAttributes.publicKey = "";
    }

    function validateInputBox(node){
        node.setCustomValidity('');
        try{
            if (addType === 2) {
                keyPair.vk = pubFromPriv(selected.network, selected.symbol, keyAttributes.privateKey);
                keyPair.sk = keyAttributes.privateKey;
            }
            if (addType === 3) {
                keyPair.vk = validateAddress(selected.network, keyAttributes.publicKey);
            }
        } catch (e) {
            console.log(e)
            node.setCustomValidity(e);
        }
    }

    function saveKeys(){
        if ($CoinStore.filter(f =>  f.network === selected.network &&
                                    f.symbol === selected.symbol &&
                                    f.vk === keyPair.vk).length > 0){
            returnMessage = {type:'warning', text: "Coin already exists in wallet"}
            return;
        }

        CoinStore.update(coinstore => {
            let nickname = keyAttributes.nickname === '' ? `New ${selected.name} Wallet` : keyAttributes.nickname;
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

</script>
<style>
.coin-add{
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
}
</style>

<form  class="coin-add flex-column" on:submit|preventDefault={() => handleSubmit() } 
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
                <Button classes={`button__solid ${button.class}`} 
                    width={'222px'}
                    name={button.name}
                    click={button.click}
                    tabIndex={"-1"} />
            {/each}        
        </div>
        
        {#if addType === 2}
            <InputBox
                width="100%"
                bind:value={keyAttributes.privateKey}
                label={"Enter Private Key"}
                placeholder={`Private Key`}
                styles={`margin-bottom: 17px;`}
                on:changed={ (e) => validateInputBox(e.detail) }
                spellcheck={false}
                required={true}
            />
        {/if}

        {#if addType === 3}
            <InputBox
                width="100%"
                bind:value={keyAttributes.publicKey}
                label={"Enter Public Key"}
                placeholder={`Public Key`}
                styles={`margin-bottom: 17px;`}
                on:changed={ (e) => validateInputBox(e.detail) }
                spellcheck={false}
                required={true}
            />
        {/if}

        <InputBox
            width="100%"
            bind:value={keyAttributes.nickname}
            placeholder={`Wallet Nickname`}
            label={"Wallet Nickname (Optional)"}
            styles={`margin-bottom: 17px;`}
        />

        <div class={"submit-button-box flex-column"}>
            <input class="button__solid button__purple submit submit-button submit-button-text submit-button-size" type="submit" value="Save">
        </div>
    {/if}
</form>
