<script>
    import { setContext, getContext } from 'svelte';

	//Stores
    import { CoinStore, FilesStore, SettingsStore, TxStore, currentNetwork } from '../../js/stores/stores.js';

    //Components
    import { Modals, Components }  from '../Router.svelte';
    const { Button } = Components

    //Context
	const { closeModal } = getContext('app_functions');

	setContext('tx_functions', {
		nextPage: () => nextPage(),
        close: () => closeModal()
	});

    //Props
    export let modalData;

    let steps = [
        {page: 'IdeSubmitContract', back: 0, cancelButton: true},
        {page: 'CoinSendingTx', back: -1, cancelButton: false},
        {page: 'ResultBox', back: -1, cancelButton: false}
    ]
    let buttons = [
            {name: 'Close', click: () => closeModal(), class: 'button__solid button__purple'},
        ]
    let currentStep = 0;
    
    let resultInfo = {};
    let stampLimit = 100000;
    let transaction;
    let txData = {
        txInfo: {
            'contractName': modalData.contractName, 
            'methodName':modalData.methodName, 
            args: modalData.args
        }
    }

    function nextPage(){
        currentStep = currentStep + 1
    }

    function handleError(){
        let stampsUsed = txData.result.stamps_used ? txData.result.stamps_used : 0;
        resultInfo = {
            title: `Transaction Failure`,
            subtitle: `Your ${txData.sender.symbol} transaction returned an error and used ${stampsUsed} stamps`,
            message: 'Transaction Failed',
            type: 'error',
        }
    }

    function handleSuccess(){
        let stampsUsed = txData.result.stamps_used ? txData.result.stamps_used : 0;
        resultInfo = {
            title: 'Transaction Sent Successfully',
            subtitle: `Your ${txData.sender.symbol} transaction was sent successfully using ${stampsUsed} stamps`,
            message: 'Transaction Sent',
            type: 'success',
        }        
    }

    function handleSaveTxDetails(e){
        txData = {...e.detail};
        currentStep = currentStep + 1; 
    }

    function createTxDetails(){
        let txDetails = [
            {name:'Contract Name', value: txData.txInfo.contractName},
            {name:'Function', value: txData.txInfo.methodName},
        ]
        Object.keys(txData.txInfo.args).map(arg => {
            let argValue = txData.txInfo.args[arg]
            txDetails.push({name: arg, value: argValue.value, type: argValue.type})
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
            addFile();
        }
        txData.resultInfo = resultInfo;
        txData.network = $currentNetwork;
        storeTransaction();
        if (txData.result.state_changes) Object.keys(txData.result.state_changes).length > 0 ? resultInfo.stateInfo = txData.result.state_changes : null;
        if (txData.result.status_code > 0) resultInfo.errorInfo = txData.result.result.args;
        else if (txData.result.result !== null) txData.resultInfo.returnValue = txData.result.result;
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

    async function addFile(){
        if (txData.txInfo.args.name){
            let contractInfo = await $currentNetwork.API.getContractInfo(txData.txInfo.args.name.value);
            try {
                let methods = await $currentNetwork.API.getContractMethods(contractInfo.name, contractInfo.code)
                FilesStore.addFile(contractInfo.name, contractInfo.code, methods, $currentNetwork);
            } catch (e) {
               console.log(e)
            }
        }
    }
</script>

<svelte:component   this={Modals[steps[currentStep].page]} 
                    result={resultInfo}
                    {txData}
                    txDetails={createTxDetails()}
                    on:txResult={(e) => resultDetails(e)}
                    on:saveTxDetails={handleSaveTxDetails}/>


