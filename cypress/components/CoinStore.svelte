<script>
    import {  CoinStore, balanceTotal, password } from '../../src/js/stores/coinStore.js';

    $: storeExists = !$CoinStore ? false : true;
    $: numOfCoins = !$CoinStore ? 0 : $CoinStore.length;
    $: coinBalance = numOfCoins > 1 ? $CoinStore[1].balance ? $CoinStore[1].balance : 'undefined' : 'no coins'

    $: response = {};
    $: returnedCoin = undefined;
    $: passwordOkay = undefined;

    let watchCoinInfo = {
        'network': 'lamden',
        'name': 'Lamden',
        'nickname' : 'Testing Good Coin',
        'symbol': 'TAU',
        'vk': '2de1ebf459e62ecc5bd551486fed0b18a5eb487af2b206700acb9f4f5d08bc77'
    }

    let updateCoinInfo = {
        'network': 'lamden',
        'name': 'Lamden',
        'nickname' : 'Testing Good Coin',
        'symbol': 'TAU',
        'vk': '2de1ebf459e62ecc5bd551486fed0b18a5eb487af2b206700acb9f4f5d08bc77',
        'sk': 'testing-private-key-value',
    }

    let missingInfoCoinInfo = {
        'network': 'lamden',
        'name': 'Lamden',
        'nickname' : 'Testing Good Coin',
        'symbol': 'TAU'
    }

    let notFoundCoinInfo = {
        'network': 'does-not-exist',
        'symbol': 'TAU',
        'vk': '2de1ebf459e62ecc5bd551486fed0b18a5eb487af2b206700acb9f4f5d08bc77',
    }

    let missingVk = {
        'network': 'landen',
        'symbol': 'TAU'
    }

    const lamdenNetwork = {
        ip:'https://testnet.lamden.io', 
        port: '443', 
    }

    const badNetwork = {
        ip:'https://testnet.lamden.io'
    }

    function addCoin(coinInfo){ response = CoinStore.addCoin(coinInfo) }
    function getCoin(coinInfo){ returnedCoin = CoinStore.getCoin(coinInfo) }
    function updateBalance(coinInfo, balance){ CoinStore.updateBalance(coinInfo, balance) }
    function setPassword(password){ CoinStore.setPwd(password) }
    function validatePassword(password){ passwordOkay = CoinStore.validatePassword(password) }
    
</script>

<h3> Store Meta </h3>
<div id="storeExists">{storeExists}</div>
<div id="numOfCoins">{numOfCoins}</div>
<div id="response-added">{response.added}</div>
<div id="response-reason">{response.reason}</div>
<div id="coinBalance">{coinBalance}</div>
<div id="balanceTotal">{$balanceTotal}</div>
<div id="password">{$password}</div>
<div id="password-okay">{passwordOkay}</div>

<h3> Each Coin in Store </h3>
{#each $CoinStore as coin, index}
    <h4>{coin.nickname}</h4>
    <div id={`${index}-nickname`}>{`${coin.nickname}`}</div>
    <div id={`${index}-network`}>{`${coin.network}`}</div>
    <div id={`${index}-name`}>{`${coin.name}`}</div>
    <div id={`${index}-symbol`}>{`${coin.symbol}`}</div>
    <div id={`${index}-balance`}>{`${!coin.balance ? '0' : coin.balance}`}</div>
    <div id={`${index}-vk`}>{`${coin.vk}`}</div>
    <div id={`${index}-sk`}>{`${coin.sk}`}</div>
{/each}

<h3> Get Coin Info </h3>
<div id={`getCoin-nickname`}>{`${!returnedCoin ? '' : returnedCoin.nickname}`}</div>
<div id={`getCoin-network`}>{`${!returnedCoin ? '' :  returnedCoin.network}`}</div>
<div id={`getCoin-name`}>{`${!returnedCoin ? '' :  returnedCoin.name}`}</div>
<div id={`getCoin-symbol`}>{`${!returnedCoin ? '' :  returnedCoin.symbol}`}</div>
<div id={`getCoin-vk`}>{`${!returnedCoin ? '' :  returnedCoin.vk}`}</div>
<div id={`getCoin-sk`}>{`${!returnedCoin ? '' :  returnedCoin.sk}`}</div>

<h3> Add Coin Buttons </h3>
<button id="add-coin-watch" on:click={() => addCoin(watchCoinInfo)}>add-coin-watch</button>
<button id="add-coin-update" on:click={() => addCoin(updateCoinInfo)}>add-coin-update</button>
<button id="add-coin-duplicate" on:click={() => addCoin(updateCoinInfo)}>add-coin-duplicate</button>
<button id="add-coin-undefined" on:click={() => addCoin()}>add-coin-undefined</button>
<button id="add-coin-missingInfo" on:click={() => addCoin(missingInfoCoinInfo)}>add-coin-missingInfo</button>

<h3> Get Coin Buttons </h3>
<button id="get-coin" on:click={() => getCoin(updateCoinInfo)}>get-coin</button>
<button id="get-coin-undefined" on:click={() => getCoin(notFoundCoinInfo)}>get-coin-undefined</button>

<h3> Update Balance Buttons </h3>
<button id="update-balance" on:click={() => updateBalance(updateCoinInfo, 100)}>update-balance</button>
<button id="update-balance-undefined-coin" on:click={() => updateBalance(undefined, 200)}>update-balance-undefined-coin</button>
<button id="update-balance-missing-info" on:click={() => updateBalance(missingVk, 200)}>update-balance-missing-info</button>
<button id="update-balance-undefined-balance" on:click={() => updateBalance(updateCoinInfo)}>update-balance-undefined-balance</button>
<button id="update-balance-NaN-balance" on:click={() => updateBalance(updateCoinInfo, 'five')}>update-balance-NaN-balance</button>

<h3>Set Password Buttons</h3>
<button id="set-password" on:click={() => setPassword('Testing0!2')}>set-password</button>
<button id="validate-password-correct" on:click={() => validatePassword('Testing0!2')}>validate-password-correct</button>
<button id="validate-password-incorrect" on:click={() => validatePassword('testing0!2')}>validate-password-incorrect</button>

<h3>Store Object Value</h3>
<div>{JSON.stringify($CoinStore)}</div>

<style>
button{
    padding: 5px;
}
</style>
