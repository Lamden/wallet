<script>
    //Stores
    import { currentNetwork } from '../../js/stores/stores.js'
    
	//Components
    import { Components }  from '../Router.svelte';
    const { InputBox, Button } = Components;

    export let contractName

    let variableName = 'state';
    let key = '';
    let result = '';

    const handleRun = async () => {
        try{
            $currentNetwork.API.getVariable(contractName, variableName, key)
            .then(res => result = res)
        } catch (e) {
            result = ''
        }
    }
</script>

<style>
.get-variable{
    margin-top: 1rem;
}
.heading{
    align-items: center;
}
</style>


<div class="get-variable flex-column">
    <div class="flex-row heading">
        <h5>Get Current State</h5>
        <Button 
            name={'run'} 
            height={'22px'} 
            margin={'0 0 0 10px'}
            padding={'0 5px'}
            classes={'button__solid button__purple'}
            click={() => handleRun()}
        />
    </div>
    <div class="flex-row">
        <InputBox
            on:changed={(e) => {variableName = e.detail.target.value}}
            value = {variableName}
            label={'Variable Name'}
            placeholder={'Enter Variable Name'}
            width={'300px'}
            height={'42px'}
            margin={'0 20px 0 0'}
            styles={'min-width: 200px;'}
        />
        <InputBox 
            on:changed={(e) => {key = e.detail.target.value}}
            label={'keys (comma separated)'}
            placeholder={'key1,key2.. etc'}
            width={'300px'}
            height={'42px'}
            styles={'min-width: 200px;'}
        />
    </div>
    <div>
        <InputBox
            value={result}
            label={`${contractName} - Current State`}
            inputType={'textarea'}
            width={'620px'}
            height={'92px'}
            margin={'1rem 0 0 0'}
            styles={'min-width: 200px;'}
        />
    </div>
</div>