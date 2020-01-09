<script>
	//Components
    import { Components }  from '../../js/router.js';
    const { Button, InputBox, DropDown } = Components;

    //Props
    export let methods;

    $: argChoices = {}

    let dataTypes = ['text', 'address', 'data', 'fixedPoint', 'bool']
    let typeToInputTypeMAP = {
        address: 'text',
        text: 'textarea',
        data: 'text',
        fixedPoint: 'number',
        bool: trueFalseList()
    }


    function typesList(key){
        argChoices[key] = {};
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
        if (!argChoices[key]) argChoices[key] = {};
        argChoices[key].type = e.detail.selected.value
    }

    function saveArgValue(key, e){
        if (e.detail)
            if (e.detail.selected) argChoices[key].value = e.detail.selected.value
            if (e.detail.target) argChoices[key].value = e.detail.target.value
        else{
            argChoices[key].value = e
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
        method.arguments.map(arg =>{
            let key = `${method.name}:${arg}`
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
    <h5 class="heading">Contact Methods</h5>
    {#each methods as method}
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
                            items={typesList(`${method.name}:${arg}`)}
                            label={'Type'}
                            width="160px"
                            innerHeight="42px"
                            styles="border-radius: 4px 0 0 4px;"
                            on:selected={(e) => saveArgType(`${method.name}:${arg}`, e)}
                            sideBox={true} />
                        {#if argChoices[`${method.name}:${arg}`] === 'bool'}
                            <DropDown
                                items={trueFalseList()}
                                label={arg}
                                width="100%"
                                innerHeight="42px"
                                styles={'border-radius: 0 4px 4px 0; margin-bottom: 10px; flex-grow: 1;  margin-left: -1px;'}
                                on:selected={(e) => saveArgValue(`${method.name}:${arg}`, e)}
                                required={true} />
                        {:else}
                            <InputBox
                                id={index}
                                width="100%"
                                styles={'height: 42px; max-width: 440px; border-radius: 0 4px 4px 0; margin-bottom: 10px; flex-grow: 1;  margin-left: -1px;'}
                                label={arg}
                                rows={"2"}
                                inputType={typeToInputTypeMAP[argChoices[`${method.name}:${arg}`].type]}
                                on:changed={(e) => saveArgValue(`${method.name}:${arg}`, e)}
                                on:keyup={(e) => clearValidation(e)}
                                required={true} />
                        {/if}
                </div>  
            {/each}
        </div>
    {/each}
 </div>