<script>
    import { setContext, getContext } from 'svelte';

	//Stores
    import { CoinStore, SettingsStore } from '../../js/stores/stores.js';

    //Components
    import { Modals, Components }  from '../../js/router.js'
    const { CoinLamdenContract } = Modals
    const { Button } = Components

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
            {name: 'New Transaction', click: () => currentStep = 1, class: 'button__solid'}
        ]
    let currentStep = 1;
    
    let error, status = "";
    let txData = {};
    let resultInfo = {};
    let stamps = 100000;
    let transaction;

    $: coin = modalData;

    function nextPage(){
        currentStep = currentStep + 1
    }

    function handleError(){
        resultInfo = {
            title: 'Transaction Failed to Send',
            subtitle: txData.result.error,
            message: 'Transaction Failed',
            type: 'error',
        }
    }

    function handleSuccess(){
        let stampsUsed = txData.result.stamps_used ? txData.result.stamps_used : 0;
        resultInfo = {
            title: 'Transaction Sent Successfully',
            subtitle: `Your ${coin.symbol} transaction was sent successfully using ${stampsUsed} stamps`,
            message: 'Transaction Sent',
            type: 'success',
        }        
    }

    function saveTxDetails(e){
        txData = {...e.detail};
        currentStep = currentStep + 1; 
    }

    function createTxDetails(){
        let txDetails = [
            {name:'Contract Name', value: txData.txInfo.contractName},
            {name:'Function', value: txData.txInfo.methodName},
            {name:'Stamp Limit', value: txData.txInfo.stampLimit}
        ]
        Object.keys(txData.txInfo.args).map(arg => {
            let argValue = txData.txInfo.args[arg]
            txDetails.push({name: `${arg} (${argValue.type})`, value: argValue.value})
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

    function resultDetails(e){
        txData.result = e.detail;
        if (txData.result.error) {handleError(); return}
        handleSuccess();
        txData.resultInfo = resultInfo;
        storeTransaction();
        if (txData.result.state_changes) resultInfo.stateInfo = txData.result.state_changes;
        txData.resultInfo.buttons = buttons;
        nextPage();
    }

    function storeTransaction(){
        CoinStore.updateCoinTransaction(txData);
    }
</script>

<CoinLamdenContract {coin} currentPage={steps[currentStep - 1].page} on:contractDetails={(e) => saveTxDetails(e)} />
{#if currentStep > 1}
    <svelte:component this={Modals[steps[currentStep - 1].page]} 
                      result={resultInfo} 
                      {coin} 
                      {txData} 
                      txDetails={createTxDetails()}
                      on:txResult={(e) => resultDetails(e)}/>
{/if}
{#if steps[currentStep - 1].cancelButton}
    <Button classes={'button__text text-caption'} 
            width={'125px'}
			height={'24px'}
			padding={0}
            name="Cancel" 
            click={() => closeModal()} />
{/if}
