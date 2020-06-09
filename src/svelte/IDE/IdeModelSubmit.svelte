<script>
    import { setContext, getContext } from 'svelte';

	//Stores
    import { FilesStore, currentNetwork } from '../../js/stores/stores.js';

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
    let txData = {
        txInfo: {
            'contractName': modalData.contractName, 
            'methodName':modalData.methodName, 
            kwargs: modalData.kwargs
        }
    }

    const nextPage = () => {
        currentStep = currentStep + 1
    }

    const handleSaveTxDetails = (e) => {
        txData = {...e.detail};
        console.log(txData)
        currentStep = currentStep + 1; 
    }

    const createTxDetails = () => {
        let txDetails = [
            {name:'Contract Name', value: txData.txInfo.contractName},
            {name:'Function', value: txData.txInfo.methodName},
        ]
        Object.keys(txData.txInfo.kwargs).map(arg => {
            let argValue = txData.txInfo.kwargs[arg]
            txDetails.push({name: arg, value: argValue})
            return arg;
        })
        return txDetails
    }

    const resultDetails = (e) => {
        resultInfo = e.detail.resultInfo;
        if (resultInfo.type === 'success') addFile()
        resultInfo.buttons = buttons;
        nextPage();
    }

    const addFile = async () => {
        let contractName = ''
        try {
            contractName = txData.txInfo.args.name;
        } catch (e) {
            return
        }

        if (txData.txInfo.args.name){
            let contractInfo = await $currentNetwork.API.getContractInfo(contractName);
            try {
                let methods = await $currentNetwork.API.getContractMethods(contractInfo.name, contractInfo.code)
                FilesStore.addFile(contractInfo.name, contractInfo.code, methods, $currentNetwork);
            } catch (e) {}
        }
    }
</script>

<svelte:component   this={Modals[steps[currentStep].page]} 
                    result={resultInfo}
                    {txData}
                    txDetails={createTxDetails()}
                    on:txResult={(e) => resultDetails(e)}
                    on:saveTxDetails={handleSaveTxDetails}/>


