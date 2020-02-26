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

    let dataTypes = ['text', 'address', 'number', 'bool']
    let typeToInputTypeMAP = {
        address: 'text',
        text: 'textarea',
        number: 'number',
        bool: trueFalseList()
    }
    let defaultValues = {
        address: '',
        text: '',
        number: 0,
        bool: true 
    }

    $: argValues = {}
    $: newMethods = [...methods]

    function typesList(argValue){
        let returnList = dataTypes.map(type => {
            return {
                value: type,
                name: type,
                selected: type === argValue.type
            }
        })
        return returnList;
    }

    function saveArgType(index, arg, e){
        methods[index].args[arg].type = e;
        methods[index].args[arg].value = defaultValues[e]
    }

    function saveArgValue(index, arg, e){
        let newValue;
        if (!e.detail)
            newValue = e;
        else{
            if (e.detail.target) newValue = e.detail.target.value;
        }
        methods[index].args[arg].value = newValue;
    }

    function trueFalseList(){
        return [
            {name:'true', value: true, selected: true}, 
            {name: 'false', value:false, selected: false}
        ]
    }

    function clearValidation(e){
        e.detail.target.setCustomValidity('')
        e.detail.target.reportValidity();
    }

    function handleRun(index){
        let kwargs = {};
        Object.keys(methods[index].args).map(arg => {
            let argValue = methods[index].args[arg]
            if (argValue.value !== '') kwargs[arg] = argValue.value;
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
    {#each newMethods as method, index}
        {#if method.name !== '____'}
            <div class="method" >
                <div class="flex-row name-row">
                    <h2>{method.name}</h2>
                    <Button 
                        name={'run'} 
                        height={'22px'} 
                        margin={'0 0 0 10px'}
                        padding={'0 5px'}
                        classes={'button__solid button__purple'}
                        click={() => handleRun(index)}/>
                </div>

                {#each Object.keys(method.args) as argKey}
                    <div class="flex-row">
                        <DropDown
                            items={typesList(method.args[argKey])}
                            label={'Type'}
                            width="160px"
                            styles="border-radius: 4px 0 0 4px;"
                            on:selected={(e) => saveArgType(index, argKey, e.detail.selected.value)}
                            sideBox={true} />
                        
                        {#if method.args[argKey].type === 'bool'}
                            <DropDown
                                items={trueFalseList()}
                                label={argKey}
                                width="100%"
                                styles={'border-radius: 0 4px 4px 0; margin-bottom: 10px; flex-grow: 1;  margin-left: -1px;'}
                                on:selected={(e) => saveArgValue(index, argKey, e.detail.selected.value)}
                                required={true} />
                        {:else}
                            <InputBox
                                id={index}
                                bind:value={methods[index].args[argKey].value}
                                width="100%"
                                styles={'height: 46px; max-width: 440px; border-radius: 0 4px 4px 0; margin-bottom: 10px; flex-grow: 1;  margin-left: -1px;'}
                                label={argKey}
                                inputType={typeToInputTypeMAP[method.args[argKey].type]}
                                on:changed={(e) => saveArgValue(index, argKey, e)}
                                on:keyup={(e) => clearValidation(e)}
                                required={true} />
                        {/if}
                    </div>  
                {/each}
            </div>
        {/if}
    {/each}
 </div>
