<script>
    import { onMount} from 'svelte';
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

	//Stores
    import { CoinStore, currentNetwork } from '../../js/stores/stores.js';

    //Components
    import { Components }  from '../Router.svelte'
    const { DropDown, InputBox, Button } = Components;

    //Utils
    import { isStringHex } from  '../../js/lamden/helpers.js';

    //DOM NODES
    let stampsField, contractNameField

    //Props
    export let coin;
    export let currentPage;

    let selectedWallet;
    let contractError = false;
    let contractMethods;
    let transaction;
    let dataTypes = ['text', 'address', 'data', 'fixedPoint', 'bool']
    let typeToInputTypeMAP = {
        address: 'text',
        text: 'textarea',
        data: 'text',
        fixedPoint: 'number',
        bool: trueFalseList()
    }
    let defaultValues = {
        address: '',
        text: '',
        data: '',
        fixedPoint: 0,
        bool: true 
    }
    let stampLimit = 35000;
    
    $: contractName = 'currency'
    $: methodName  = ''
    $: argValueTracker = {};
    $: methodArgs = [];
    
    onMount(() => {
        contractMethods = getMethods(contractName)
    });

    function coinList(){
        return $CoinStore.map(c => {
            return {
                value: c,
                name: `${c.nickname} - ${c.vk.substring(0, 55 - c.nickname.length)}...`,
                selected: c.network === coin.network && c.symbol === coin.symbol && c.vk === coin.vk
            }
        })
    }

    function methodList(methods){
        if (!methods) return [];
        return methods.map(method => {
            return {
                value: method,
                name: `${method.name}`,
            }
        })
    }

    function typesList(arg){
        return dataTypes.map(type => {
            return {
                value: type,
                name: type,
                selected: type === argValueTracker[contractName][methodName][arg].selectedType ? true : false
            }
        })
    }

    function trueFalseList(arg = undefined){
        if (arg == null) return [{name:'true', value: true}, {name: 'false', value:false}]
        let selectedValue = argValueTracker[contractName][methodName][arg]['bool'].value
        return [
            {name:'true', value: true, selected: selectedValue === true}, 
            {name: 'false', value:false, selected: selectedValue === false}
        ]
    }

    function setArgs(method, contract){
        if (!method) return;
        methodName = method.name;
        methodArgs = [...method.arguments];
        if (!argValueTracker[contract]) argValueTracker[contract] = {};
        if (!argValueTracker[contract][methodName]) argValueTracker[contract][methodName] = {};
        
        methodArgs.map(arg => {
            if (!argValueTracker[contract][methodName][arg]) {
                let startingType = getStartingType(arg);
                argValueTracker[contract][methodName][arg] = {};
                argValueTracker[contract][methodName][arg].selectedType = startingType;
                argValueTracker[contract][methodName][arg][startingType] = {};
                argValueTracker[contract][methodName][arg][startingType].value = defaultValues[startingType];
            }
        })
        contractName = contract;
    }

    function getStartingType(arg){
        let type = 'text';
        let numberArgs = ['number', 'value', 'amount', 'stamps', 'tau', 'decimal']
        numberArgs.map(str => arg.includes(str) ? type = 'fixedPoint' : null)
        if (type === 'fixedPoint') return type;
        let addressArgs = ['to', 'from', 'wallet', 'address', 'sender', 'receiver', 'owner', 'public', 'private', 'key']
        addressArgs.map(str => arg.includes(str) ? type = 'address' : null)
        return type;
    }

    function saveArgValue(arg, e){
        let selectedType = argValueTracker[contractName][methodName][arg].selectedType
        if (selectedType === 'data' || selectedType === 'address'){
            if (!isStringHex(e.detail.target.value)){
                e.detail.target.setCustomValidity('Invalid Format: Must be HEX')
                e.detail.target.reportValidity()
            }
        }
        let argValue = selectedType === 'bool' ?  e.detail.selected.value : e.detail.target.value;
        if (selectedType === 'fixedPoint'){
            argValue = parseFloat(argValue)
        }
        argValueTracker[contractName][methodName][arg][selectedType].value = argValue;
        if (selectedType !== 'bool')  argValueTracker[contractName][methodName][arg][selectedType].target = e.detail.target;
    }

    function saveArgType(arg, e){
        let type = e.detail.selected.value;
        argValueTracker[contractName][methodName][arg].selectedType = type;
        if (!argValueTracker[contractName][methodName][arg][type]){
            argValueTracker[contractName][methodName][arg][type] = {value: defaultValues[type]}
        }
    }

    function getMethods(contract){
        return fetch(`${$currentNetwork.ip}:${$currentNetwork.port}/contracts/${contract}/methods`)
                    .then(res => res.json())
                    .then(res => {
                        if (res.error) {
                            contractNameField.setCustomValidity(res.error);
                            contractNameField.reportValidity();
                        }
                        setArgs(res.methods[0], contract)
                        return res.methods
                    })
    }

    function handleNext(){
        if (validateFields()){
            dispatch('contractDetails', {
                sender: selectedWallet,
                txInfo: {
                    stampLimit,
                    'contractName': contractNameField.value, 
                    methodName, 
                    args: packageArgs()
                    }
                })
        }
    }

    function validateFields(){
        stampsField.setCustomValidity('')
        if (stampLimit <= 0) {
            stampsField.setCustomValidity('Stamps must be greater than 0')
            stampsField.reportValidity()
            return false;
        }
        let validity = true;
        Object.keys(argValueTracker[contractName][methodName]).map(arg => {
            if (arg !== 'selectedType'){
                let argValue = argValueTracker[contractName][methodName][arg];
                if (argValue[argValue.selectedType].target){
                    if (!argValue[argValue.selectedType].target.checkValidity()){
                        validity = false;
                        argValue[argValue.selectedType].target.reportValidity()
                    }
                }
            }
        })
        return validity;
    }

    function clearValidation(e){
        e.detail.target.setCustomValidity('')
        e.detail.target.reportValidity();
    }

    function packageArgs(){
        let argPackage = {}
        Object.keys(argValueTracker[contractName][methodName]).map(arg => {
            if (arg !== 'selectedType'){
                let argValue = argValueTracker[contractName][methodName][arg]
                if (argValue[argValue.selectedType].value !== ""){
                    argPackage[arg] = {
                        value: argValue[argValue.selectedType].value,
                        type: argValue.selectedType
                    }
                }

            }
        })
        return argPackage;
    }

    function handleSelectedWallet(e){
        selectedWallet = e.detail.selected.value
    }
</script>

<style>
    .send-lamden{
        width: 668px;
    }
    
    .contract-details{
        padding: 28px 103px 30px 0;
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
    <h5> {`Send ${coin.name}`} </h5>
    <DropDown  
        items={coinList()} 
        id={'mycoins'} 
        label={'Select Wallet to Send From'}
        styles="margin-bottom: 19px;"
        required={true}
        on:selected={(e) => handleSelectedWallet(e)}
    />

    <div class="coin-info text-subtitle3">
        {#if selectedWallet}
            {`${selectedWallet.name} - ${!selectedWallet.balance ? 0 : selectedWallet.balance.toLocaleString('en')} ${selectedWallet.symbol}`}
        {/if}
    </div>

    <div class="contract-details">
        <InputBox
            width="100%"
            bind:value={stampLimit}
            bind:thisInput={stampsField}
            label={"Stamp Limit"}
            styles={`margin-bottom: 17px;`}
            inputType={"number"}
            required={true}
        />
        <InputBox
            width="100%"
            value={contractName}
            bind:thisInput={contractNameField}
            label={"Enter Contract Name"}
            styles={`margin-bottom: 17px;`}
            on:changed={(e) => contractMethods = getMethods(e.detail.target.value)}
            on:keyup={(e) => clearValidation(e)}
            required={true}
        />
        <div class="args">
            {#await contractMethods }
                <DropDown  label={'Function Name'}  defaultText={'No Functions'}/>
            {:then methods}
                <DropDown  
                    items={methodList(methods)} 
                    id={'methods'}
                    label={'Function Name'} 
                    styles={`margin-bottom: 40px;`}
                    required={true}
                    on:selected={(e) => setArgs(e.detail.selected.value, contractNameField.value)} />

                {#each methodArgs as arg, index}
                    <div class="flex-row">
                        <DropDown
                                items={typesList(arg)}
                                label={'Type'}
                                width="160px"
                                innerHeight="46px"
                                styles="border-radius: 4px 0 0 4px;"
                                on:selected={(e) => saveArgType(arg, e)}
                                sideBox={true} />
                        {#if argValueTracker[contractName][methodName][arg].selectedType === 'bool'}
                            <DropDown
                                items={trueFalseList(arg)}
                                label={arg}
                                width="380px"
                                innerHeight={'46px'}
                                styles={'border-radius: 0 4px 4px 0; margin-bottom: 20px; flex-grow: 1; max-width: 380px; min-width: 380px; margin-left: -1px;'}
                                on:selected={(e) => saveArgValue(arg, e)}
                                required={true} />
                        {:else}
                            <InputBox
                                id={index}
                                bind:value={argValueTracker[contractName][methodName][arg][argValueTracker[contractName][methodName][arg].selectedType].value}
                                width="380px"
                                styles={'height: 46px; border-radius: 0 4px 4px 0; margin-bottom: 20px; flex-grow: 1; max-width: 380px; min-width: 380px; margin-left: -1px;'}
                                label={arg}
                                inputType={typeToInputTypeMAP[argValueTracker[contractName][methodName][arg].selectedType]}
                                on:changed={(e) => saveArgValue(arg, e)}
                                on:keyup={(e) => clearValidation(e)}
                                required={true} />
                        {/if}

                    </div>        
                {/each}
            {:catch}
                <DropDown  label={'Function Name'}  defaultText={'No Functions'} />
            {/await}
        </div>

    </div>
    <div class="buttons">
        <Button classes={'button__solid button__purple'} 
                width={'232px'}
                margin={'0 0 17px 0'}
                name="Next" 
                click={() => handleNext(2)} />
    </div>
</div>


