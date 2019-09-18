<script> 
    import { setContext, getContext} from 'svelte';

    //Stores
    import { CoinStore, SettingsStore, previousPage } from '../../js/stores.js';

    //Components
    import { Modal, Modals }  from '../../js/router.js'

    //Utils
    import { toCurrencyFormat }  from '../../js/utils.js'

    setContext('closeModal', {
		closeModal: () => closeModal(),
	});

    const { switchPage } = getContext('switchPage');

    let openModal = false;
    let currentModal = '';
    let selected;

    let coin = $SettingsStore.currentPage.data

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
    <h2>{coin.name}</h2>
    <div> {`balance ${coin.balance} ${coin.symbol}`}</div>
    <!-- <div> {`(${coin.USD_value})`} </div> -->
</div>
{#if coin.sk !== 'watchOnly'}
    <button on:click={ () => showModal('CoinSend') }> Send </button>
{/if}
<button on:click={ () => showModal('CoinRecieve') }> Recieve </button>

<h2>Transactions</h2>
{#if coin.txList}
    <ul>
        {#each coin.txList as tx}
            <li>
                <a href={tx.transaction_link} rel="noopener noreferrer" target="_blank">
                    {`Sent ${tx.value} (${coin.symbol}) on ${tx.dateTime}  Status: ${tx.status}`}
                </a>
            </li>
        {/each}
    </ul>
{:else}
None
{/if}

<div>
    <h3>Price Information</h3>
    <div>Market Cap: 0</div>
    <div>Price: 0</div>
    <div>Volume: 0</div>
    <div>Circulating Supply: 0</div>
    <div>Change (24h): 0</div>
</div>

<div>
    <button on:click={() => deleteCoin()}>delete</button>
</div>

{#if openModal}
	<Modal on:close="{() => openModal = false}">
        <svelte:component this={Modals[currentModal]} {switchPage} {coin}}/>
	</Modal>
{/if}