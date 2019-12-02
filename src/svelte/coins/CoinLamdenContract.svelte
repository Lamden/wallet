<script>
    import { onMount} from 'svelte';

    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

	//Stores
    import { CoinStore } from '../../js/stores/stores.js';

    //Components
    import { Components }  from '../../js/router.js'
    const { DropDown, InputBox, Button } = Components;

    //DOM NODES
    let formObj1

    //Props
    export let coin;
    export let currentPage;

    let error, status = "";
    let txData = {};
    let selectedWallet;
    let contractError = false;
    let contractMethods;

    $: contractName = 'currency'
    $: methodName  = ''
    $: AllArgs = {};
    $: args = {};
    $: methodArgs = [];
    
    onMount(() => {
        contractMethods = getMethods(contractName)
    });

    function coinList(){
        return $CoinStore.map(coin => {
            return {
                value: coin,
                name: `${coin.nickname} - ${coin.vk.substring(1, 55 - coin.nickname.length)}...`,
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

    function setArgs(method){
        args = {};
        if (!method) return
        methodName = method.name
        methodArgs = [...method.arguments]
    }

    function saveArgInfo(arg, e){
        args[arg] = e.detail.value;
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
        dispatch('contractDetails', {
            sender: selectedWallet,
            txInfo: {
                contractName, 
                methodName, 
                args
                }
            })
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
                    items={methodList(methods)} 
                    id={'methods'} 
                    label={'Function Name'} 
                    styles={`margin-bottom: 40px;`}
                    required={true}
                    on:selected={(e) => setArgs(e.detail.selected.value)}
                />
                {#each methodArgs as arg, index}
                    <InputBox
                            id={index}
                            bind:Value={AllArgs[arg]}
                            width="100%"
                            styles={'margin-bottom: 20px; '}
                            label={arg}
                            on:changed={(e) => saveArgInfo(arg, e)}
                            required={true}
                    />        
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


