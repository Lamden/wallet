<script>
	import { createEventDispatcher } from 'svelte';

    //Utils
    import { API } from '../../js/api.js';

    export let id;
    export let required = false;

    const dispatch = createEventDispatcher();

    let coinList = [];
    let selected;
    let supportedCoins = getSupportedCoins();
    let supportedTokens = getSupportedTokens();

    function getSupportedCoins(){
        return API('GET', 'networks-list');
    }

    function getSupportedTokens(){
        return API('GET', 'networks-list', 'ETH/tokens');
    }

    function createCoinList(data){
            let coins = data[0];
            let tokens = data[1].tokens;
            tokens.map(function(token){
                token.token = true;
                token.network = 'ethereum';
                token.network_symbol = 'ETH'
                return token;
            });
            coinList = [...coins['bitcoin_networks'], ...coins['ethereum_networks'], ...tokens];
            coinList.map(function(token){
                if (token.name === 'test-ethereum') token.name ='Ethereum TestNet (kovan)';
                return token;
            });
            coinList = coinList.sort((a, b) => (a.symbol > b.symbol) ? 1 : -1)
            return coinList;
        }

        function dispatchSelected() {
            console.log('dispatching')
            console.log(selected)
            dispatch('selected', {
                selected,
            });
        }
        
</script>

{#await Promise.all([supportedCoins, supportedTokens])}
    <select id={id} bind:value={selected}>
        <option value={'temp'}>...fetching supported coins...</option>
    </select>
    
{:then data}
    <select id={id} 
            bind:value={selected}
            on:change={dispatchSelected}
            required>
        <option value='temp'>choose...</option>
        {#each createCoinList(data) as coin}
            <option value={coin} class="dropdownItem">{`(${coin.symbol}) ${coin.name}`}</option>
        {/each}
    </select>
{:catch error}
    <p style="color: red">API server unavailable</p>
{/await}

