<script>
    import { onMount, onDestroy, createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    
    //Components
    import { Components }  from '../Router.svelte';
    const { Loading } = Components;

    //Props
    export let txData;
    let message = 'Sending Transaction'

    onMount(() => {
        chrome.runtime.sendMessage({type: 'sendLamdenTransaction', data: txData.txInfo}, (response) => {
            message = response.status
        })
    })

    onDestroy(() => {
        chrome.runtime.onMessage.removeListener(txStatus)
    })

    const txStatus = (message, sender, sendResponse) => {
        if (message.type === "txStatus"){
            if (typeof message.data.resultInfo !== 'undefined'){
                if (message.data.resultInfo.title !== "Transaction Pending"){
                    dispatch('txResult', message.data)
                }                
            }
            sendResponse('ok');      
        }
    }
    chrome.runtime.onMessage.addListener(txStatus)

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
    <h5>{message}</h5>
    <Loading />
</div>