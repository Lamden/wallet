<script>
    import { getContext, onMount, beforeUpdate, afterUpdate, tick} from 'svelte';

	//Stores
    import { CoinStore, SettingsStore, password } from '../../js/stores/stores.js';

    //Components
    import { Components }  from '../../js/router.js'
    const { DropDown, InputBox, Button } = Components;
    
    //Utils
    import { decryptStrHash } from '../../js/utils.js';
    import * as contract from '../../js/lamden/contract.js'
    import * as oldContract from '../../js/lamden/oldcontract.js'

    //DOM NODES
    let formObj1

    //Context
    const { switchPage } = getContext('app_functions');

    //Props
    export let modalData;

    let error, status = "";
    let value = 0;
    let reciever_address = '';
    let txData = {};
    let selectedWallet;
    let contractError = false;
    let contractMethods;

    $: coin = modalData;
    $: symbol = coin.symbol;
    $: balance = coin.balance ? coin.balance : 0;
    $: contractName = 'currency'
    $: methodArgs = [];
    
    onMount(() => {
        contractMethods = getMethods(contractName)

        let kwargs = {
            'amount': {
                'value': 2000,
                'type': 'fixedPoint'
            },
            'to': {
                'value': '3d093133af5b54b4af9c52cc9b556aa495583c8c193f1060190b7d74e98c4416',
                'type': 'text'
            }
        }
        /*
        submit_tx_to_network('currency', 'transfer', 50000, kwargs)
        submit_tx_to_network2(
            decryptStrHash($password, coin.sk),
            30000,
            coin.vk + 'B'.repeat(64),
            '3d093133af5b54b4af9c52cc9b556aa495583c8c193f1060190b7d74e98c4416',
            2000
        )
        */
    });

    function coinList(){
        return $CoinStore.map(coin => {
            return {
                value: coin,
                name: `${coin.nickname} - ${coin.vk.substring(1, 55 - coin.nickname.length)}...`,
            }
        })
    }

    function methodList(methods){
        if (!methods) return [];
        return methods.map(method => {
            return {
                value: method,
                name: `${method.name}`,
            }
        })
    }

    function setArgs(args){
        if (!args) return
        methodArgs = [...args]
    }

    function getMethods(contract){
        return fetch(`http://192.168.1.141:8000/contracts/${contract}/methods`)
                    .then(res => res.json())
                    .then(res => {
                        if (!res.methods) contractError = true;
                        contractError = false;
                        setArgs(res.methods[0].arguments)
                        return res.methods
                    })

    }

    function submit_tx_to_network2(wallet_sk, txStamps, nonce, txDestination, txAmount){
        var cct = new oldContract.CurrencyContractTransaction();
        var tx = cct.create(wallet_sk, txStamps, nonce, txDestination, txAmount);
        var tc = new oldContract.CurrencyTransactionContainer();
        tc.create(tx);

        var tcbytes = tc.toBytesPacked();

        send(tcbytes)
            .then(res => handleResponse(res)  )
    }

    function submit_tx_to_network (contract_name, func_name, stamps, kwargs){
        let contractTx = new contract.ContractTransaction();
        let txContainer = new contract.ContractTransactionContainer();

        contractTx.create(contract_name, func_name, stamps, kwargs);
        contractTx.sign(decryptStrHash($password, coin.sk))
        console.log(contractTx)
        
        txContainer.create(contractTx.tx);
        console.log(txContainer)

        let tx = txContainer.toBytesPacked();
        console.log(tx)

        send(tx)
            .then(res => handleResponse(res)  )

        /*
        fetch("http://192.168.1.141:8000/", {
            method: 'post',
            data: tx
        })
            .then(res => handleResponse(res))
            .catch(err => handleError(err))
          */  
    }

    function send(tx){
        return new Promise(function(resolve, reject) {
            var xhr = new XMLHttpRequest();

            xhr.onload = function() {
                console.log(xhr)
                if (xhr.readyState == xhr.DONE) {
                    if (xhr.status === 200) {
                        var data = JSON.parse(xhr.responseText);
                        resolve(data);
                    }
                }
            }
            
            xhr.onerror = reject;
            xhr.timeout = 60000;
            xhr.open('POST', 'http://192.168.1.141:8000/', true); 
            xhr.send(tx);
        });
    }

    function handleResponse(res){
        console.log(res)
    }

    function handleError(err){
        console.log(err)
    }

    function handleNext(){
        console.log('next')
    }
</script>

<style>
    .send-lamden{
        display: flex;
        flex-direction: column;
        overflow: hidden;
        min-height: 804px;
        width: 100%;
    }

    .coin-info{
        height: 18px;
    }

    .contract-details{
        overflow-y: auto;
        overflow-x: hidden;
        max-height: 400px;
        padding: 28px 103px 57px 0;
        margin-right: 25px;
        border-right: 1px solid var(--font-primary-dark)
    }

    .buttons{
        flex-grow: 1;
        display: flex;
        justify-content: center;
        align-items: flex-end;
    }

</style>

{#if error}{error}{:else}{status}{/if}
<div class="send-lamden">
    <h5> {`Send Lamden ${coin.name}`} </h5>
    <DropDown  
        items={coinList()} 
        id={'mycoins'} 
        label={'Select Wallet to Send From'}
        styles="margin-bottom: 19px;"
        required={true}
        on:selected={(e) => selectedWallet = e.detail.selected.value}
    />

    <div class="coin-info text-subtitle3">
        {#if selectedWallet}
            {`${selectedWallet.name} - ${!selectedWallet.balance ? 0 : selectedWallet.balance} ${selectedWallet.symbol}`}
        {/if}
    </div>

    <div class="contract-details">
        <InputBox
            width="100%"
            value= {contractName}
            label={"Enter Contract Name"}
            styles={`margin-bottom: 17px;`}
            on:changed={(e) => contractMethods = getMethods(e.detail.value)}
            required={true}
        />
        <div class="args">
            {#await contractMethods }
                <DropDown  label={'Functions'} />
            {:then methods}
                <DropDown  
                    items={methodList(methods)} 
                    id={'methods'} 
                    label={'Function Name'} 
                    styles={`margin-bottom: 40px;`}
                    required={true}
                    on:selected={(e) => setArgs(e.detail.selected.value.arguments)}
                />
                {#each methodArgs as arg, index}
                    <InputBox
                            id={index}
                            width="100%"
                            label={arg}
                            on:changed={(e) => console.log(e.detail.value)}
                            required={true}
                    />        
                {/each}
            {:catch}
                <DropDown  label={'Functions'} />
            {/await}
        </div>

    </div>
    <div class="buttons">
        <Button classes={'button__solid button__purple'} 
                width={'232px'}
                height={'36px'}
                margin={'0 0 17px 0'}
                name="Next" 
                click={() => handleNext()} />
    </div>
</div>


