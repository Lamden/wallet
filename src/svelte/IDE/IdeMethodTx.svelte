<script>
    import { getContext, onMount, createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();
    
	//Stores
    import { CoinStore, currentNetwork } from '../../js/stores/stores.js';

    //Components
	import { Components }  from '../Router.svelte'
    const { Button, DropDown, InputBox } = Components;

    //Context
    const { nextPage, close } = getContext('tx_functions');

    //Props
    export let currentPage;
    export let txData;
    export let txDetails;

    //DOM Nodes
    let formObj;

    let selectedWallet;
    let stampLimit = 50000;

    function coinList(){
        let returnList = [{
                value: undefined,
                name: `Select Wallet`,
                selected: true
            }]
        $CoinStore.map(c => {
            returnList.push({
                value: c,
                name: `${c.nickname}\n${c.vk.substring(0, 52)}...`,
                selected: false
            })
        })
        return returnList
    }

    function handleSelectedWallet(e){
        if (!e.detail.selected.value) return;
        selectedWallet = e.detail.selected.value;
    }

    function handleSubmit(){
        if(formObj.checkValidity()){
            sendTx();
        }
    }

    function sendTx(){
        txData.sender = selectedWallet;
        txData.txInfo.stampLimit = stampLimit;
        dispatch('saveTxDetails', txData);
    }
</script>

<style>
.coin-info{
    display: flex;
    justify-content: flex-end;
}
.confirm-tx{
    width: 600px;
}

.content{
    padding-left: 55px;
}

.details{
    padding: 5px 0 40px 76px;
    margin-left: 50px;
    border-left: 1px solid var(--font-primary-darker)
}

.values{
    color: var(--font-primary-dark);
    align-items: center;
    overflow-wrap: break-word;
    max-height: 100px;
    overflow-y: auto;
}

.buttons{
    flex-grow: 1;
    display: flex;
    padding-top: 27px;
    justify-content: center;
    align-items: center;
}

.warning{
    color: orange
}

.warning-icon{
    margin-right: 8px;
    position: relative;
    top: -1px;
}
.disabled{
    background: var(--bg-color-grey);
}
</style>

<div class="confirm-tx flex-column">
    <div class="content flex-column">
        <h5>{`Submit Contract`}</h5>
        <h4 class="no-bottom-margin">{`${$currentNetwork.name} Wallet`}</h4>
        <DropDown  
            items={coinList()}
            innerHeight={'70px'}
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
        <form on:submit|preventDefault={() => handleSubmit() } bind:this={formObj} target="_self">
            <div class="details flex-column">
                <InputBox
                    width="100%"
                    margin={'17px 0 0'}
                    bind:value={stampLimit}
                    label={"Stamp Limit"}
                    inputType={"number"}
                    required={true}
                />
                {#each txDetails as detail}
                    <h4 class="detail-name no-bottom-margin">{detail.name}</h4>
                    <div class="values text-body1">
                        {detail.name.includes('fixedPoint') ? parseFloat(detail.value).toFixed(8).toString() : detail.value}
                    </div>
                {/each}
            </div>
            <div class="buttons flex-column">
                <input  id="confirmTx-btn"
                        value="Confirm Transaction"
                        class="button__solid button__purple submit submit-button submit-button-text"
                        class:disabled={selectedWallet === undefined}
                        disabled={selectedWallet === undefined ? 'disabled' : ''}
                        type="submit" >
                <Button classes={'button__text text-caption'} 
                        width={'125px'}
                        height={'24px'}
                        padding={0}
                        margin={'17px 0'}
                        name="Cancel" 
                        click={() => close()} />
            </div>
        </form>
    </div>
</div>