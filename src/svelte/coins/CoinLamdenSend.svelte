<script>
    import { setContext, getContext } from 'svelte';
    //Stores
    import { currentPage } from '../Router.svelte'
    import { currentNetwork } from '../../js/stores/stores.js';
    //Components
    import { Modals, Components }  from '../Router.svelte'
    const { CoinLamdenContract, CoinLamdenSimpleContract } = Modals
    const { Button } = Components

    //Utils
    import { isLamdenKey } from '../../js/utils.js';

    //Context
	const { closeModal } = getContext('app_functions');

	setContext('tx_functions', {
		nextPage: () => nextPage(),
        back: () => back(),
        home: () => currentStep = 1
	});

    //Props
    export let modalData;

    let steps = [
        {page: 'CoinLamdenSimpleContract', back: -1, cancelButton: true},
        {page: 'CoinLamdenContract', back: -1, cancelButton: true},
        {page: 'ConiLamdenSendWarningBox', back: -1, cancelButton: true},
        {page: 'CoinConfirmTx', back: 0, cancelButton: true},
        {page: 'CoinSendingTx', back: -1, cancelButton: false},
        {page: 'ResultBox', back: -1, cancelButton: false}
    ]
    let buttons = [
            {name: 'Home', click: () => closeModal(), class: 'button__solid button__primary'},
            {name: 'New Transaction', click: () => currentStep = 1, class: 'button__solid'}
        ]
    let message = {
            title: "Are you sure to continue?",
            text: "",
            buttons: [
                {name: 'Continue', click: () => nextPage(), class: 'button__solid button__primary'},
                {name: 'Back', click: () => back(), class: 'button__solid button_secondary'
            }]
        }
    let currentStep = 1;
    
    let error, status = "";
    let txData = {};
    let resultInfo = {};
    let txui = "simple";  // "simple", "advanced";
    let txallInfo; // used to retry fetch result

    let buferSize = 0.05;

    $: coin = modalData.coin;

    const makeTx = (data) => {
        return {
            "payload": {
                "contract": data.contractName,
                "function": data.methodName,
                "kwargs": data.kwargs,
                "sender": data.senderVk,
            }
        }
    }
    
    const nextPage = () => {
        currentStep = currentStep + 1
    }

    const back = () => {
        if (currentStep === 3 || currentStep === 4){
            if (txui === "simple") {
                currentStep = 1
            } else {
                currentStep = 2
            }
            return
        }
        currentStep = currentStep -1
    }

    const saveTxDetails = (e) => {
        txData = {...e.detail};
        if(e.type === "contractDetails") {
            txui = "advanced";
        }

        fetch(`${$currentNetwork.blockservice.host}/stamps/estimation`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(makeTx(txData.txInfo)),
        }).then(r => r.json()).then(d => {
            if (d.status === 0) {
                txData.txInfo.stampLimit = Math.ceil(d['stamps_used'] * (1 + buferSize))
                if (txData.txInfo && txData.txInfo.kwargs && txData.txInfo.kwargs.to){
                    message.text = `The receiving address ${txData.txInfo.kwargs.to} is not a valid Lamden address. Proceeding could result in a loss of funds. Continue?`
                    if (!isLamdenKey(txData.txInfo.kwargs.to)) {
                        currentStep = 3
                        return
                    }
                }
                currentStep = 4
            } else {
                let group = d.result.match(/Error\(['"].*['"],\)/)
                if (group.length > 0) {
                    resultInfo.errorInfo = []
                    resultInfo.errorInfo[0] = group[0].slice(7, -3)
                }
                resultInfo.buttons = [
                    {name: 'Home', click: () => closeModal(), class: 'button__solid button__primary'},
                    {name: 'Back', click: () => txui === "simple" ? currentStep = 1 : currentStep = 2, class: 'button__solid'}
                ]
                resultInfo.title = `Transaction Failed`
                resultInfo.subtitle = `Your transaction will fail, please edit and then resend the transaction`
                resultInfo.type = 'error'
                currentStep = 6
            }
        })
    }

    const createTxDetails = () => {
        let txDetails = [
            {name:'Contract Name', value: txData.txInfo.contractName},
            {name:'Method', value: txData.txInfo.methodName},
            {name:'Stamp Limit', value: txData.txInfo.stampLimit}
        ]
        Object.keys(txData.txInfo.kwargs).forEach(arg => {
            
            let argValue = txData.txInfo.kwargs[arg]
            //let argType = txData.txInfo.kwargs[arg]
            txDetails.push({name: arg, value: argValue})
        })
        return txDetails
    }

    const resultDetails = (e) => {
        txallInfo = e.detail
        resultInfo = e.detail.resultInfo;
        if (resultInfo.statusCode === 2) {
            buttons.pop()
            buttons.push({name: 'Check Again', click: () =>  back(), class: 'button__solid button__primary'})
        }
        resultInfo.buttons = buttons;
        resultInfo.txHash = e.detail.txHash;
        if (resultInfo.stampsUsed > 0) modalData.refreshTx();
        nextPage();
    }
</script>

{#if currentStep === 1}
    <CoinLamdenSimpleContract 
        {coin} 
        currentPage={steps[currentStep - 1].page} 
        on:contractSimpleDetails={(e) => saveTxDetails(e)} 
    />
{/if}
{#if currentStep === 2}
    <CoinLamdenContract 
        {coin} 
        currentPage={steps[currentStep - 1].page} 
        on:contractDetails={(e) => saveTxDetails(e)} 
    />
{/if}
{#if currentStep > 2}
    <svelte:component this={Modals[steps[currentStep - 1].page]} 
                      result={resultInfo} 
                      {txallInfo}
                      {coin} 
                      {txData}
                      {message}
                      txDetails={createTxDetails()}
                      on:txResult={(e) => resultDetails(e)}/>
{/if}
{#if steps[currentStep - 1].cancelButton}
    <Button classes={'button__text text-caption'} 
            id="transfer-modal-cancel"
            width={'125px'}
			height={'24px'}
			padding={0}
            name="Cancel" 
            click={() => closeModal()} />
{/if}

