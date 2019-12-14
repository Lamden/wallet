<script>
    import { onMount, getContext, createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    //Stores
    import { password } from '../../js/stores/stores.js';
    
    //Components
    import { Components }  from '../../js/router.js';
    const { Loading } = Components;

    //Utils
    import { TransactionBuilder } from  '../../js/lamden/transactionBuilder.js';
    import { decryptStrHash } from '../../js/utils.js';

    //Props
    export let txData;

    let transaction;

    $: sendingCoin = txData.sender

    onMount(() => {
        send();
    })

    async function send(){
        await createTransaction();
        //await sendTransaction();
    }

    async function createTransaction(){
        let kwargs1 = {
            'to': {
                'value': '2a60bc77f404fb07c712b4af3d73f838949e4d0802fd16cba8af0668320aa4f8',
                'type': 'data'
            },
            'amount': {
                'value': 10000,
                'type': 'fixedPoint'
            }
        }

        let txb = new TransactionBuilder(sendingCoin.vk, 'currency', 'transfer', kwargs1, 40000)
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
        await transaction.send(decryptStrHash($password, sendingCoin.sk), (res, error) =>{
                if (err) {
                    txResult.error = err;
                    dispatch('txResult', txResult)
                    return;
                }
                console.log(res)
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