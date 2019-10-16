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

    let lamden = {name:'Lamden', symbol:'TAU', network_symbol: "TAU", testnet: true, network: 'lamden', token: false};
    let testTokens = [
            {decimals: 18,
            is_token: true,
            testnet: true,
            name: "TEST Polymath",
            network: "ethereum",
            network_symbol: "ETH-TESTNET",
            symbol: "POLY",
            token_address: "0xb347b9f5b56b431b2cf4e1d90a5995f7519ca792",
            token_symbol: "POLY"},
        ];

    function getSupportedCoins(){
        return API('GET', 'networks-list');
    }

    function getSupportedTokens(){
        return API('GET', 'networks-list', 'ETH/tokens');
    }

    function createCoinList(data){

            let coins = data[0];
            coins = [ ...coins['bitcoin_networks'], ...coins['ethereum_networks'] ]
            coins.map(function(coin){
                coin.is_token = false;
                coin.network_symbol = coin.symbol;
                return coin;
            });
            let tokens = data[1].tokens;
            tokens.map(function(token){
                token.is_token = true;
                token.testnet = false;
                token.network = 'ethereum';
                token.network_symbol = 'ETH';
                token.token_symbol = token.symbol;
                token.token_address = token.address;
                return token;
            });
            coinList = [...coins, ...tokens, ...testTokens];
            coinList.map(function(token){
                if (token.name === 'test-ethereum') token.name ='Ethereum TestNet (kovan)';
                return token;
            });
            coinList = coinList.sort((a, b) => (a.symbol > b.symbol) ? 1 : -1)
            return coinList;
        }

        function dispatchSelected() {
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

