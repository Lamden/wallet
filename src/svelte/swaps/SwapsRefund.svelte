<script>
    import { onMount, getContext} from 'svelte';

	//Stores
    import { CoinStore, HashStore, SettingsStore} from '../../js/stores.js';

    // Utils
    import { API, waitUntilTransactionExists, sendSignedTx, getRefundTxDetails } from '../../js/api.js';
    import { checkPassword, encryptStrHash, decryptStrHash, stripCoinRef } from '../../js/utils.js';
    import { validateAddress, signTx } from '../../js/crypto/wallets.js';

    //DOM Nodes
    let formObj, passwordField;

    //Context
    const { switchPage } = getContext('switchPage');
    
    let error, status = "";
    let password = "";
    let RefundStore;

    let network, network_symbol, transaction_address, contract = "";

    onMount(() => {
        if ($SettingsStore.currentPage.data.type){
            RefundStore = $SettingsStore.currentPage.data;
            $SettingsStore.currentPage.data = {};

            network = RefundStore.sending.network;
            network_symbol = RefundStore.sending.is_token ? RefundStore.sending.network_symbol : RefundStore.sending.symbol;
            transaction_address = RefundStore.txResult.transaction_address;
            contract = RefundStore.txInfo.contract_address;

        }else{
            RefundStore = {};
        }
    });

    function validatePassword(){
        passwordField.setCustomValidity('');
        if (!checkPassword(password, $HashStore.encode)) {
            passwordField.setCustomValidity("Incorrect Password");
        }
    }
    
    async function handleSubmit(obj){
         error = '';
        if (obj.checkValidity()){

            await refundTxDetails();
            console.log(RefundStore.refundTxInfo)

            await sendTx( signedTx() );
        }
    }
    
    async function refundTxDetails(){
        status = 'Getting Refund Transaction Details...';
        let txInfo = await getRefundTxDetails(network_symbol, contract, transaction_address)
                            .catch (e => { console.log(e); error = e; });
        if (!txInfo) return;
        if (txInfo.message) {error = txInfo.message; return;}
        RefundStore.refundTxInfo = txInfo;
        status = 'Refund Transaction Details Recieved!';
    }

    function signedTx(){
        const unsigned_transaction =  network === 'ethereum'  ?  RefundStore.refundTxInfo.transaction : RefundStore.refundTxInfo.contract_transaction;
        let signed_transaction = "";
        try{
            signed_transaction = signTx(unsigned_transaction, decryptStrHash(password, RefundStore.sending.sk), network, network_symbol);
        }catch (e) {
            console.log(e)
            error = e;
        }
        return {signed_transaction, network_symbol};
    }

    async function sendTx(signedTxInfo){
        status = 'Sending Refund Transaction...';
        let txResult = await sendSignedTx( signedTxInfo  )
                                .catch (e => { console.log(e); error = e; });
        if (!txResult) return;
        if (txResult.message) {error = txResult.message; return;}

        //Check to make sure the transaction was published (does not mean confirmed)
        let txOkay = await checkPublish(txResult.transaction_address);
        if (txOkay) {
            status = 'Refund Transaction Sent!';
            RefundStore.refundTxResult = txResult;
            RefundStore.refundTxResult.sent = new Date();
            finishRefund();
        }
    }

    function checkPublish(transaction) {
        status = `Waiting for Tx to Publish`;
        return waitUntilTransactionExists(network_symbol, transaction)
            .then(result => {
                if (result) {status = "Transaction Published"; return true};
                if (!result) status = "Could not find transaction in block";
                return false;
            })
            .catch(e => error = e);
    }

    function finishRefund(){
        console.log(RefundStore)
    }

</script>

{#if error}{error}{:else}{#if status}{status}{/if}{/if}
{#if RefundStore}
    <h1> {`Refund ${RefundStore.sending.symbol}`} </h1>
    <div>
        <form on:submit|preventDefault={() => handleSubmit(formObj) } bind:this={formObj} target="_self">
            <div>
                <label>Wallet Password</label><br>
                <input  bind:value={password}
                        bind:this={passwordField}
                        on:change={() => validatePassword()}
                        type="password"
                        required  />
            </div>
                <input type="submit" value={`Refund ${RefundStore.sending.symbol}`} >
        </form>
    </div>
{/if}