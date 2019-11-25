<script>
    import { getContext, onMount } from 'svelte';

    //Utils
    import { copyToClipboard } from '../../js/utils.js'

	//Stores
    import { SettingsStore, breadcrumbs } from '../../js/stores/stores.js';

    $: coin = $SettingsStore.currentPage.data
    $: symbol = coin.is_token ? coin.token_symbol : coin.symbol;
    $: balance = coin.balance ? coin.balance : 0;

    onMount(() => {
        breadcrumbs.set([
            {name: 'Holdings', page: {name: 'CoinsMain'}},
            {name: `${coin.name} ${symbol}`, page: {name: 'CoinDetails', data: coin}},
            {name: `Recieve ${symbol}`, page: {name: ''}},
        ]);
    });
</script>

<div class="recieve text-primary">
    <h2> Receive {coin.name} </h2>
    <div>
        <span>
            Public Key
            <small>{coin.name}  {symbol}</small>
            <small>${balance}</small>
        </span>
    </div>
    <a class="copy-link" href="javascript:void(0)" on:click={ () => copyToClipboard(coin.vk) }>{coin.vk}</a>
    <small>click address to copy</small>
</div>
