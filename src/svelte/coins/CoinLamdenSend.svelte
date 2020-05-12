<script>
    import { setContext, getContext } from 'svelte';
    //Stores
    import { currentPage } from '../Router.svelte'
    //Components
    import { Modals, Components }  from '../Router.svelte'
    const { CoinLamdenContract } = Modals
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

    $: coin = modalData;

    const nextPage = () => {
        currentStep = currentStep + 1
    }

    const saveTxDetails = (e) => {
        txData = {...e.detail};
        currentStep = currentStep + 1; 
        
    }

    const createTxDetails = () => {
        let txDetails = [
            {name:'Contract Name', value: txData.txInfo.contractName},
            {name:'Method', value: txData.txInfo.methodName},
            {name:'Stamp Limit', value: txData.txInfo.stampLimit}
        ]
        Object.keys(txData.txInfo.kwargs).forEach(arg => {
            let argValue = txData.txInfo.kwargs[arg]
            txDetails.push({name: arg, value: argValue})
        })
        return txDetails
    }

    const resultDetails = (e) => {
        resultInfo = e.detail.resultInfo;
        resultInfo.buttons = buttons;
        nextPage();
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

