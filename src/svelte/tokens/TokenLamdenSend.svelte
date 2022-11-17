<script>
    import { setContext, getContext, onMount } from 'svelte';
    import lamden from 'lamden-js';
    const { Encoder } = lamden;

    //Components
    import { Modals, Components }  from '../Router.svelte'
    const { CoinLamdenContract, CoinLamdenSimpleContract } = Modals
    const { Button } = Components

    //Stores
    import { TokenBalancesStore, currentNetwork, networkKey, coinsDropDown  } from '../../js/stores/stores.js'

    //Misc
    import { displayBalanceToFixed, formatAccountAddress, isLamdenKey } from '../../js/utils.js'

    //Context
	const { closeModal } = getContext('app_functions');

	setContext('tx_functions', {
		nextPage: () => nextPage(),
        back: () => back(),
        home: () => currentStep = 1
	});

    //Props
    export let modalData;

    let buferSize = 0.1;

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
            {name: 'New Transaction', click: () =>  reset(), class: 'button__solid'}
        ]
    let currentStep = 1;
    
    let error, status = "";
    let txData = {};
    let resultInfo = {};
    let txui = "simple";  // "simple", "advanced";
    let initstep = 1;

    let message = {
        title: "Are you sure to continue?",
        text: "",
        buttons: [
            {name: 'Continue', click: () => nextPage(), class: 'button__solid button__primary'},
            {name: 'Back', click: () => back(), class: 'button__solid button_secondary'
        }]
    }

    $: netKey = networkKey($currentNetwork)
    $: token = modalData.token;
    $: coin = modalData.coin;
    $: txMethod = modalData.txMethod;
    $: accountList = createAccountList(netKey, $TokenBalancesStore, $coinsDropDown)
    $: emptyAccountDropDown = [{
        value: null,
        name: `No acounts with ${token.tokenSymbol} balances.`,
        selected: true
    }]

    onMount(() => {
        if (txMethod === "transfer") {
            currentStep = 1;
            initstep = 1;
        } else {
            currentStep = 2;
            initstep = 2;
        }
    });

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

    const reset = () => {
        if (txMethod === "transfer") {
            currentStep = 1;
            initstep = 1;
        } else {
            currentStep = 2;
            initstep = 2;
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

    const createAccountList = (netKey, tokenBalancesStore, coinsDropDown) => {
        if (!tokenBalancesStore[netKey] || !coinsDropDown) return emptyAccountDropDown
        let returnList = coinsDropDown.filter(f => {
            if (!f.value) return false
            if (f.value.sk === "watchOnly") return false
            if (!tokenBalancesStore[netKey][f.value.vk]) return false
            if (!tokenBalancesStore[netKey][f.value.vk][token.contractName]) return false
            let balance = Encoder('bigNumber', tokenBalancesStore[netKey][f.value.vk][token.contractName])
            if (balance.isGreaterThan(0)) return true
            return false
        }).map(c => {
            let selected = false
            let name = ""
            if (c.value && coin){
                selected = c.value.network === coin.network && c.value.symbol === coin.symbol && c.value.vk === coin.vk
            }
            name = `
                ${formatAccountAddress(c.value.vk, 10, 4)} - ${c.value.nickname}:
                ${displayBalanceToFixed(tokenBalancesStore[netKey][c.value.vk][token.contractName], 8)} 
                ${token.tokenSymbol}
            `
            return {
                ...c,
                name,
                selected
            }
        })
        return returnList
    }

    const saveTxDetails = (e) => {
        txData = {...e.detail};
        if(e.type === "contractDetails") {
            txui = "advanced";
        }
        if ($currentNetwork.blockservice.host) {
            fetch(`${$currentNetwork.blockservice.host}/stamps/estimation`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(makeTx(txData.txInfo)),
            }).then(r => r.json()).then(d => {
                if (d.status === 0) {
                    txData.txInfo.stampLimit = Math.ceil(d['stamps_used'] * (buferSize + 1))
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
        } else {
            if (txData.txInfo && txData.txInfo.kwargs && txData.txInfo.kwargs.to){
                message.text = `The receiving address ${txData.txInfo.kwargs.to} is not a valid Lamden address. Proceeding could result in a loss of funds. Continue?`
                if (!isLamdenKey(txData.txInfo.kwargs.to)) {
                    currentStep = 3
                    return
                }
            }
            currentStep = 4
        }
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
        resultInfo = e.detail.resultInfo;
        resultInfo.buttons = buttons;
        if (resultInfo.stampsUsed > 0) modalData.refreshTx();
        nextPage();
    }
</script>
{#if accountList}
    {#if currentStep === 1}
        <CoinLamdenSimpleContract 
            {token} 
            {accountList}
            startingContract={token.contractName}
            currentPage={steps[currentStep - 1].page} 
            on:contractSimpleDetails={(e) => saveTxDetails(e)} 
        />
    {/if}
    {#if currentStep === 2}
        <CoinLamdenContract 
            {coin} 
            {accountList}
            startingContract={token.contractName}
            startingMethod={txMethod}
            currentPage={steps[currentStep - 1].page} 
            on:contractDetails={(e) => saveTxDetails(e)} 
        />
    {/if} 
    {#if currentStep > 2}
        <svelte:component this={Modals[steps[currentStep - 1].page]} 
                        result={resultInfo} 
                        {coin} 
                        {accountList}
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
{/if}