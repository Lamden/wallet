<script>
	//Utils
    import { API } from '../../js/api.js';
    import { pub_from_priv } from '../../js/crypto/wallets.js';
    
    let supportedCoins = getSupportedCoins();
    let coinList = [];
    let selected = undefined;
    let customERC20 = {name:'ERC20 Token', symbol:'Custom', testnet:false, network: 'ethereum'}
    let lamden = {name:'Lamden', symbol:'TAU', testnet:true, network: 'lamden'}
    let showKeyBox = false;
    let privateKey = '';
    let publicKey = '';
    let balance;
    
    function getSupportedCoins(){
        return API('GET', 'networks-list')
    }

    function getBalance(){
        API('GET', 'get-balance', `${selected.symbol}/${publicKey}`)
            .then(data => balance = `${data.value} ${selected.symbol}`)
            .catch(e => console.log(e))
    }

    function createCoinList(data){
        coinList = []
        for (const networks in data){
            coinList = [...coinList,...data[networks]]
        }
        return [...coinList, customERC20, lamden];
    }

    function savePrivateKey(){
        if (selected){
            try{
                publicKey = pub_from_priv(selected.network, selected.symbol, privateKey)
                getBalance()
            } catch (e) {
                console.log(e)
            }
        }
    }

</script>

<h1> Add Coins </h1>
<p>This will add a cryptocurrency coin to your wallet.</p>
<div>
    Select a Coin
    {#await supportedCoins}
        <select id='ddCoins' bind:value={selected}>
            <option value={'temp'}>...fetching supported coins...</option>
        </select>
        
    {:then data}
        <select id='ddCoins' bind:value={selected}>
            {#each createCoinList(data) as coin}
                <option value={coin}>{ '(' + coin.symbol + ') ' + coin.name }</option>
            {/each}
        </select>
        Do you already have a private key for this cryptocurrency?
        <button on:click={() => showKeyBox = true}>Yes</button>
        <button on:click={() => showKeyBox = false}>No</button>
        {#if showKeyBox}
            <input bind:value={privateKey} />
        {/if}
        <div>
            <button on:click={() => savePrivateKey()}>Save</button>
        </div>
        {publicKey}
        {'balance: ' + balance}
    {:catch error}
	    <p style="color: red">API server unavailable</p>
    {/await}

</div>
