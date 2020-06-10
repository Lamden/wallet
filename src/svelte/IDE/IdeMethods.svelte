<script>
    import { getContext } from 'svelte';
    
	//Stores
    import { activeTab } from '../../js/stores/stores.js';

	//Components
    import { Components }  from '../Router.svelte';
    const { Button, InputBox, DropDown } = Components;

    //Context
    const { openModal } = getContext('app_functions');

    //Props
    export let methods;

    let typeToInputTypeMAP = {
        Any: 'textarea',
        str: 'text',
        float: 'number',
        int: 'number',
        bool: [
            {name:'true', value: true, selected: true}, 
            {name: 'false', value:false, selected: false}
        ]
    }
    // TODO: ADD ALL TYPES {'dict', 'list', 'str', 'int', 'float', 'bool', 'timedelta', 'datetime', 'Any'}
    let defaultValues = {
        str: '',
        float: 0.0,
        int: 0,
        bool: true,
        Any: ''
    }
    let longFormTypes = {
        str: 'text',
        float: 'decimal',
        int: 'integer',
        bool: 'true/false',
        Any: 'any'
    }

    $: argValues = {}
    $: newMethods = [...methods]

    const saveArgValue = (methodIndex, argIndex, e) => {
        let newValue;
        if (!e.detail)
            newValue = e;
        else{
            if (e.detail.target) newValue = e.detail.target.value;
        }
        const argType = methods[methodIndex].arguments[argIndex].type
        if (argType === 'int') newValue = parseInt(newValue)
        if (argType === 'float') newValue = parseFloat(newValue)
        methods[methodIndex].arguments[argIndex].value = newValue;
    }

    const clearValidation = (e) => {
        e.detail.target.setCustomValidity('')
        e.detail.target.reportValidity();
    }

    const handleRun = (index) => {
        let kwargs = {};
        methods[index].arguments.forEach(arg => {
            if (arg.value !== '') kwargs[arg.name] = arg.value;
        })
    	openModal('IdeModelMethodTx', {
			'contractName': $activeTab.name, 
            'methodName': methods[index].name, 
            kwargs
        })
    }
</script>

<style>
.name-row{
    align-items: center;
}
.method{
    border-bottom: 1px solid var(--font-primary-dark);
    padding: 2rem 0;
    max-width: 600px;
}
.heading{
    margin: 3rem 0 -1rem;
}
</style>

<div class="flex-column">
    <h5 class="heading">Contract Methods</h5>
    {#each newMethods as method, methodIndex}
        <div class="method" >
            <div class="flex-row name-row">
                <h2>{method.name}</h2>
                <Button 
                    name={'run'} 
                    height={'22px'} 
                    margin={'0 0 0 10px'}
                    padding={'0 5px'}
                    classes={'button__solid button__purple'}
                    click={() => handleRun(methodIndex)}/>
            </div>

            {#each method.arguments as arg, argIndex}
                <InputBox
                    id={argIndex}
                    bind:value={methods[methodIndex].arguments[argIndex].value}
                    width="100%"
                    styles={'height: 46px; max-width: 440px; border-radius: 0 4px 4px 0; margin-bottom: 10px; flex-grow: 1;  margin-left: -1px;'}
                    label={`${arg.name} (${arg.type})`}
                    inputType={typeToInputTypeMAP[arg.type]}
                    on:changed={(e) => saveArgValue(methodIndex, argIndex, e)}
                    on:keyup={(e) => clearValidation(e)}
                    required={true} />
            {/each}
        </div>
    {/each}
 </div>
