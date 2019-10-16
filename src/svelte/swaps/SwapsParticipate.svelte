<script>
    import { getContext, onMount } from 'svelte';

	//Stores
    import { CoinStore, Hash, getCoinReference, SettingsStore } from '../../js/stores.js';

    //Components
    import { MyCoinsDropDown, Modal, Modals }  from '../../js/router.js'

    // Utils
    import { API, waitUntilTransactionExists, getSwapInfo, getTokenInfo, getApproveTokenTxDetails, sendSignedTx } from '../../js/api.js';
    import { checkPassword, decryptStrHash, encryptStrHash, stripCoinRef } from '../../js/utils.js';
    import { validateAddress, signTx } from '../../js/crypto/wallets.js';

    //Context
    const { switchPage } = getContext('switchPage');

    //DOM Nodes
    let formObj1, formObj2 ,passwordField, participateField;

    let error = '';
    let continueSwap = false;
    let status = '';
    let password = 'Summer0!0101';
    let CheckTx;
    let openModal = false;
    let currentModal = '';

    let participateString = '';
    $: participateInfo = participateString === '' ? {} : JSON.parse(participateString);
   
    let participateCoin;
    let sendingTokenInfo;
    $: participateStore = {};
    let txOkay = false;

    let publishTxSuccess = false;

	onMount(() => {
        if ($SettingsStore.currentPage.data.type === 'participate'){
            continueSwap = true;
            participateStore = $SettingsStore.currentPage.data;
            $SettingsStore.currentPage.data = {};
        }else{
            participateStore = {};
        }
    });

    function filterSelection(){
        return sendingTokenInfo.token_symbol ? [sendingTokenInfo.symbol, sendingTokenInfo.token_symbol] : [sendingTokenInfo.symbol];
    }
    
    function handleSelection(evt, type){
        if (type === 'participateWallet') {
            participateStore.sending = undefined;
            if (evt.detail.selected) {
                participateStore.sending = { ...stripCoinRef(evt.detail.selected), ...sendingTokenInfo };
            }
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
            let swapInfo = await getSwapInfo(participateInfo.initialCurrency, participateInfo.contract, participateInfo.transactionAddress)
                                   .catch (e => { console.log(e); error = e; });
            if (!swapInfo) return;
            if (swapInfo.message) {error = swapInfo.message; return;}
            participateStore.initialContractInfo = swapInfo;
            status = 'Swap Contract Recieved!';

            if (participateStore.initialContractInfo.token_address){
                status = 'Retriving "Reciving Token" Details...';
                let receivingTokenInfo = await getTokenInfo(participateInfo.initialCurrency, participateStore.initialContractInfo.token_address)
                                                 .catch (e => { console.log(e); error = e; });
                if (!receivingTokenInfo) return;
                if (receivingTokenInfo.message) {error = receivingTokenInfo.message; return;}
                receivingTokenInfo.token_symbol = receivingTokenInfo.symbol;
                delete receivingTokenInfo.symbol;
                participateStore.receiving = receivingTokenInfo;
                status = 'Token Details Recieved!';
            }

            if (participateInfo.participateTokenAddress){
                status = 'Retriving "Sending Token" Details...';
                sendingTokenInfo = await getTokenInfo(participateInfo.participateCurrency, participateInfo.participateTokenAddress)
                                               .catch (e => { console.log(e); error = e; });
                if (!sendingTokenInfo) return;
                if (sendingTokenInfo.message) {error = sendingTokenInfo.message; return;}
                sendingTokenInfo.token_symbol = sendingTokenInfo.symbol;
                delete sendingTokenInfo.symbol;
                status = 'Token Details Recieved!';
            }
            continueSwap = true;
        }
    }

    async function handleSubmit2(obj){
         error = '';
        if (obj.checkValidity()){
            if (!participateStore.txInfo){
                if (participateStore.sending.is_token){
                    status = 'Getting Approve Token Details...';
                    let approveTxInfo = await getApproveTokenTxDetails(participateStore.sending.network_symbol, participateInfo.participateValue, participateStore.sending.vk, participateStore.sending.token_address)
                                                .catch (e => { console.log(e); error = e });
                    if (!approveTxInfo) return;
                    if (approveTxInfo.message) {error = approveTxInfo.message; return;}
                    participateStore.approveTxInfo = approveTxInfo;
                    status = 'Approve Token Details Recieved!';

                    status = 'Sending Approve Token Transaction...';
                    let approveTxResult = await sendSignedTx( signedTx(approveTxInfo) )            
                                                    .catch (e => { console.log(e); error = e; });
                    if (!approveTxResult) return;
                    if (approveTxResult.message) {error = approveTxResult.message; return;}
                    participateStore.approveTxResult = approveTxResult;
                    status = 'Approve Token Transaction Sent!';

                    //Check to make sure the transaction was published (does not mean confirmed)
                    let approveTxOkay = await checkPublish(approveTxResult.transaction_address);
                    if (!approveTxOkay) return;
                    participateStore.approveTxResult.sent = new Date();
                }
                
                status = 'Getting Swap Participate Transaction Details...';
                let txInfo = await getParticipateTxDetails();
                if (!txInfo) return;
                if (txInfo.message) {error = txInfo.message; return;}
                participateStore.txInfo = txInfo;
                status = 'Swap Participate Transaction Details Recieved!';
                storeParticipateInfo();

            }
            
            status = 'Sending Swap Participate Transaction...';
            let txResult = await sendSignedTx( signedTx(participateStore.txInfo) )            
                                        .catch (e => { console.log(e); error = e; });
            if (!txResult) return;
            if (txResult.message) {error = txResult.message; return;}
            console.log(txResult)

            //Check to make sure the transaction was published (does not mean confirmed)
            let txOkay = await checkPublish(txResult.transaction_address);
            if (txOkay) {
                status = 'Swap Participate Transaction Sent!';
                participateStore.txResult = txResult;
                participateStore.txResult.sent = new Date();
                try{
                    CoinStore.updateSwapInfo(participateStore.sending, participateStore.txInfo.secret_hash, 'txResult', participateStore.txResult);
                } catch (e){
                    console.log(e)
                    error = e;
                    return;
                }
                finishParticipateSwap();
            }
        }
    }

    function validatePassword(){
        passwordField.setCustomValidity('');
        if (!checkPassword(password, $Hash)) {
            passwordField.setCustomValidity("Incorrect Password");
        }
    }

    function signedTx(txInfo){
        const network_symbol = participateStore.sending.is_token ? participateStore.sending.network_symbol : participateStore.sending.symbol;
        const unsigned_transaction =  participateStore.sending.network === 'ethereum'  ?  txInfo.transaction : txInfo.contract_transaction;
        let signed_transaction = "";
        try{
            signed_transaction = signTx(unsigned_transaction, decryptStrHash(password, participateStore.sending.sk), participateStore.sending.network, network_symbol);
        }catch (e) {
            console.log(e)
            error = e;
        }
        console.log(signed_transaction)
        return {signed_transaction, network_symbol};
    }

    function getParticipateTxDetails(){
        const network_symbol = participateStore.sending.is_token ? participateStore.sending.network_symbol : participateStore.sending.symbol;
        let data = {'value': participateInfo.participateValue, 'secret_hash': participateStore.initialContractInfo.secret_hash }
        let path = `${network_symbol}/${participateStore.sending.vk}/${participateInfo.participateAliceAddress}`
        if (participateStore.sending.is_token) path = `${path}/${participateStore.sending.token_address}`;
        return API('POST', 'participate', path, data)
            .then(result => { return result; })
            .catch (e => { console.log(e); error = e; })
    }

    function storeParticipateInfo(){
        participateStore.type = 'participate';
        participateStore.participateInfo = participateInfo;
        participateStore.created = new Date();
        CoinStore.storeSwapInfo(participateStore.sending, participateStore);
        continueSwap = true;
    }

    function finishParticipateSwap(){
        try{
            CoinStore.updateSwapInfo(participateStore.sending, participateStore.txInfo.secret_hash, 'initialRedeemInfo', createInitalRedeemInfo());
        } catch (e){
            console.log(e)
            error = e;
            return;
        }
        switchPage('SwapsMain');     
    }

    function createInitalRedeemInfo(){
        const participateContract =  participateStore.txInfo.contract_address || participateStore.txInfo.contract;
        const network_symbol = participateStore.sending.is_token ? participateStore.sending.network_symbol : participateStore.sending.symbol;
        return JSON.stringify({
            transactionAddress: participateStore.txResult.transaction_address, 
            participateContract,
            network_symbol,
        });
    }

    function checkPublish(transaction) {
        status = `Waiting for Tx to Publish`;
        const network_symbol = participateStore.sending.is_token ? participateStore.sending.network_symbol : participateStore.sending.symbol;
        return waitUntilTransactionExists(network_symbol, transaction)
            .then(result => {
                if (result) {status = "Transaction Published"; return true};
                if (!result) status = "Could not find transaction in block";
                return false;
            })
            .catch(e => error = e);
    }

</script>
{#if error}{error}{:else}{status}{/if}

<h1> Participate in a Swap</h1>

{#if !continueSwap}
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

{#if continueSwap}
    <form on:submit|preventDefault={() => handleSubmit2(formObj2) } bind:this={formObj2} target="_self">
        <div>
            {`Recieving ${participateStore.initialContractInfo.value_text} for ${participateInfo.participateValue} (${participateInfo.participateCurrency}) `}<br>
            Swap Initiated by: {participateStore.initialContractInfo.refund_address} <br>
            Swap exipiry date: {new Date(participateStore.initialContractInfo.locktime)}<br>
            <a href={participateStore.initialContractInfo.transaction_link} target="_blank" rel="noopener noreferrer">
                {`${participateStore.initialContractInfo.value_text} was sent to swap contract (${participateStore.initialContractInfo.confirmations} confirmations)`}
            </a>
        </div>
        <div>
            {#if $CoinStore.filter(f => f.symbol === participateInfo.participateCurrency ).length > 0}
                <label>{`Select ${participateInfo.participateCurrency} Wallet to Participate in Swap`}</label>
                <MyCoinsDropDown 
                        id="participateWalletDD" 
                        on:selected={(evt) => handleSelection(evt, 'participateWallet')}
                        required={true} filter={filterSelection()} />
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
        <input type="submit" value="Participate in Swap" required disabled={!participateStore.sending}>
    </form>
    
    
{/if}

{ console.log(participateInfo)}