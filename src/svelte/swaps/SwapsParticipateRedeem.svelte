<script>
    import { onMount, getContext} from 'svelte';

	//Stores
    import { CoinStore, Hash, SettingsStore} from '../../js/stores.js';
    
    //Components
    import { SupportedCoinsDropDown, MyCoinsDropDown }  from '../../js/router.js'

    // Utils
    import { API, waitUntilTransactionExists, getSecret, sendSignedTx, getRedeemTxDetails, getRefundTxDetails } from '../../js/api.js';
    import { checkPassword, encryptStrHash, decryptStrHash, stripCoinRef } from '../../js/utils.js';
    import { validateAddress, signTx } from '../../js/crypto/wallets.js';

    //Context
    const { switchPage } = getContext('switchPage');

    //DOM Nodes
    let formObj, initialRedeemField, passwordField;

    console.log("MOCKED DATA FOR TESTING")

    let error, status, secret = "";
    let vk, network_symbol;
    let password = "";
    let contractInfo;
    let swapInfo;

	onMount(() => {
        if ($SettingsStore.currentPage.data.type === 'participate'){
            swapInfo = $SettingsStore.currentPage.data;
            $SettingsStore.currentPage.data = {};
            
            vk = swapInfo.initialContractInfo.recipient_address;
            network_symbol = swapInfo.participateInfo.initialCurrency;
        }
    });
        
    function validatePassword(){
        passwordField.setCustomValidity('');
        if (!checkPassword(password, $Hash)) {
            passwordField.setCustomValidity("Incorrect Password");
        }
    }

    function handleSubmit(obj){
         error = '';
        if (obj.checkValidity()){
            extractSecret();
            console.log(swapInfo);

             const receivingCoin = getCoinFromWallet();
             console.log(receivingCoin)

            if (receivingCoin){
                status = `${vk} found in you wallet, redeeming...`
                CoinStore.updateSwapInfo(swapInfo.sending, swapInfo.txInfo.secret_hash, 'receiving', receivingCoin);
                swapInfo.receiving = receivingCoin;
                
                redeemTxDetials();
                console.log(swapInfo);
                
                if (swapInfo.hasOwnProperty('redeemTxInfo')) sendTx( signedTx() );
                console.log(swapInfo);
                
            }else{
                error = `Please add ${vk} to your wallet.`;
            }
            
        }
    }

    async function extractSecret(){
        status = 'Checking if other party has redeemed thier tokens...';
        let secretTx = await getSecret(network_symbol, swapInfo.txResult.transaction_address)
                            .catch (e => { console.log(e); error = e; });
        if (!secretTx) return;
        if (secretTx.message) {error = secretTx.message; return;}
        swapInfo.initialContractInfo.secret = secretTx.secret;
        CoinStore.updateSwapInfo(swapInfo.sending, swapInfo.txInfo.secret_hash, 'secret', secretTx.secret);
        status = 'Redeem Transaction Details Recieved!';
    }

    function getCoinFromWallet(){
        if (swapInfo.participateInfo.initialTokenAddress){
            return  $CoinStore.find(f => f.vk === vk && f.token_address === swapInfo.participateInfo.initialTokenAddress)
        }else{
            return  $CoinStore.find(f => f.vk === vk && f.symbol === network_symbol)
        }
    }

    async function redeemTxDetials(){
        status = 'Getting Redeem Transaction Details...';
        let txInfo = await getRedeemTxDetails(
                                network_symbol,
                                swapInfo.initialContractInfo.contract_address,
                                swapInfo.initialContractInfo.transaction_address,
                                swapInfo.initialContractInfo.secret,
                           ).catch (e => { console.log(e); error = e; });
        if (!txInfo) return;
        if (txInfo.message) {error = txInfo.message; return;}
        swapInfo.redeemTxInfo = txInfo;
        status = 'Redeem Transaction Details Recieved!';
    }

    function signedTx(){
        const network = swapInfo.receiving.network;
        const unsigned_transaction =  network === 'ethereum'  ?  swapInfo.redeemTxInfo.transaction : swapInfo.redeemTxInfo.contract_transaction;
        let signed_transaction = "";
        try{
            signed_transaction = signTx(unsigned_transaction, 
                                        decryptStrHash(password, swapInfo.receiving.sk), 
                                        network, 
                                        network_symbol);
        }catch (e) {
            console.log(e)
            error = e;
        }
        return {signed_transaction, network_symbol};
    }

    async function sendTx(signedTxInfo){
        status = 'Sending Redeem Transaction...';
        console.log(signedTxInfo)
        let txResult = await sendSignedTx( signedTxInfo  )
                                .catch (e => { console.log(e); error = e; });
        if (!txResult) return;
        if (txResult.message) {error = txResult.message; return;}

        //Check to make sure the transaction was published (does not mean confirmed)
        let txOkay = await checkPublish(txResult.transaction_address);
        if (txOkay) {
            status = 'Redeem Transaction Sent!';
            swapInfo.redeemTxResult = txResult;
            swapInfo.redeemTxResult.sent = new Date();
            finishParticipateRedeem();
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

    function finishParticipateRedeem(){
        try{
            CoinStore.updateSwapInfo(swapInfo.sending, swapInfo.txInfo.secret_hash, 'redeemTxInfo', swapInfo.redeemTxInfo);
            CoinStore.updateSwapInfo(swapInfo.sending, swapInfo.txInfo.secret_hash, 'redeemTxResult', swapInfo.redeemTxResult);
        } catch (e){
            console.log(e)
            error = e;
            return;
        }
        switchPage('SwapsMain');
    }

</script>

{#if error}{error}{:else}{status}{/if}
{#if swapInfo}
    <h1> {`Redeem ${swapInfo.participateInfo.initialCurrency}`} </h1>
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
                <input type="submit" value={`Redeem ${swapInfo.participateInfo.initialCurrency}`} required >
        </form>
    </div>
{/if}
