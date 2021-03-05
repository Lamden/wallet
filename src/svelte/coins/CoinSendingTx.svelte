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
    let message = 'Sending Transaction'

    onMount(() => {
        chrome.runtime.sendMessage({type: 'sendLamdenTransaction', data: txData.txInfo}, (response) => {
            message = response.status
            if (message === "Transaction cancelled by user") {
                setTimeout(home, 1500);
            }
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
    background: inherit;
}
</style>

<div class="sending-tx flex-column">
    <h2>{message}</h2>
    <Loading />
</div>