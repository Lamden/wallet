<script>
	import { createEventDispatcher } from 'svelte';

	//Stores
    import { CoinStore, Hash, defaultOjects } from '../../js/stores.js';
    
	//Utils
    import { API } from '../../js/api.js';
    import { pub_from_priv } from '../../js/crypto/wallets.js';
    import { checkPassword, encryptStrHash, decryptStrHash } from '../../js/utils.js';

    //Props
    export let closeModal;

    const dispatch = createEventDispatcher();    
    let supportedCoins = getSupportedCoins();
    let coinList = [];
    let selected = undefined;
    let customERC20 = {name:'ERC20 Token', symbol:'Custom', testnet:false, network: 'ethereum'}
    let lamden = {name:'Lamden', symbol:'TAU', testnet:true, network: 'lamden'}
    let showKeyBox = false;
    let privateKey = '';
    let password = '';
    let publicKey = '';
    let label = '';
    let balance;
    let error = '';
    
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

    function checkForm(){
        if (!selected){
            error = 'no coin selected';
            return
        }
        if (label === ''){
            error = 'please provile a label for your new wallet';
            return
        }
        if (!checkPassword(password, $Hash)){
            error = 'Incorrect Password';
            new Error(e)
            return
        }
        try{
            publicKey = pub_from_priv(selected.network, selected.symbol, privateKey);
        } catch (e) {
            error = e;
            new Error(e)
            return
        }
        saveCoin();
    }

    function saveCoin(){
        let newStore = $CoinStore
        // Instantiate a new Coin if one doesn't exist for the network

        if (!newStore[selected.network][selected.symbol]) {
            let newCoin = JSON.parse(JSON.stringify($defaultOjects.coin))
            newCoin.name = selected.name;
            newCoin.symbol = selected.symbol;
            newStore[selected.network][selected.symbol] = newCoin;
        }
        //Check if the pubkey already exists in the coin
        if (newStore[selected.network][selected.symbol]['pubkeys'][publicKey]) {
            error = `This wallet address already exists for ${name}`
        }else{
            //if not then add it
            let newPubkey = JSON.parse(JSON.stringify($defaultOjects.pubkey))
            newPubkey.label = label;
            newPubkey.vk = publicKey;
            newPubkey.sk = encryptStrHash(password, privateKey);
            newStore[selected.network][selected.symbol]['pubkeys'][publicKey] = newPubkey;
            
            //Set new CoinStore
            try{
                CoinStore.set(newStore);
                closeModal();
            } catch (e) {
                error = e;
                new Error(e)
            }
            
        }
    }


</script>
<p style="color: red;">{error}</p>
<h1>Add Coins</h1>
<p>This will add a cryptocurrency coin to your wallet.</p>
<div>
    Select a Coin
    {#await supportedCoins}
        <select id='ddCoins' bind:value={selected}>
            <option value={'temp'}>...fetching supported coins...</option>
        </select>
        
    {:then data}
        <div>
            <select id='ddCoins' bind:value={selected}>
                {#each createCoinList(data) as coin}
                    <option value={coin}>{ '(' + coin.symbol + ') ' + coin.name }</option>
                {/each}
            </select>
        </div>
        <div>
            Do you already have a private key for this cryptocurrency?
            <button on:click={() => showKeyBox = true}>Yes</button>
            <button on:click={() => showKeyBox = false}>No</button>
        </div>
        
        {#if showKeyBox}
            <div>
                <textarea bind:value={privateKey}
                          placeholder={`Enter ${selected.name} Private Key`}
                          wrap="hard"
                          rows="3"  />
            </div>
        {/if}
        <div>
            Label
            <input bind:value={label} />
        </div>
        <div>
            Password
            <input bind:value={password} />
        </div>
        <div>
            <button on:click={() => checkForm()}>Save</button>
        </div>
    {:catch error}
	    <p style="color: red">API server unavailable</p>
    {/await}

</div>

<style>
  input:required:invalid, input:focus:invalid {
    background-image: url(/img/validators/error.svg);
    fill: red;
    background-position: right top;
    background-repeat: no-repeat;
  }
  input:required:valid {
    background-image: url(/img/validators/check.svg);
    fill: green;
    background-position: right top;
    background-repeat: no-repeat;
  }
</style>