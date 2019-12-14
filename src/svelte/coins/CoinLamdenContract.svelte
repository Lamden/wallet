<script>
    import { onMount} from 'svelte';
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

	//Stores
    import { CoinStore } from '../../js/stores/stores.js';

    //Components
    import { Components }  from '../../js/router.js'
    const { DropDown, InputBox, Button } = Components;

    //Utils
    import { isStringHex } from  '../../js/lamden/helpers.js';

    //DOM NODES
    let formObj1, stampsField

    //Props
    export let coin;
    export let currentPage;

    let error, status = "";
    let txData = {};
    let selectedWallet;
    let contractError = false;
    let contractMethods;
    let transaction;
    let typeToInputTypeMAP = {
        text: 'textarea',
        data: '',
        fixedPoint: 'number',
        bool: trueFalseList()
    }
    let defaultValues = {
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
    $: ArgTypes = []
    $: functionList = methodList(['transfer'])

    //testing 
    let dataTypes = ['text', 'data', 'fixedPoint', 'bool']
    let functions = [{value:{name:"transfer", arguments:['to','amount']}, name:"transfer"}]
    
    onMount(() => {
        //contractMethods = getMethods(contractName)
    });

    function coinList(){
        return $CoinStore.map(coin => {
            return {
                value: coin,
                name: `${coin.nickname} - ${coin.vk.substring(0, 55 - coin.nickname.length)}...`,
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

    function setArgs(method){
        if (!method) return
        methodName = method.name
        methodArgs = [...method.arguments]
        if (!argValueTracker[contractName]) argValueTracker[contractName] = {};
        if (!argValueTracker[contractName][methodName]) argValueTracker[contractName][methodName] = {};
        
        methodArgs.map(arg => {
            if (!argValueTracker[contractName][methodName][arg]) {
                argValueTracker[contractName][methodName][arg] = {};
                argValueTracker[contractName][methodName][arg].selectedType = 'data';
                argValueTracker[contractName][methodName][arg]['data'] = {};
                argValueTracker[contractName][methodName][arg]['data'].value = defaultValues['data'];
            }
        })
    }

    function saveArgValue(arg, e){
        let dataFieldVaild = true;
        let selectedType = argValueTracker[contractName][methodName][arg].selectedType
        if (selectedType === 'data'){
            if (!isStringHex(e.detail.target.value)){
                e.detail.target.setCustomValidity('Data fields must be hex')
                e.detail.target.reportValidity()
            }else{

            }
        }
        let argValue = selectedType === 'bool' ?  e.detail.selected.value : e.detail.target.value;
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
        return fetch(`http://192.168.1.141:8000/contracts/${contract}/methods`)
                    .then(res => res.json())
                    .then(res => {
                        if (!res.methods) contractError = true;
                        contractError = false;
                        setArgs(res.methods[0])
                        return res.methods
                    })
    }

    function handleNext(){
        if (validateFields()){
            dispatch('contractDetails', {
                sender: selectedWallet,
                txInfo: {
                    stampLimit,
                    contractName, 
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

    function packageArgs(){
        let argPackage = {}
        Object.keys(argValueTracker[contractName][methodName]).map(arg => {
            if (arg !== 'selectedType'){
                let argValue = argValueTracker[contractName][methodName][arg]
                argPackage[arg] = {
                    value: argValue[argValue.selectedType].value,
                    type: argValue.selectedType
                }
            }
        })
        return argPackage;
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
    <h5> {`Send Lamden ${coin.name}`} </h5>
    <DropDown  
        items={coinList()} 
        id={'mycoins'} 
        label={'Select Wallet to Send From'}
        styles="margin-bottom: 19px;"
        required={true}
        on:selected={(e) => selectedWallet = e.detail.selected.value}
    />

    <div class="coin-info text-subtitle3">
        {#if selectedWallet}
            {`${selectedWallet.name} - ${!selectedWallet.balance ? 0 : selectedWallet.balance} ${selectedWallet.symbol}`}
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
            value= {contractName}
            label={"Enter Contract Name"}
            styles={`margin-bottom: 17px;`}
            on:changed={(e) => contractMethods = getMethods(e.detail.value)}
            required={true}
        />
        <div class="args">
            {#await contractMethods }
                <DropDown  label={'Functions'} />
            {:then methods}
                <DropDown  
                    items={/*methodList(methods)*/functions} 
                    id={'methods'} 
                    label={'Function Name'} 
                    styles={`margin-bottom: 40px;`}
                    required={true}
                    on:selected={(e) => setArgs(e.detail.selected.value)} />

                {#each methodArgs as arg, index}
                    <div class="flex-row">
                        <DropDown
                                items={typesList(arg)}
                                label={'Type'}
                                width="160px"
                                styles="border-radius: 4px 0 0 4px;"
                                on:selected={(e) => saveArgType(arg, e)}
                                sideBox={true} />
                        {#if argValueTracker[contractName][methodName][arg].selectedType === 'bool'}
                            <DropDown
                                items={trueFalseList(arg)}
                                label={arg}
                                width="380px"
                                styles={'border-radius: 0 4px 4px 0; margin-bottom: 20px; flex-grow: 1; max-width: 380px; min-width: 380px; margin-left: -1px;'}
                                on:selected={(e) => saveArgValue(arg, e)}
                                required={true} />
                        {:else}
                            <InputBox
                                id={index}
                                bind:value={argValueTracker[contractName][methodName][arg][argValueTracker[contractName][methodName][arg].selectedType].value}
                                width="380px"
                                styles={'border-radius: 0 4px 4px 0; margin-bottom: 20px; flex-grow: 1; max-width: 380px; min-width: 380px; margin-left: -1px;'}
                                label={arg}
                                inputType={typeToInputTypeMAP[argValueTracker[contractName][methodName][arg].selectedType]}
                                on:changed={(e) => saveArgValue(arg, e)}
                                required={true} />
                        {/if}

                    </div>        
                {/each}
            {:catch}
                <DropDown  label={'Functions'} />
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


