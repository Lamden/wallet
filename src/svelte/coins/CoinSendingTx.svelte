<script>
    import { onMount, createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    
    //Components
    import { Components }  from '../Router.svelte';
    const { Loading } = Components;

    //Props
    export let txData;
    let message = 'Sending Transaction'


    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        console.log(message)
        console.log(sender)
        console.log(sender.tab ?
                    "from a content script:" + sender.tab.url :
                    "from the extension");
        if (message.type === "txResult" && !sender.tab){
            dispatch('txResult', message.data)
        }
        sendResponse('ok');
    });

    onMount(() => {
        let url = window.location.toString()
        chrome.runtime.sendMessage({type: 'sendLamdenTransaction', data: txData.txInfo, url}, (response) => {
            message = response.status
        })
    })

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