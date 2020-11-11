<script>
    import { setContext, getContext } from 'svelte';

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
        {page: 'IdeMethodTx', back: 0, cancelButton: true},
        {page: 'CoinSendingTx', back: -1, cancelButton: false},
        {page: 'ResultBox', back: -1, cancelButton: false}
    ]
    let buttons = [
            {name: 'Close', click: () => closeModal(), class: 'button__solid button__primary'},
        ]
    let currentStep = 0;
    
    let resultInfo = {};
    let stampLimit = 100000;
    let txData = {
        txInfo: modalData
    }

    const nextPage = () => {
        currentStep = currentStep + 1
    }

    const handleSaveTxDetails = (e) => {
        txData = {...e.detail};
        currentStep = currentStep + 1; 
    }

    const createTxDetails = () => {
        let txDetails = [
            {name:'Contract Name', value: txData.txInfo.contractName},
            {name:'Function', value: txData.txInfo.methodName},
        ]
        Object.keys(txData.txInfo.kwargs).map(arg => {
            let argValue = txData.txInfo.kwargs[arg]
            txDetails.push({name: `${arg}`, value: JSON.stringify(argValue)})
            return arg;
        })
        return txDetails
    }

    const resultDetails = (e) => {
        resultInfo = e.detail.resultInfo;
        resultInfo.buttons = buttons;
        nextPage();
    }

</script>

<svelte:component   this={Modals[steps[currentStep].page]} 
                    result={resultInfo}
                    {txData}
                    txDetails={createTxDetails()}
                    on:txResult={(e) => resultDetails(e)}
                    on:saveTxDetails={handleSaveTxDetails}/>
