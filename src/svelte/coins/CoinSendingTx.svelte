<script>
    import { onMount, getContext, createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    //Stores
    import { password, currentNetwork } from '../../js/stores/stores.js';
    
    //Components
    import { Components }  from '../Router.svelte';
    const { Loading } = Components;

    //Utils
    import { TransactionBuilder } from  '../../js/lamden/transactionBuilder.js';
    import { decryptStrHash } from '../../js/utils.js';

    //Props
    export let txData;

    let transaction;

    $: sendingCoin = txData.sender
    $: contractName = txData.txInfo.contractName
    $: methodName = txData.txInfo.methodName
    $: stampLimit = txData.txInfo.stampLimit
    $: kwargs = txData.txInfo.args

    onMount(() => {
        send();
    })

    async function send(){
        await createTransaction();
        await sendTransaction();
    }

    async function createTransaction(){
        let txb = new TransactionBuilder(
            $currentNetwork, 
            sendingCoin.vk, 
            contractName, 
            methodName, 
            kwargs, 
            stampLimit
        )
        await txb.getNonce((res, err) => {
            let txResult = {};
            if (err) {
                txResult.error = err;
                dispatch('txResult', txResult)
                return;
            }
            transaction = txb
        })
    }

    async function sendTransaction(){
        await transaction.send(decryptStrHash($password, sendingCoin.sk), (res, err) =>{
            let txResult = {};
            if (err) {
                txResult.error = err;
            }else{
                txResult = res;
            }
            dispatch('txResult', txResult)
        })
    }
</script>

<style>
.sending-tx{
    height: 224px;
    width: 668px;
    align-items: center;
    justify-content: space-around;
}
</style>

<div class="sending-tx flex-column">
    <h5>Sending Transaction</h5>
    <Loading />
</div>