<script>
    import { onMount, getContext } from 'svelte';
    
    //Components
    import { Components }  from '../../js/router.js';
    const { Loading } = Components;

    //Context
    const { appHome } = getContext('app_functions');
    const { deleteCoin, setPage, setResult } = getContext('coinmodify_functions');

    //Props
    export let coin;

    let buttons = [
        {id: 'home-btn', name: 'Home', click: () => appHome(), class: 'button__solid button__purple'}
    ]

    onMount(() => {
        new Promise(function(resolve, reject) {
            setTimeout(() => {
                deleteCoin()
                resolve();
            }, 2000);
        })
        .then(res => {
            setResult({
                title: 'Wallet Deleted',
                subtitle: `${coin.nickname} - ${coin.name} ${coin.symbol} Wallet deleted successfully`,
                message: "Successful Deletion",
                type: 'success',
                buttons
            })
            setPage(5)
        })
    })
</script>

<style>
.deleting-coin{
    height: 224px;
    width: 668px;
    align-items: center;
    justify-content: space-around;
}
</style>

<div class="deleting-coin flex-column">
    <h5>Deleting Coin from Wallet</h5>
    <Loading />
</div>