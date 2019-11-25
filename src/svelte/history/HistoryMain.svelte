<script>
    import { onMount } from 'svelte';
    
    //Stores
    import { breadcrumbs } from '../../js/stores/stores.js';

	//Components
    import { Transaction }  from '../../js/router.js'
    
    //Props
    export let filter;

	onMount(() => {
        if (!filter) breadcrumbs.set([{name: 'History', page: 'HistoryMain'}]);
    });
    
    $: txByDay = groupByDate();

    let txList = [
        {
            date: '2019-11-21T03:24:00',
            type: 'Sent',
            amount: '2000.12',
            coin: {name: 'Lamden', network: 'lamden', symbol: 'TAU', vk:'d6ade800dd94bb641ebcde3141d97a7fb1f1e32c7a9bbc4f399b914731217d1c'},
            txResult: {transaction_link: 'www.google.com'}
        },
        {
            date: '2019-11-22T04:14:00',
            type: 'Recieved',
            amount: '10',
            coin: {name: 'Lamden', network: 'lamden', symbol: 'TAU', vk:'d6ade800dd94bb641ebcde3141d97a7fb1f1e32c7a9bbc4f399b914731217d1c'},
            txResult: {transaction_link: 'www.google.com'}
        },
        {
            date: '2019-11-21T16:44:00',
            type: 'Sent',
            amount: '83854.16',
            coin: {name: 'Lamden', network: 'lamden', symbol: 'TAU', vk:'d6ade800dd94bb641ebcde3141d97a7fb1f1e32c7a9bbc4f399b914731217d1c'},
            txResult: {transaction_link: 'www.google.com'}
        },
        {
            date: '2019-11-21T12:30:10',
            type: 'Sent',
            amount: '100',
            coin: {name: 'Lamden', network: 'lamden', symbol: 'TAU', vk:'d6ade800dd94bb641ebcde3141d97a7fb1f1e32c7a9bbc4f399b914731217d1c'},
            txResult: {transaction_link: 'www.google.com'}
        },
        {
            date: '2019-11-20T10:20:44',
            type: 'Sent',
            amount: '0.0045632',
            coin: {name: 'Lamden', network: 'lamden', symbol: 'TAU', vk:'d6ade800dd94bb641ebcde3141d97a7fb1f1e32c7a9bbc4f399b914731217d1c'},
            txResult: {transaction_link: 'www.google.com'}
        },
        {
            date: '2019-11-22T18:55:17',
            type: 'Sent',
            amount: '1000.0045632',
            coin: {name: 'Lamden', network: 'lamden', symbol: 'TAU', vk:'d6ade800dd94bb641ebcde3141d97a7fb1f1e32c7a9bbc4f399b914731217d1c'},
            txResult: {transaction_link: 'www.google.com'}
        },
    ]

    function filterTxList(){
        if (filter){
            return txList.filter( f => {
                return  f.coin.network === filter.network && f.coin.symbol === filter.symbol && f.coin.vk === filter.vk;
            });
        }
        return txList;
    }

    function sortTxList(){
        filterTxList().sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    function groupByDate(){
        sortTxList();
        let txDict = {};
        txList.map(tx => {
            let day = tx.date.split("T")[0]
            if (!txDict[tx.date.split("T")[0]]){
                txDict[tx.date.split("T")[0]] = [tx];
            }else{
                txDict[tx.date.split("T")[0]].push(tx);
            }   
        })
        return txDict
    }

</script>

<style>
.history{
    display:flex;
    flex-direction: column;
}

.section-header{
    margin: 24px 0 18px;
}
</style>

<div class="history">
    {#each Object.keys(txByDay) as day}
        <div class="section-header text-body2">
            {new Date(day).toDateString()}
        </div>
        {#each txByDay[day] as tx}
            <Transaction txInfo={tx}/>
        {/each}
    {/each}
</div>
