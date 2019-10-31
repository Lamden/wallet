<script> 
    import { setContext, getContext} from 'svelte';

    //Stores
    import { CoinStore, SettingsStore, previousPage, getCoinReference } from '../../js/stores/stores.js';

    //Components
    import { Modal, Modals, Transaction }  from '../../js/router.js'

    //Utils
    import { logos } from '../../js/crypto/logos.js';

    setContext('closeModal', {
		closeModal: () => closeModal(),
	});

    const { switchPage } = getContext('switchPage');

    let openModal = false;
    let currentModal = '';

    $: coin = CoinStore.getCoin($SettingsStore.currentPage.data, $CoinStore) || $SettingsStore.currentPage.data;
    $: logo = coin.logo ? coin.logo : logos[coin.network][coin.symbol.replace("-", "_")] || logos[coin.network].default ;
    $: symbol = coin.is_token ? coin.token_symbol : coin.symbol;
    $: balance = coin.balance ? coin.balance : 0;
    $: USD_value = coin.USD_value ? coin.USD_value : 0;


    function showModal(modal){
        currentModal = modal;
        openModal = true;
    }

    function closeModal(){
        openModal = false;
    }

    function deleteCoin(){
        if (confirm("Delete?")){
            CoinStore.update(coinstore => {coinstore.splice(coinstore.indexOf(coin), 1); return coinstore;});
            switchPage('CoinsMain');
        };
    }

</script>

<style>
    div{
        display: grid;
    }
</style>

<h2 on:click={ () => switchPage('CoinsMain')} style="cursor: pointer;"> {"<- Back"} </h2>
<div>
    <img class="logo" src={logo} alt={`${coin.name} logo`} />
</div>
<div>
    <h2>{coin.name}</h2>
    <div> {`balance ${ balance } ${ symbol }`}</div>
    <!-- <div> {`(${coin.USD_value})`} </div> -->
</div>
{#if coin.sk !== 'watchOnly'}
    <button on:click={ () => showModal('CoinSend') }> Send </button>
{/if}
<button on:click={ () => showModal('CoinRecieve') }> Recieve </button>

<div>
    {#if coin.txList}
        <h2>Transactions</h2>
        {#each coin.txList as txInfo}
            <Transaction {txInfo} {coin} />
        {/each}
    {/if}
</div>
<div>
    <button on:click={() => deleteCoin()}>DELETE COIN</button>
</div>

{#if openModal}
	<Modal on:close="{() => openModal = false}">
        <svelte:component this={Modals[currentModal]} {switchPage} {coin}}/>
	</Modal>
{/if}