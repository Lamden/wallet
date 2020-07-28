<script>
    import { onMount} from 'svelte';
    import { writable } from 'svelte/store';
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();


	//Stores
    import { coinsDropDown, currentNetwork, BalancesStore } from '../../js/stores/stores.js';

    //Components
    import { Components }  from '../Router.svelte'
    const { DropDown, InputBox, Button } = Components;

    //Utils
    import * as validators from 'types-validate-assert'
    const { validateTypes } = validators;

    //DOM NODES
    let stampsField, contractNameField

    //Props
    export let coin;
    export let currentPage;

    const MethodStore = writable([])
    const trueFalseList = (arg = undefined) => {
        if (arg == null) return [{name:'true', value: true}, {name: 'false', value:false}]
        let selectedValue = argValueTracker[contractName][methodName][arg]['bool'].value
        return [
            {name:'true', value: true, selected: selectedValue === true}, 
            {name: 'false', value:false, selected: selectedValue === false}
        ]
    }

    let selectedWallet;
    let contractError = false;
    let transaction;

    let jsonTypes = ['dict', 'list']
    let typeToInputTypeMAP = {
        Any: 'textarea',
        str: 'text',
        float: 'number',
        int: 'number',
        bool: trueFalseList(),
        dict: 'textarea',
        list: 'textarea',
        timedelta: 'text', 
        datetime: 'text'
    }
    // TODO: ADD ALL TYPES {'dict', 'list', 'str', 'int', 'float', 'bool', 'timedelta', 'datetime', 'Any'}
    let defaultValues = {
        str: '',
        float: 0.0,
        int: 0,
        bool: true,
        dict: "{}",
        list: "[]",
        Any: '',
        timedelta: '', 
        datetime: ''
    }
    let longFormTypes = {
        str: 'text',
        float: 'decimal',
        int: 'integer',
        bool: 'true/false',
        Any: 'any',
        dict: 'Object (JSON)',
        list: 'List (JSON)',
        timedelta: 'timedelta', 
        datetime: 'datetime'
    }

    let stampRatio = 1;

    $: contractName = 'currency'
    $: methodName  = ''
    $: argValueTracker = {};
    $: methodArgs = [];
    $: balance = !selectedWallet ? 0 : BalancesStore.getBalance($currentNetwork.url, selectedWallet.vk).toLocaleString('en') || '0'
    $: stampLimit = 0
    
    onMount(() => {
        getMethods(contractName)
        fetch(`${$currentNetwork.blockExplorer}/api/lamden/stamps`)
            .then(res => res.json())
            .then(res => {
                stampRatio = parseInt(res.value)
                determineStamps()
            })
    });

    const determineStamps = () => {
        let maxStamps = stampRatio * 5;
        let bal = BalancesStore.getBalance($currentNetwork.url, selectedWallet.vk)
        if ((bal * stampRatio) < maxStamps) stampLimit = parseInt((bal * stampRatio) * .95 )
        else stampLimit = parseInt(maxStamps)
    }

    const coinList = () => {
        let returnList = $coinsDropDown.map(c => {
            if (c.value){
                c.selected = c.value.network === coin.network && c.value.symbol === coin.symbol && c.value.vk === coin.vk
            }
            return c
        })
        returnList.shift()
        return returnList
    }

    const methodList = (methods) => {
        if (!methods) return [];
        return methods.map(method => {
            return {
                value: method,
                name: `${method.name}`,
            }
        })
    }

    const setArgs = (method, contract) => {
        if (!method) return;
        methodName = method.name;
        if (!argValueTracker[contract]) argValueTracker[contract] = {};
        if (!argValueTracker[contract][methodName]) argValueTracker[contract][methodName] = {};
        
        method.arguments.map(arg => {
            if (!argValueTracker[contract][methodName][arg.name]) {
                argValueTracker[contract][methodName][arg.name] = {
                    type: arg.type,
                    value: defaultValues[arg.type]}
            }
        })
        methodArgs = [...method.arguments];
        contractName = contract;
    }

    const getStartingType = (arg) => {
        let type = 'text';
        let numberArgs = ['number', 'value', 'amount', 'stamps', 'tau', 'decimal']
        numberArgs.map(str => arg.includes(str) ? type = 'number' : null)
        if (type === 'number') return type;
        let addressArgs = ['to', 'from', 'wallet', 'address', 'sender', 'receiver', 'owner', 'public', 'private', 'key']
        addressArgs.map(str => arg.includes(str) ? type = 'address' : null)
        return type;
    }

    const saveArgValue = (arg, e) => {
        if (arg.type === 'bool')  argValueTracker[contractName][methodName][arg.name].value = e.detail.target;
        if (arg.type === 'int') argValueTracker[contractName][methodName][arg.name].value = parseInt(e.detail.target.value)
        if (arg.type === 'float') argValueTracker[contractName][methodName][arg.name].value = parseFloat(e.detail.target.value)
        else argValueTracker[contractName][methodName][arg.name].value = e.detail.target.value
    }

    const getMethods = async (contract) => {
        let methods = await $currentNetwork.API.getContractMethods(contract)
        MethodStore.set(methods)
        if (methods.length > 0) setArgs(methods[0], contract)
    }

    const handleNext = () => {
        if (validateFields()){
            dispatch('contractDetails', {
                sender: selectedWallet,
                txInfo: {
                    senderVk: selectedWallet.vk,
                    stampLimit,
                    'contractName': contractNameField.value, 
                    methodName, 
                    kwargs: getKwargs()
                }
            })
        }
    }

    const validateFields = () => {
        stampsField.setCustomValidity('')
        if (stampLimit <= 0) {
            stampsField.setCustomValidity('Stamps must be greater than 0')
            stampsField.reportValidity()
            return false;
        }
        return true
    }

    const clearValidation = (e) => {
        e.detail.target.setCustomValidity('')
        e.detail.target.reportValidity();
    }

    const getKwargs = () => {
        let kwargs = {}
        Object.keys(argValueTracker[contractName][methodName]).map(arg => {
            const argValue = argValueTracker[contractName][methodName][arg].value
            const argType = argValueTracker[contractName][methodName][arg].type
            
            if (argValue !== ""){
                let newValue = argValue
                if (jsonTypes.includes(argType)) {
                    try{
                        newValue = JSON.parse(argValue)
                    }catch (e) {
                        newValue = `!! INVALID JSON ${longFormTypes[argType].toUpperCase()} !!`
                    }
                }
                else {
                    try{
                        if (argType === 'int') newValue = parseInt(newValue)
                        if (argType === 'float') newValue = parseFloat(newValue)
                    }catch (e) {
                        newValue = `!! INVALID TYPE !!`
                    }
                }
                kwargs[arg] = newValue;
            }
        })
        return kwargs;
    }

    const handleSelectedWallet = (e) => {
        selectedWallet = e.detail.selected.value
        determineStamps();
    }
</script>

<style>
    .send-lamden{
        width: 668px;
    }
    
    .contract-details{
        padding: 28px 103px 0 0;
        margin-right: 25px;
        border-right: 1px solid var(--font-primary-darker)
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
</style>

<div class="send-lamden flex-column" class:hide={currentPage !== 'CoinLamdenContract'}>
    <h5> {`Make A Lamden Transaction`} </h5>
    <DropDown  
        items={coinList()} 
        id={'mycoins'} 
        label={'Select Account to Send From'}
        styles="margin-bottom: 19px;"
        required={true}
        on:selected={(e) => handleSelectedWallet(e)}
    />

    <div class="coin-info text-subtitle3">
        {#if selectedWallet}
            {`${selectedWallet.name} - ${balance} ${$currentNetwork.currencySymbol}`}
        {/if}
    </div>

    <div class="contract-details">
        <InputBox
            id="stamp-input"
            width="100%"
            bind:value={stampLimit}
            bind:thisInput={stampsField}
            label={"Stamp Limit"}
            styles={`margin-bottom: 17px;`}
            inputType={"number"}
            required={true}
        />
        <InputBox
            id="contract-input"
            width="100%"
            value={contractName}
            bind:thisInput={contractNameField}
            label={"Enter Contract Name"}
            styles={`margin-bottom: 17px;`}
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
                label={'Function Name'} 
                styles={`margin-bottom: 40px;`}
                required={true}
                on:selected={(e) => setArgs(e.detail.selected.value, contractNameField.value)} />

            {#if methodArgs.length > 0}
                <h3>Transaction Arguments</h3>
            {/if}

            {#each methodArgs as arg, index}
                <InputBox
                    id={`input-${arg}`}
                    bind:value={argValueTracker[contractName][methodName][arg.name].value}
                    styles={'height: 46px; border-radius: 0 4px 4px 0; margin-bottom: 20px; flex-grow: 1; margin-left: -1px;'}
                    label={`${arg.name.toUpperCase()} (${longFormTypes[arg.type]})`}
                    inputType={typeToInputTypeMAP[argValueTracker[contractName][methodName][arg.name].type]}
                    on:changed={(e) => saveArgValue(arg, e)}
                    required={true} /> 
            {/each}
        {/if}
    </div>
    <div class="buttons">
        <Button id="lamden-tx-next-btn"
                classes={'button__solid button__purple'} 
                width={'232px'}
                margin={'0 0 17px 0'}
                name="Next" 
                click={() => handleNext(2)} />
    </div>
</div>


