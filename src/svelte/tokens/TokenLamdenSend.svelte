<script>
    import { setContext, getContext } from 'svelte';
    import { Encoder } from 'lamden-js'

    //Components
    import { Modals, Components }  from '../Router.svelte'
    const { CoinLamdenContract } = Modals
    const { Button } = Components

    //Stores
    import { TokenBalancesStore, currentNetwork, networkKey, coinsDropDown  } from '../../js/stores/stores.js'

    //Misc
    import { displayBalanceToFixed, formatAccountAddress } from '../../js/utils.js'

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
            {name: 'Home', click: () => closeModal(), class: 'button__solid button__primary'},
            {name: 'New Transaction', click: () => currentStep = 1, class: 'button__solid'}
        ]
    let currentStep = 1;
    
    let error, status = "";
    let txData = {};
    let resultInfo = {};

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

    const nextPage = () => {
        currentStep = currentStep + 1
    }

    const createAccountList = (netKey, tokenBalancesStore, coinsDropDown) => {
        if (!tokenBalancesStore[netKey] || !coinsDropDown) return emptyAccountDropDown
        let returnList = coinsDropDown.filter(f => {
            if (!f.value) return false
            if (!tokenBalancesStore[netKey][f.value.vk]) return false
            if (!tokenBalancesStore[netKey][f.value.vk][token.contractName]) return false
            let balance = Encoder('bigNumber', tokenBalancesStore[netKey][f.value.vk][token.contractName])
            if (balance.isGreaterThan(0)) return true
            return false
        }).map(c => {
            if (c.value && coin){
                c.selected = c.value.network === coin.network && c.value.symbol === coin.symbol && c.value.vk === coin.vk
            }
            c.name = `
                ${formatAccountAddress(c.value.vk, 10, 4)} - ${c.value.nickname}:
                ${displayBalanceToFixed(tokenBalancesStore[netKey][c.value.vk][token.contractName], 8)} 
                ${token.tokenSymbol}
            `
            return c
        })
        return returnList
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
    <CoinLamdenContract 
        {coin} 
        {accountList}
        startingContract={token.contractName}
        startingMethod={txMethod}
        currentPage={steps[currentStep - 1].page} 
        on:contractDetails={(e) => saveTxDetails(e)} 
    />
    {#if currentStep > 1}
        <svelte:component this={Modals[steps[currentStep - 1].page]} 
                        result={resultInfo} 
                        {coin} 
                        {accountList}
                        {txData} 
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