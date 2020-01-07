<script>
    import { setContext, getContext } from 'svelte';

	//Stores
    import { CoinStore, SettingsStore, TxStore, currentNetwork } from '../../js/stores/stores.js';

    //Components
    import { Modals, Components }  from '../../js/router.js'
    const { IdeSubmitContract } = Modals
    const { Button } = Components

    //Context
	const { closeModal } = getContext('app_functions');

	setContext('tx_functions', {
		nextPage: () => nextPage(),
        back: () => currentStep = currentStep -1,
        home: () => currentStep = 1
	});

    //Props
    export let modalData;

    let steps = [
        {page: 'IdeSubmitContract', back: -1, cancelButton: true},
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

    function nextPage(){
        currentStep = currentStep + 1
    }

    function handleError(){
        let stampsUsed = txData.result.stamps_used ? txData.result.stamps_used : 0;
        resultInfo = {
            title: `Transaction Failure`,
            subtitle: `Your ${coin.symbol} transaction returnd an error and used ${stampsUsed} stamps`,
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

    function resultDetails(e){
        txData.result = e.detail;
        if (txData.result.error || txData.result.status_code > 0) {
            handleError()
        }
        else {
            handleSuccess();
        }
        txData.resultInfo = resultInfo;
        txData.network = $currentNetwork;
        storeTransaction();
        if (txData.result.state_changes) Object.keys(txData.result.state_changes).length > 0 ? resultInfo.stateInfo = txData.result.state_changes : null;
        if (txData.result.status_code > 0) resultInfo.errorInfo = txData.result.result.args;
        if (txData.result.error) {
            if (resultInfo.errorInfo) { resultInfo.errorInfo.unshift(txData.result.error); return }
            resultInfo.errorInfo = [txData.result.error]
        } 
        txData.resultInfo.buttons = buttons;
        nextPage();
    }

    function storeTransaction(){
        TxStore.addTx(txData);
    }
</script>

<IdeSubmitContract currentPage={steps[currentStep - 1].page} on:contractDetails={(e) => saveTxDetails(e)} />
{#if currentStep > 1}
    <svelte:component this={Modals[steps[currentStep - 1].page]} 
                      result={resultInfo} 
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

