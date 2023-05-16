<script>
    import { onMount, onDestroy, createEventDispatcher, getContext } from 'svelte';
    const dispatch = createEventDispatcher();

    
    //Components
    import { Components }  from '../Router.svelte';
    const { Loading } = Components;

    //Context
    const { home } = getContext('tx_functions');

    //Props
    export let txData;
    export let txallInfo;
    let message = !txallInfo?'Sending Transaction':'Checking Again'

    onMount(() => {
        if (!txallInfo){
            chrome.runtime.sendMessage({type: 'sendLamdenTransaction', data: txData.txInfo}, (response) => {
                message = response.status
                if (message === "Transaction cancelled by user") {
                    setTimeout(home, 1500);
                }
            })
        } else if(txallInfo.resultInfo.statusCode === 2) {
            // check again
            chrome.runtime.sendMessage({type: 'retryFetchTransactionResult', data: txallInfo}, (response) => {
                message = response.status
            })
        }
    })

    onDestroy(() => {
        document.removeEventListener('txStatus', txStatus)
    })

    const txStatus = (e) => {
        let data = e.detail
        if (typeof data.resultInfo !== 'undefined'){
            if (data.resultInfo.title !== "Transaction Pending"){
                dispatch('txResult', data)
            }                
        }   
    }
    document.addEventListener('txStatus', txStatus);

</script>

<style>
.sending-tx{
    height: 224px;
    width: 668px;
    align-items: center;
    justify-content: space-around;
    background: inherit;
}
</style>

<div class="sending-tx flex-column">
    <h2>{message}</h2>
    <Loading />
</div>