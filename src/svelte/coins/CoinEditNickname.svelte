<script>
    import { onMount, getContext } from 'svelte';

	//Stores
    import { CoinStore } from '../../js/stores/stores.js';

    //Components
	import { Components }  from '../../js/router.js'
    const { Button, InputBox } = Components;

    //Context
    const { appHome } = getContext('app_functions');
    const { home, setMessage, setPage } = getContext('coinmodify_functions');
    
    //Props
    export let coin;

    let newCoinNickname = coin.nickname;
    let returnMessage = {};
    
    returnMessage.buttons = [
        {name: 'Home', click: () => appHome(), class: 'button__solid button__purple'},
        {name: 'Back', click: () => setPage(1), class: 'button__solid'}
    ]

    function saveNickName(){
        CoinStore.update( current => {
            let coinMatch = current.find( c => coin.network === c.network && coin.symbol === c.symbol && coin.vk === c.vk)
            console.log(coinMatch)
            if (coinMatch) {
                coinMatch.nickname = newCoinNickname === '' ? `My ${coin.name} ${coin.symbol}` : newCoinNickname;
            }
            return current
        })
        sendMessage()
        setPage(6);
    }

    function sendMessage(){
            returnMessage.type = 'success';
            returnMessage.text = `Wallet Nickname changed!`;
        setMessage(returnMessage)
    }

</script>

<style>

.buttons{
    align-items: center;
    margin: 14px 0;
}
</style>

<div class="edit-nickname">
    <h5> Edit Wallet Nickname </h5>

    <InputBox 
        label="nickname"
        margin="0 0 19px 0"
        bind:value={newCoinNickname}
    />

    <div class="coin-info text-subtitle3">
        {coin.name}
        <strong>
            {`${coin.symbol} - ${!coin.balance ? 0 : coin.balance} ${coin.symbol}`}
        </strong> 
    </div>

    <div class="buttons flex-column">
        <Button classes={'button__solid button__purple'} 
            width={'232px'}
            margin={'0 0 9px 0'}
            name="Save" 
            click={() => saveNickName()} />  

        <Button classes={'button__solid'} 
            width={'232px'}
            margin={'0 0 0 0'}
            name="Back" 
            click={() => home()} />    
    </div>
</div>