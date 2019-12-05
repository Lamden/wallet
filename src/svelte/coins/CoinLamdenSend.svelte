<script>
    import { onMount, setContext, getContext } from 'svelte';

	//Stores
    import { CoinStore, SettingsStore, password } from '../../js/stores/stores.js';

    //Components
    import { Modals, Components }  from '../../js/router.js'
    const { CoinLamdenContract } = Modals
    const { Button } = Components

    //Utils
    import { decryptStrHash } from '../../js/utils.js';
    import * as contract from '../../js/lamden/contract.js'
    //import * as oldContract from '../../js/lamden/oldcontract.js'

    //Context
	const { closeModal } = getContext('app_functions');

	setContext('tx_functions', {
		nextPage: () => nextPage(),
        back: () => currentStep = currentStep -1,
        send: () => submit_tx_to_network( txData.txInfo.contractName,
                                          txData.txInfo.methodName,
                                          stamps,
                                          createArgPaylod(txData.txInfo.args)),
        home: () => currentStep = 1
	});

    //Props
    export let modalData;

    let steps = [
        {page: 'CoinLamdenContract', back: -1, cancelButton: true},
        {page: 'CoinConfirmTx', back: 0, cancelButton: true},
        {page: 'CoinSendingTx', back: -1, cancelButton: false},
        {page: 'ResultBox', back: -1, cancelButton: false}
    ]
    let buttons = [
            {name: 'Home', click: () => closeModal(), class: 'button__solid button__purple'},
            {name: 'New Transaction', click: () => home(), class: 'button__solid'}
        ]
    let currentStep = 1;
    
    let error, status = "";
    let txData = {};
    let resultInfo = {};
    let stamps = 100000;

    $: coin = modalData;


    
    onMount(() => {
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

    function nextPage(){
        currentStep = currentStep + 1
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

    async function submit_tx_to_network (contract_name, func_name, stamps, kwargs){
        let contractTx = new contract.ContractTransaction();
        let txContainer = new contract.ContractTransactionContainer();

        contractTx.create(contract_name, func_name, stamps, kwargs);
        contractTx.sign(decryptStrHash($password, txData.sender.sk))
        console.log(contractTx)
        
        txContainer.create(contractTx.tx);
        console.log(txContainer)

        let tx = txContainer.toBytesPacked();
        console.log(tx)


        await fetch("http://192.168.1.141:8000/", {method: 'post', data: tx})
            .then(res => {
                    txData.result = res;
                    return res.json();
            })
            .then(res => {
                if (res.error)  handleError(res);
                else handleSuccess();
            })
            .catch(err => console.log(error))
    }

    function handleError(res){
        txData.result.error = res.error;
        resultInfo = {
            title: 'Transaction Failed to Send',
            subtitle: txData.result.error,
            message: 'Transaction Failed',
            type: 'error',
            buttons
        }
        nextPage()
    }

    function handleSuccess(){
        resultInfo = {
            title: 'Transaction Sent Successfully',
            subtitle: `Your ${coin.symbol} transaction was sent and should take 7 seconds to process`,
            message: 'Transaction Sent',
            type: 'success',
            buttons
        }
        nextPage()
    }

    function send(tx){
        return new Promise(function(resolve, reject) {
            var xhr = new XMLHttpRequest();

            xhr.onload = function() {

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

    function saveTxDetails(e){
        txData = {...e.detail};
        currentStep = currentStep + 1; 
    }

    function createTxDetails(){
        let txDetails = [
            {name:'Contract Name', value:txData.txInfo.contractName},
            {name:'Function', value:txData.txInfo.methodName}
        ]
        Object.entries(txData.txInfo.args).map(arg => {
            txDetails.push({name: arg[0], value: arg[1]})
            return arg;
        })
        return txDetails
    }

    function createArgPaylod(args){
        let payload = {};
        Object.keys(txData.txInfo.args).forEach((arg) => {
            payload[arg] = {};
            payload[arg].value = `${txData.txInfo.args[arg]}`;
            payload[arg].type = 'text';
        })
        return payload;
    }
</script>

<CoinLamdenContract {coin} currentPage={steps[currentStep - 1].page} on:contractDetails={(e) => saveTxDetails(e)} />
{#if currentStep > 1}
    <svelte:component this={Modals[steps[currentStep - 1].page]} result={resultInfo} {coin} {txData} txDetails={createTxDetails()}/>
{/if}
{#if steps[currentStep - 1].cancelButton}
    <Button classes={'button__text text-caption'} 
            width={'125px'}
			height={'24px'}
			padding={0}
            name="Cancel" 
            click={() => closeModal()} />
{/if}

