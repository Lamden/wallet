<script>
    import { getContext} from 'svelte';

	//Stores
    import { CoinStore, Hash, getCoinReference } from '../../js/stores.js';

    //Components
    import { MyCoinsDropDown, Modal, Modals }  from '../../js/router.js'

    // Utils
    import { API, waitUntilTransactionExists } from '../../js/api.js';
    import { checkPassword, decryptStrHash, encryptStrHash, stripCoinRef } from '../../js/utils.js';
    import { validateAddress, signTx } from '../../js/crypto/wallets.js';

    //Context
    const { switchPage } = getContext('switchPage');

    //DOM Nodes
    let formObj1, formObj2 ,passwordField, participateField;

    let error = '';
    let status = '';
    let password = '';
    let CheckTx;
    let openModal = false;
    let currentModal = '';

    let participateString = '';
    $: participateInfo = JSON.parse(participateString);
    let contractInfo;
    let participateCoin;
    let participateStore = {};
    let txOkay = false;

    let publishTxSuccess = false;

    function handleSelection(evt, type){
        if (type === 'participateWallet') {
            participateCoin = undefined;
            if (evt.detail.selected) participateCoin = stripCoinRef(evt.detail.selected);
        }
    }

    function showModal(modal){
        currentModal = modal;
        openModal = true;
    }
    
    function closeModal(){
        openModal = false;
    }

    async function handleSubmit1(obj){
        error = '';
        if (obj.checkValidity()){
            status = 'Retriving Swap Details...';
            let swapInfo = await getSwapInfo();
            if (!swapInfo) return;
            if (swapInfo.message) {error = swapInfo.message; return;}
            contractInfo = swapInfo;
            status = 'Swap Contract Recieved!';
        }
    }

    function getSwapInfo(){
        let data = {'contract': participateInfo.contract, 'transaction_address': participateInfo.transactionAddress}
        let path = `${participateInfo.initialCurrency}`
        return API('GET', 'audit-contract', path, data)
            .catch (e => { console.log(e); error = e; })
    }

    async function handleSubmit2(obj){
         error = '';
        if (obj.checkValidity()){
            //Get Details of the atomic swap transaction
            status = 'Retriving Transaction Details...';
            let txInfo = await getParticipateTxDetails();
            console.log(txInfo);
            if (!txInfo) return;
            if (txInfo.message) {error = txInfo.message; return;};

            //Sign the Tx and send coins to the swap contract
            status = `Sending ${participateInfo.participateValue} ${participateInfo.participateCurrency} to Lamden Swap Contract`;
            let publishResult = await sendParticipateTx(txInfo);
            console.log(publishResult);
            if (!publishResult) return;
            if (publishResult.message) {error = publishResult.message; return;};

            //Check to make sure the transaction was published (does not mean confirmed)
            await checkPublish(publishResult.transaction_address);

            if (txOkay) storeParticipateInfo(publishResult, txInfo);
        }
    }

    function validatePassword(){
        passwordField.setCustomValidity('');
        if (!checkPassword(password, $Hash)) {
            passwordField.setCustomValidity("Incorrect Password");
        }
    }

    function getParticipateTxDetails(){
        let data = {'value': participateInfo.participateValue, 'secret_hash': contractInfo.secret_hash }
        let path = `${participateInfo.participateCurrency}/${participateCoin.vk}/${participateInfo.participateAliceAddress}`
        return API('POST', 'participate', path, data)
            .then(result => { return result; })
            .catch (e => { console.log(e); error = e; })
    }

    function sendParticipateTx(txInfo){
        const network_symbol = participateCoin.is_token ? participateCoin.network_symbol : participateCoin.symbol;
        const raw_transaction =  participateCoin.network === 'ethereum'  ?  txInfo.transaction : txInfo.contract_transaction;
        let signed_transaction = "";
        try{
            signed_transaction = signTx(raw_transaction, decryptStrHash(password, participateCoin.sk), participateCoin.network, network_symbol);
        }catch (e) {
            console.log(e)
            error = e;
        }
        const data = {'raw_transaction': signed_transaction}
        return API('POST', 'publish-transaction', network_symbol, data)
            .then(result => { return result; })
    }

    function storeParticipateInfo(publishResult, txInfo){
        participateStore.swapContract = txInfo;
        participateStore.swapContract.txResult = publishResult;
        participateStore.sending = participateCoin;
        participateStore.created = new Date();
        participateStore.initialContractInfo = contractInfo;
        participateStore.participateInfo = participateInfo;
        participateStore.initalRedeemLink = JSON.stringify({transactionAddress: txInfo.transaction_address});
        console.log(participateStore);
        CoinStore.storeSwapInfo(participateCoin, participateStore, 'participate');
        switchPage('SwapsMain');
    }

    function checkPublish(transaction) {
            status = `Waiting for Tx to Publish`;
            //waitUntilTransactionExists(publishResult.transaction_address);
            const network_symbol = participateCoin.is_token ? participateCoin.network_symbol : participateCoin.symbol;
            return waitUntilTransactionExists(network_symbol, transaction)
                .then(result => {
                    if (result) {status = "Transaction Published"; txOkay = true};
                    if (!result) status = "Could not find transaction in block";
                })
                .catch(e => error = e);
    }

</script>
{#if error}{error}{:else}{status}{/if}

<h1> Participate in a Swap</h1>

{#if !contractInfo}
<form on:submit|preventDefault={() => handleSubmit1(formObj1) } bind:this={formObj1} target="_self">
    <div>
        <label>Enter Swap String</label>
        <small>This is a string of characters provided to you from the party that created the swap.</small>
        <input type="text" required
               bind:value={participateString}
               bind:this={participateField} />
    </div>
    <input type="submit" value="Get Swap Info" required disabled={participateString === ""}>
</form>
{/if}

{#if contractInfo}
    <form on:submit|preventDefault={() => handleSubmit2(formObj2) } bind:this={formObj2} target="_self">
        <div>
            {`Recieving ${participateInfo.initialValue} (${participateInfo.initialCurrency}) for ${participateInfo.participateValue} (${participateInfo.participateCurrency}) `}
            Swap Initiated by: {contractInfo.refund_address} <br>
            Swap exipiry date: {new Date(contractInfo.locktime)}<br>
            <a href={contractInfo.transaction_link} target="_blank" rel="noopener noreferrer">
                {`${contractInfo.value_text} was sent to swap contract (${contractInfo.confirmations} confirmations)`}
            </a>
        </div>
        <div>
            {#if $CoinStore.filter(f => f.symbol === participateInfo.participateCurrency ).length > 0}
                <label>{`Select ${participateInfo.participateCurrency} Wallet to Participate in Swap`}</label>
                <MyCoinsDropDown 
                        id="participateWalletDD" 
                        on:selected={(evt) => handleSelection(evt, 'participateWallet')}
                        required={true} filter={participateInfo.participateCurrency} />
            {:else}
                {`You cannot participate in this swap until you add a ${participateInfo.participateCurrency} keypair to the wallet`}<br>
                <button on:click={() => switchPage('SwapsMain')}> Back </button>
                <button on:click={ () => showModal('CoinAdd') }> Add Coin </button>
                {#if openModal}
                    <Modal on:close="{() => closeModal()}">
                        <svelte:component this={ Modals[currentModal]} {closeModal} {openModal}/>
                    </Modal>
                {/if}
            {/if}
        </div>
        <div>
            <label>Wallet Password</label><br>
            <input  bind:value={password}
                    bind:this={passwordField}
                    on:change={() => validatePassword()}
                    type="password"
                    required  />
        </div>
        <input type="submit" value="Participate in Swap" required disabled={!participateCoin}>
    </form>
    
{/if}