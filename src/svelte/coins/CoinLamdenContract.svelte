<script>
    import whitelabel from '../../../whitelabel.json'
    
    import { onMount} from 'svelte';
    import { writable } from 'svelte/store';

    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

	//Stores
    import { coinsDropDown, currentNetwork, BalancesStore } from '../../js/stores/stores.js';

    //Components
    import { Components }  from '../Router.svelte'
    const { DropDown, InputBox, Button, Kwargs } = Components;

    //Utils
    import { formatKwargs, displayBalance } from '../../js/utils.js'

    //DOM NODES
    let stampsField, contractNameField

    //Props
    export let coin;
    export let currentPage;
    export let accountList;
    export let startingContract;
    export let startingMethod;

    const MethodStore = writable([])
    const MethodArgsStore = writable([])
    let initializedStartingMethod = false;
    let selectedWallet;
    let kwargs  = []

    $: contractName = 'currency'
    $: methodName  = ''
    $: argValueTracker = {};
    $: balance = !selectedWallet ? '0' : displayBalance(BalancesStore.getBalance($currentNetwork, selectedWallet.vk)) || '0'
    $: stampLimit = ''

    onMount(() => {
        getMethods(contractName)
    });

    const coinList = () => {
        let returnList = $coinsDropDown.filter(f => f.value && f.value.sk !== "watchOnly").map(c => {
            if (c.value){
                c.selected = c.value.network === coin.network && c.value.symbol === coin.symbol && c.value.vk === coin.vk
            }
            return c
        })
        return returnList
    }

    const methodList = (methods) => {
        if (!methods) return [];
        let returnList = methods.map(method => {
            return {
                value: method,
                name: `${method.name}`,
            }
        })
        if (startingMethod && !initializedStartingMethod){
            returnList.map(method => {
                if (method.value.name === startingMethod) method.selected = true;
                return method;
            })
        }
        return returnList
    }

    const setArgs = (method) => {
        MethodArgsStore.set(method.arguments);
        methodName = method.name
        kwargs = [];
    }

    const saveArgValue = (arg, e) => {
        if (arg.type === 'bool')  argValueTracker[contractName][methodName][arg.name].value = e.detail.target;
        if (arg.type === 'int') argValueTracker[contractName][methodName][arg.name].value = parseInt(e.detail.target.value)
        if (arg.type === 'float') argValueTracker[contractName][methodName][arg.name].value = e.detail.target.value.toString()
        else argValueTracker[contractName][methodName][arg.name].value = e.detail.target.value
    }

    const getMethods = async (contract) => {
        let methods = await $currentNetwork.API.getContractMethods(contract)
        MethodStore.set(methods)
        if (methods.length > 0) setArgs(methods[0], contract)
    }

    const handleNext = () => {
        console.log(kwargs);
        dispatch('contractDetails', {
            sender: selectedWallet,
            txInfo: {
                senderVk: selectedWallet.vk,
                stampLimit,
                'contractName': contractNameField.value, 
                methodName, 
                'kwargs': formatKwargs(kwargs)
            }
        })
    }

    const clearValidation = (e) => {
        e.detail.target.setCustomValidity('')
        e.detail.target.reportValidity();
    }

    const handleSelectedWallet = (e) => {
        selectedWallet = e.detail.selected.value
    }

    const handleNewArgValues = (e) => {
        kwargs = e.detail.argumentList        
    }
</script>

<style>
    .send-lamden{
        width: 525px;
        background: inherit;
    }
    .coin-info{
        align-self: flex-end;
    }
    
    .contract-details{
        padding: 0 4rem 0 0;
        margin-right: 1rem;
        border-right: 1px solid var(--divider-light);
        background: inherit;
    }

    .buttons{
        padding-top: 27px;
        display: flex;
        justify-content: center;
        align-items: flex-end;
    }

    .hide{
        display: none;
    }
    p{
        margin: 0.5rem 0 1rem;
    }
</style>

<div class="send-lamden flex-column" class:hide={currentPage !== 'CoinLamdenContract'}>
    <h2> Make a {whitelabel.companyName} Transaction</h2>
    <DropDown  
        items={accountList || coinList()} 
        id={'mycoins'} 
        label={'Select Account to Send From'}
        required={true}
        on:selected={(e) => handleSelectedWallet(e)}
    />

    <p class="coin-info text-subtitle2">
        {#if selectedWallet}
            {`${balance} ${$currentNetwork.currencySymbol}`}
        {/if}
    </p>

    <div class="contract-details">
        {#if !$currentNetwork.blockservice.host} 
            <InputBox
                id="stamp-input"
                width="100%"
                bind:value={stampLimit}
                bind:thisInput={stampsField}
                label={"Stamp Limit"}
                margin="0 0 1rem 0"
                inputType={"number"}
                required={true}
            />
        {/if}
        <InputBox
            id="contract-input"
            width="100%"
            value={startingContract || contractName}
            bind:thisInput={contractNameField}
            label={"Enter Contract Name"}
            margin="0 0 1rem 0"
            on:changed={(e) => getMethods(e.detail.target.value)}
            on:keyup={(e) => clearValidation(e)}
            required={true}
        />
        {#if $MethodStore.length === 0 }
            <DropDown id="no-methods-dd"  label={'Function Name'}  defaultText={'No Functions'}/>
        {:else}
            <DropDown
                items={methodList($MethodStore)} 
                id={'methods'}
                label={'Choose Function to Run'} 
                margin="0 0 2rem 0"
                required={true}
                on:selected={(e) => setArgs(e.detail.selected.value, contractNameField.value)} />

            <h3>Transaction Arguments</h3>
            {#if $MethodArgsStore.length > 0}
                <Kwargs argumentList={$MethodArgsStore} on:newArgValues={handleNewArgValues}/>
            {:else}
                <p>This function takes no arguments</p>
            {/if}
            
        {/if}
    </div>

    <div class="buttons">
        <Button id="lamden-tx-next-btn"
                classes={'button__solid button__primary'} 
                width={'232px'}
                margin={'0 0 17px 0'}
                name="Next" 
                click={() => handleNext()} />
    </div>
</div>


