<script>
    import { onMount, getContext} from 'svelte';

	//Stores
    import { CoinStore, HashStore, SettingsStore} from '../../js/stores.js';
    
    //Components
    import { SupportedCoinsDropDown, MyCoinsDropDown }  from '../../js/router.js'

    // Utils
    import { API, waitUntilTransactionExists, getSwapInfo, sendSignedTx, getRedeemTxDetails, getRefundTxDetails } from '../../js/api.js';
    import { checkPassword, encryptStrHash, decryptStrHash, stripCoinRef } from '../../js/utils.js';
    import { validateAddress, signTx } from '../../js/crypto/wallets.js';

    //Context
    const { switchPage } = getContext('switchPage');

    //DOM Nodes
    let formObj, initialRedeemField, passwordField;

    console.log("MOCKED DATA FOR TESTING")

    let error, status = "";
    let password = "";
    let contractInfo;
    let swapInfo;
    let initialRedeemString = '{"transactionAddress":"0xae29f38c86f21fb4fddbbf8c4b5092387e4c90fab8d2cef27b56a75f35928c32","participateContract":"0xce07aB9477BC20790B88B398A2A9e0F626c7D263","network_symbol":"ETH-TESTNET"}';
    $: initialRedeemInfo = initialRedeemString === '' ? {} : JSON.parse(initialRedeemString);
    let receivingCoin;

	onMount(() => {
        if ($SettingsStore.currentPage.data.type === 'initial'){
            swapInfo = $SettingsStore.currentPage.data;
            $SettingsStore.currentPage.data = {};
        }else{
            swapInfo = {};
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
            swapInfo.initialRedeemInfo = initialRedeemInfo;
             receivingCoin = getCoinFromWallet();
             console.log(receivingCoin)
            if (receivingCoin){
                status = `${swapInfo.receiving.myVk} found in you wallet, redeeming...`
                
                await participateSwapDetails();
                console.log(swapInfo);

                await redeemTxDetials();
                console.log(swapInfo);

                await sendTx( signedTx() );
                console.log(swapInfo);
            }else{
                error = `Please add ${swapInfo.receiving.myVk} to your wallet.`;
            }
        }
    }

    function getCoinFromWallet(){
        if (swapInfo.receiving.is_token){
            return  $CoinStore.find(f => { return (
                        f.vk === validateAddress(swapInfo.receiving.network, swapInfo.receiving.myVk) && 
                        f.token_address === validateAddress(swapInfo.receiving.network,swapInfo.receiving.token_address)
                    )})
        }else{
            return  $CoinStore.find(f => { return (
                f.vk === validateAddress(swapInfo.receiving.network, swapInfo.receiving.myVk) && 
                f.symbol === swapInfo.receiving.symbol
            )})
        }
    }

    async function participateSwapDetails(){
        status = 'Retriving Swap Details...';
        let swapInfo = await getSwapInfo(initialRedeemInfo.network_symbol, initialRedeemInfo.participateContract, initialRedeemInfo.transactionAddress)
                                .catch (e => { console.log(e); error = e; });
        if (!swapInfo) return;
        if (swapInfo.message) {error = swapInfo.message; return;}
        swapInfo.participateContractInfo = swapInfo;
        status = 'Swap Contract Recieved!';
    }

    async function redeemTxDetials(){
        status = 'Getting Redeem Transaction Details...';
        let txInfo = await getRedeemTxDetails(
                                swapInfo.initialRedeemInfo.network_symbol,
                                swapInfo.initialRedeemInfo.participateContract,
                                swapInfo.initialRedeemInfo.transactionAddress,
                                decryptStrHash(password, swapInfo.txInfo.secret),
                           ).catch (e => { console.log(e); error = e; });
        if (!txInfo) return;
        if (txInfo.message) {error = txInfo.message; return;}
        swapInfo.redeemTxInfo = txInfo;
        status = 'Redeem Transaction Details Recieved!';
    }

    function signedTx(){
        const network_symbol = swapInfo.initialRedeemInfo.network_symbol;
        const unsigned_transaction =  swapInfo.receiving.network === 'ethereum'  ?  swapInfo.redeemTxInfo.transaction : swapInfo.redeemTxInfo.contract_transaction;
        let signed_transaction = "";
        try{
            signed_transaction = signTx(unsigned_transaction, 
                                        decryptStrHash(password, receivingCoin.sk), 
                                        swapInfo.receiving.network, 
                                        network_symbol);
        }catch (e) {
            console.log(e)
            error = e;
        }
        return {signed_transaction, network_symbol};
    }

    async function sendTx(signedTxInfo){
        status = 'Sending Redeem Transaction...';
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
            finishInitialRedeem();
        }
    }

    function checkPublish(transaction) {
        status = `Waiting for Tx to Publish`;
        return waitUntilTransactionExists(swapInfo.initialRedeemInfo.network_symbol, transaction)
            .then(result => {
                if (result) {status = "Transaction Published"; return true};
                if (!result) status = "Could not find transaction in block";
                return false;
            })
            .catch(e => error = e);
    }

    function finishInitialRedeem(){
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

<style>

</style>

{#if error}{error}{:else}{status}{/if}
{#if swapInfo}
    <h1> {`Redeem ${swapInfo.receiving.symbol}`} </h1>
    <div>
        <form on:submit|preventDefault={() => handleSubmit(formObj) } bind:this={formObj} target="_self">
            <div>
                <label>Enter Swap String</label><br>
                <small>This is the string provided to you by the other participant after they joined your swap</small><br>
                <input type="text" required
                    bind:value={initialRedeemString}
                    bind:this={initialRedeemField} />
            </div>
            <div>
                <label>Wallet Password</label><br>
                <input  bind:value={password}
                        bind:this={passwordField}
                        on:change={() => validatePassword()}
                        type="password"
                        required  />
            </div>
                <input type="submit" value={`Redeem ${swapInfo.receiving.symbol}`} required disabled={initialRedeemString === ""}>
        </form>
    </div>
{/if}