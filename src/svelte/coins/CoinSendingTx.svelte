<script>
    import { onMount, getContext } from 'svelte';
    
    //Components
    import { Components }  from '../../js/router.js';
    const { Loading } = Components;

    //Context
    const { send } = getContext('tx_functions');

    onMount(() => {
        new Promise(function(resolve, reject) {
            setTimeout(() => {
                send()
                resolve();
            }, 2000);
        })
    })
</script>

<style>
.sending-tx{
    height: 224px;
    width: 718px;
    align-items: center;
    justify-content: space-around;
}
</style>

<div class="sending-tx flex-column">
    <h5>Sending Transaction</h5>
    <Loading />
</div>