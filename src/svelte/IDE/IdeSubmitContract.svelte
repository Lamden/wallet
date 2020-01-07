<script>
	//Stores
    import { CoinStore, activeTab } from '../../js/stores/stores.js';

    //Components
    import { Components }  from '../../js/router.js'
    const { Button, InputBox, DropDown } = Components

    //DOM Nodes
    let formObj, stampsField, contractField, codeField, ownerField, constructorArgsField

    let stampLimit = 500000;
    let selectedWallet;
    let constructorArgs = "";
    let owner = "";

    $: contractName = $activeTab.name

    function coinList(){
        return $CoinStore.map(c => {
            return {
                value: c,
                name: `${c.nickname} - ${c.vk.substring(0, 55 - c.nickname.length)}...`,
            }
        })
    }

    function handleSelectedWallet(e){
        selectedWallet = e.detail.selected.value
    }

    function handleSubmit(){
        if (formObj.checkValidity()){
            console.log('submit')
        }
    }

</script>

<style>
.contract-details{
    width: 600px;
}
.coin-info{
    margin: 10px 0 2rem 13px;
}
form{
    align-items: center;
}

.submit{
    margin: 4rem 0 1rem;
}
</style>

<div class="contract-details flex-column">
    <h5> {`Submit Contract to Network`} </h5>
    <DropDown  
        items={coinList()} 
        id={'mycoins'} 
        label={'Select Wallet to Send From'}
        required={true}
        on:selected={(e) => handleSelectedWallet(e)}
    />

    <div class="coin-info text-subtitle3">
        {#if selectedWallet}
            {`${selectedWallet.name} - ${!selectedWallet.balance ? 0 : selectedWallet.balance} ${selectedWallet.symbol}`}
        {/if}
    </div>

    <form class="flex-column" on:submit|preventDefault={() => handleSubmit() } target="_self" bind:this={formObj}>
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
            bind:value={contractName}
            bind:thisInput={contractField}
            label={"Contract Name"}
            styles={`margin-bottom: 17px;`}
            inputType={"text"}
            required={true}
        />
        <InputBox
            width="100%"
            rows="10"
            value={$activeTab.code}
            bind:thisInput={codeField}
            label={"Code"}
            styles={`margin-bottom: 17px; max-width: 100%; min-width: 100%;`}
            inputType={"textarea"}
            readonly={true}
            required={true}
        />
        <InputBox
            width="100%"
            rows="20"
            bind:value={owner}
            bind:thisInput={ownerField}
            label={"Owner (optional)"}
            styles={`margin-bottom: 17px;`}
            inputType={"text"}
        />
        <InputBox
            width="100%"
            rows="20"
            bind:value={constructorArgs}
            bind:thisInput={constructorArgsField}
            label={"Constructor Args (optional)"}
            styles={`margin-bottom: 17px;`}
            inputType={"text"}
        />
        <input  
            id={'submit-contract-btn'}
            value="Submit Contract"
            class="button__solid button__purple submit submit-button submit-button-text" 
            type="submit" >
    </form>
</div>