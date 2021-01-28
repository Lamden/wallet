<script>
    import { getContext, beforeUpdate } from 'svelte';
    import { Encoder } from 'lamden-js'
    
	//Stores
    import { activeTab } from '../../js/stores/stores.js';

	//Components
    import { Components }  from '../Router.svelte';
    const { Button, InputBox, DropDown, Kwargs } = Components;

    //Utils
    import { formatKwargs } from '../../js/utils.js'

    //Context
    const { openModal } = getContext('app_functions');

    //Props
    export let methods;

    $: argValues = {}
    $: newMethods = [...methods]

    beforeUpdate (() => {
        argValues = {}
    })

    const handleRun = (index) => {
        let kwargs = {};
        methods[index].arguments.forEach(arg => {
            if (arg.value !== ''){
                try{
                    kwargs[arg.name] = Encoder(arg.type, arg.value)
                }catch (e) {
                    kwargs[arg.name] = e.message
                }
            } 
        })
    	openModal('IdeModelMethodTx', {
			'contractName': $activeTab.name, 
            'methodName': methods[index].name, 
            kwargs: formatKwargs(argValues[index])
        })
    }
    const handleNewArgValues = (e) => {
        argValues[e.detail.methodIndex] = e.detail.argumentList
    }
</script>

<style>
.methods{
    flex-wrap: wrap;
}
.name-row{
    align-items: center;
}
.method{
    border: 1px solid var(--color-secondary);
    border-radius: 4px;
    padding: 1rem;
    margin: 1rem 1rem 0 0;
    max-width: calc(100% / 2.18);
    min-width: fit-content;
    width: 100%;
    background: var(--bg-secondary);
    box-shadow: var(--box-shadow-2);
    -webkit-box-shadow: var(--box-shadow-2);
    -moz-box-shadow: var(--box-shadow-2);
}
.heading{
    margin: 2em 0 0;
}


</style>

<h2 class="heading">Contract Methods</h2>
<div class="methods flex-row">
    {#each newMethods as method, methodIndex}
        <div class="method" >
            <div class="flex-row name-row">
                <h3>{method.name}</h3>
                <button class="button__small button__primary run-button text-body3"
						on:click={() => handleRun(methodIndex)}>run</button>
            </div>

            {#if method.arguments}
                <Kwargs argumentList={method.arguments} on:newArgValues={handleNewArgValues} {methodIndex} bgStyle="secondary"/>
            {:else}
                <p>This function takes no arguments</p>
            {/if}
        </div>
    {/each}
 </div>
