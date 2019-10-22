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

    let error, status = '';
    let password = '';
    let openModal = false;
    let currentModal = '';
    let showContractInfo = false;

    let participateString = '';   
    let participateCoin;
    let sendingTokenInfo;
    let receivingTokenInfo;
    let sendingCoinSymbol;
    $: swapInfo = {};

	onMount(() => {
        if ($SettingsStore.currentPage.data.type === 'participate'){
            swapInfo = $SettingsStore.currentPage.data;
            $SettingsStore.currentPage.data = {};
        }else{
            swapInfo = {};
        }
    });

    function displayError(e){
        console.log(e); 
        error = e;
        throw new Error(e);
    }

    function filterSelection(){
        return swapInfo.sending.symbol;
    }
    
    function handleCoinSelection(evt, type){
        if (!evt.detail.selected) return;
        if (type === 'sending' ) swapInfo.sending = { ...stripCoinRef(evt.detail.selected), ...sendingTokenInfo };
        if (type === 'receiving' ) swapInfo.receiving = stripCoinRef(evt.detail.selected);
        console.log(swapInfo)
    }

    function getMyCoinInfo(){
        return  { network_symbol: swapInfo.participateInfo.participateCurrency,
                  symbol: swapInfo.sending.symbol,
                  vk: swapInfo.initialContractInfo.recipient_address,
                }
    }

    function showModal(modal){
        currentModal = modal;
        openModal = true;
    }
    
    function closeModal(){
        openModal = false;
    }

    function validatePassword(){
        passwordField.setCustomValidity('');
        if (!checkPassword(password, $Hash)) {
            passwordField.setCustomValidity("Incorrect Password");
        }
    }

    async function handleSwapDeatils(){
        error = '';
        if (formObj1.checkValidity()){
            console.log(sendingTokenInfo);
            console.log(receivingTokenInfo);
            status = 'Getting Deatils from Participant String...';
            storeParticipateInfo();

            status = 'Getting Swap Details from Blockchain Contract...';
            swapInfo.initialContractInfo = await swapContractInfo(swapInfo.participateInfo.initialCurrency,
                                                                  swapInfo.participateInfo.contract,
                                                                  swapInfo.participateInfo.transactionAddress);

            swapInfo.secret_hash = swapInfo.initialContractInfo.secret_hash;

            if (swapInfo.participateInfo.participateTokenAddress){
                status = 'Getting "Sending Token" Details...';
                sendingTokenInfo = await tokenInfo( swapInfo.participateInfo.participateCurrency, 
                                                    swapInfo.participateInfo.participateTokenAddress)
                sendingTokenInfo.token_symbol = sendingTokenInfo.symbol;
            }

            swapInfo.sending = {}
            swapInfo.sending.symbol = sendingTokenInfo.symbol ? sendingTokenInfo.symbol : swapInfo.participateInfo.participateCurrency;
            showContractInfo = true;

            console.log(swapInfo)
        }
    }

    async function handleSubmit2(){
         error = '';
        if (formObj2.checkValidity()){
            if (swapInfo.sending.is_token){
                if (!swapInfo.hasOwnProperty('approveTxResult')){
                    swapInfo.approveTx = await approveTokenTxDetails( swapInfo.sending );

                    status = 'Signing Approve Token Transaction';
                    swapInfo.approveTx.signed_transaction = await sign( swapInfo.approveTx, swapInfo.sending );

                    status = 'Publishing Approve Token Transaction...';
                    swapInfo.approveTxResult = await sendTx( swapInfo.sending.network_symbol, swapInfo.approveTx.signed_transaction );

                    status = 'Checking for Confirmation of Approve Token Transaction...';
                    if ( await confirmSwapTransaction(swapInfo.approveTxResult, swapInfo.sending) ) {
                        status = 'Approve Token Transaction Confirmed!';
                        swapInfo.approveTxResult.sent = new Date();
                    }else{
                        displayError('Error: Cannot Approve Token Transaction.')
                        switchPage('SwapsMain');
                    }
                }
            }
            
            status = 'Getting Swap Participate Transaction Details...';
            let txInfo = await getParticipateTxDetails();
            if (!txInfo) return;
            if (txInfo.message) {error = txInfo.message; return;}
            swapInfo.txInfo = txInfo;
            status = 'Swap Participate Transaction Details Recieved!';
        }
        
        status = 'Sending Swap Participate Transaction...';
        let txResult = await sendSignedTx( signedTx(swapInfo.txInfo) )            
                                    .catch (e => { console.log(e); error = e; });
        if (!txResult) return;
        if (txResult.message) {error = txResult.message; return;}
        console.log(txResult)

        //Check to make sure the transaction was published (does not mean confirmed)
        let txOkay = await checkPublish(txResult.transaction_address);
        if (txOkay) {
            status = 'Swap Participate Transaction Sent!';
            swapInfo.txResult = txResult;
            swapInfo.txResult.sent = new Date();
            try{
                CoinStore.updateSwapInfo(swapInfo.sending, swapInfo.txInfo.secret_hash, 'txResult', swapInfo.txResult);
            } catch (e){
                displayError(e);
            }
            finishParticipateSwap();
        }

    }

    function parseParticipateString(string){
        if (string.length > 0){
            try{
                swapInfo.participateInfo = JSON.parse(string);
            } catch (e) {
                displayError (`Participant String is malformed. PLease contact the swap initiator and get a complete string.`);
            }
            return 
        }
    }

    function storeParticipateInfo(){
            swapInfo.type = 'participate';
            swapInfo.created = new Date();
    }

    function swapContractInfo(network_symbol, contract, transaction_address){
        return getSwapInfo(network_symbol, contract, transaction_address)
                    .then(result => {
                        if (result.message) { displayError(result.message); return; }
                        status = 'Swap Contract Recieved!';
                        return result;
                    })
                    .catch (e => displayError(e) );
    }

    function tokenInfo(network_symbol, token_address){
        return getTokenInfo(network_symbol, token_address)
                    .then(result => {
                        if (result.message) { displayError(result.message); return; }
                        status = 'Token Details Recieved!';
                        return result;
                    })
                    .catch (e => displayError(e) );        
    }

    function approveTokenTxDetails(coin){
        status = 'Getting Approve Token Details...';
        return getApproveTokenTxDetails(coin.network_symbol, coin.value, coin.vk, coin.token_address)
                        .then(result => {
                            if (result.message) {displayError(result.message); return;}
                            status = 'Approve Token Details Recieved!';
                            return result;
                        })
                        .catch ( e => displayError(e) );
    }

    function sign(txInfo, coin){
        const unsigned_transaction =  coin.network === 'ethereum'  ?  txInfo.transaction : txInfo.contract_transaction;
        try{
            let signed_transaction = signTx(unsigned_transaction, decryptStrHash(password, coin.sk), coin.network, coin.network_symbol);
            status = 'Transaction Signed!';
            return signed_transaction;
        }catch (e) {
            displayError(e);
        }
    }

    function sendTx(network_symbol, signed_transaction){
        return sendSignedTx( signed_transaction, network_symbol )
                    .then(result => {
                        if (!result || result.message) displayError('Error Publishing Transaction');
                        return result;
                    })            
                    .catch ( e => displayError(e) );
    }

    function getParticipateTxDetails(){
        const network_symbol = swapInfo.sending.is_token ? swapInfo.sending.network_symbol : swapInfo.sending.symbol;
        let data = {'value':swapInfo.participateInfo.participateValue, 'secret_hash': swapInfo.initialContractInfo.secret_hash }
        let path = `${network_symbol}/${swapInfo.sending.vk}/${ swapInfo.participateInfo.participateAliceAddress}`
        if (swapInfo.sending.is_token) path = `${path}/${swapInfo.sending.token_address}`;
        return API('POST', 'participate', path, data)
            .then(result => { return result; })
            .catch (e => { console.log(e); error = e; })
    }

    function finishParticipateSwap(){
        try{
            CoinStore.updateSwapInfo(swapInfo.sending, swapInfo.txInfo.secret_hash, 'initialRedeemInfo', createInitalRedeemInfo());
        } catch (e){
            console.log(e)
            error = e;
            return;
        }
        switchPage('SwapsMain');     
    }

    function createInitalRedeemInfo(){
        const participateContract =  swapInfo.txInfo.contract_address || swapInfo.txInfo.contract;
        const network_symbol = swapInfo.sending.is_token ? swapInfo.sending.network_symbol : swapInfo.sending.symbol;
        return JSON.stringify({
            transactionAddress: swapInfo.txResult.transaction_address, 
            participateContract,
            network_symbol,
        });
    }

    function checkPublish(transaction) {
        status = `Waiting for Tx to Publish`;
        const network_symbol = swapInfo.sending.is_token ? swapInfo.sending.network_symbol : swapInfo.sending.symbol;
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

{#if !swapInfo.hasOwnProperty('initialContractInfo')}
    <h1> Participate in a Swap</h1>

    <form on:submit|preventDefault={() => handleSwapDeatils() } bind:this={formObj1} target="_self">
        <div>

            {#if swapInfo.participateInfo}
                <h3>{`This is the information passed to you from the Initiator:`}</h3>
                <ul>
                    {#each [...Object.keys(swapInfo.participateInfo)] as item}
                        <li> <strong>{`${item}: `}</strong>{swapInfo.participateInfo[item]} </li>
                    {/each}
                </ul>
            {:else}
                <label>Enter Swap String</label><br>
                <small>This is a string of characters provided to you from the party that created the swap.</small><br>
                <input  type="text" required
                        bind:value={participateString}
                        bind:this={participateField} 
                        on:change={() => parseParticipateString(participateString)}/>
            {/if}

        </div>
        <input type="submit" value="Get Contract details from BC" required disabled={!swapInfo.hasOwnProperty('participateInfo')}>
    </form>
{/if}

{#if showContractInfo}
    <form on:submit|preventDefault={() => handleSubmit2(formObj2) } bind:this={formObj2} target="_self">
        <div>
            <h3>{`These are the deails of the contract created by the Initator:`}</h3>
            <ul>
                {#each [...Object.keys(swapInfo.initialContractInfo)] as item}
                    <li> <strong>{`${item}: `}</strong>{swapInfo.initialContractInfo[item]} </li>
                {/each}
            </ul>
        <div>
            {`Recieving ${swapInfo.initialContractInfo.value_text} for ${ swapInfo.participateInfo.participateValue} ${ swapInfo.sending.symbol}`}<br>
            Swap Initiated by: {swapInfo.initialContractInfo.refund_address} <br>
            Swap exipiry date: {new Date(swapInfo.initialContractInfo.locktime)}<br>
            <a href={swapInfo.initialContractInfo.transaction_link} target="_blank" rel="noopener noreferrer">
                {`${swapInfo.initialContractInfo.value_text} was sent to swap contract (${swapInfo.initialContractInfo.confirmations} confirmations)`}
            </a>
        </div>
        <div>
            {#if $CoinStore.filter(f => f.symbol === swapInfo.sending.symbol ).length > 0}
                <div>
                    <label>{`Select ${ swapInfo.sending.symbol } Wallet to Participate in Swap`}</label>
                    <MyCoinsDropDown 
                            id="sendingCoinDD" 
                            on:selected={(evt) => handleCoinSelection(evt, 'sending')}
                            required={true} filter={ [swapInfo.sending.symbol] } />
                </div>
            {:else}
                {`You cannot participate in this swap until you add a ${ swapInfo.sending.symbol} keypair to the wallet`}<br>
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
            {#if $CoinStore.filter(f => f.symbol === swapInfo.participateInfo.participateCurrency ).length > 0}
                <div>
                    <label>{`Select ${ swapInfo.participateInfo.participateCurrency } Wallet to Participate in Swap`}</label>
                    <MyCoinsDropDown 
                            id="receivingCoinDD" 
                            on:selected={(evt) => handleCoinSelection(evt, 'receiving')}
                            required={true} set={ getMyCoinInfo() }  />    
                </div>
            {:else}
                {`You cannot participate in this swap until you add a ${ swapInfo.participateInfo.participateCurrency } keypair to the wallet`}<br>
                <button on:click={() => switchPage('SwapsMain')}> Back </button>
                <button on:click={ () => showModal('CoinAdd') }> Add Coin </button>
                {#if openModal}
                    <Modal on:close="{() => closeModal()}">
                        <svelte:component this={ Modals[currentModal]} {closeModal} {openModal}/>
                    </Modal>
                {/if}
            {/if}
        </div>          
            <label>Wallet Password</label><br>
            <input  bind:value={password}
                    bind:this={passwordField}
                    on:change={() => validatePassword()}
                    type="password"
                    required  />
        </div>
        <input type="submit" value="Participate in Swap" required disabled={!swapInfo.sending}>
    </form>
{/if}

