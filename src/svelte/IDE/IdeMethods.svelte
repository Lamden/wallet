<script>
    import { getContext } from 'svelte';
    
	//Stores
    import { activeTab } from '../../js/stores/stores.js';

	//Components
    import { Components }  from '../../js/router.js';
    const { Button, InputBox, DropDown } = Components;

    //Context
    const { openModal } = getContext('app_functions');

    //Props
    export let methods;

    $: argValues = {}

    let dataTypes = ['text', 'address', 'data', 'fixedPoint', 'bool']
    let typeToInputTypeMAP = {
        address: 'text',
        text: 'textarea',
        data: 'text',
        fixedPoint: 'number',
        bool: trueFalseList()
    }


    function typesList(key){
        argValues[key] = {};
        let returnList = dataTypes.map(type => {
            return {
                value: type,
                name: type,
                selected: false
            }
        })
        returnList[0].selected = true;
        return returnList;
    }

    function saveArgType(key, e){
        if (!argValues[key]) argValues[key] = {};
        argValues[key].type = e.detail.selected.value
    }

    function saveArgValue(key, e){
        console.log(e)
        if (e.detail)
            if (e.detail.selected) {argValues[key].value = e.detail.selected.value; return}
            if (e.detail.target) {argValues[key].value = e.detail.target.value; return}
        else{
            argValues[key].value = e
        }
        
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

    function handleRun(method){
        let args = {};
        method.arguments.map(arg => {
            let key = createKey(method.name, arg)
            if (argValues[key].value) args[arg] = {...argValues[key]};
        })
        console.log(args)
    	openModal('IdeModelMethodTx', {
			'contractName': $activeTab.name, 
            'methodName': method.name, 
            args
		})
    }

    function createKey(method, arg){
        return `${method}:${arg}`
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
    {#each methods as method}
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
                        click={() => handleRun(method)}/>
                </div>

                {#each method.arguments as arg, index}
                    <div class="flex-row">
                        <DropDown
                            items={typesList(createKey(method.name, arg))}
                            label={'Type'}
                            width="160px"
                            styles="border-radius: 4px 0 0 4px;"
                            on:selected={(e) => saveArgType(createKey(method.name, arg), e)}
                            sideBox={true} />
                            {#if argValues[createKey(method.name, arg)].type === 'bool'}
                                <DropDown
                                    items={trueFalseList()}
                                    label={arg}
                                    width="100%"
                                    styles={'border-radius: 0 4px 4px 0; margin-bottom: 10px; flex-grow: 1;  margin-left: -1px;'}
                                    on:selected={(e) => saveArgValue(createKey(method.name, arg), e)}
                                    required={true} />
                            {:else}
                                <InputBox
                                    id={index}
                                    width="100%"
                                    styles={'height: 46px; max-width: 440px; border-radius: 0 4px 4px 0; margin-bottom: 10px; flex-grow: 1;  margin-left: -1px;'}
                                    label={arg}
                                    inputType={typeToInputTypeMAP[argValues[createKey(method.name, arg)].type]}
                                    on:changed={(e) => saveArgValue(createKey(method.name, arg), e)}
                                    on:keyup={(e) => clearValidation(e)}
                                    required={true} />
                            {/if}
                    </div>  
                {/each}
            </div>
        {/if}
    {/each}
 </div>