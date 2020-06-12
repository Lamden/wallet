<script>
    import { onMount, getContext } from 'svelte';

	//Stores
    import { CoinStore, currentNetwork, BalancesStore } from '../../js/stores/stores.js';

    //Components
	import { Components }  from '../Router.svelte'
    const { Button, InputBox } = Components;

    //Context
    const { appHome } = getContext('app_functions');
    const { home, setMessage, setPage } = getContext('coinmodify_functions');

    //DOM Nodes
    let nicknameObj;
    
    //Props
    export let coin;
    
    $: balance = BalancesStore.getBalance($currentNetwork.url, coin.vk).toLocaleString('en') || '0'

    let returnMessage = {};
    
    returnMessage.buttons = [
        {id: "home-btn", name: 'Home', click: () => appHome(), class: 'button__solid button__purple'},
        {id: "back-btn", name: 'Back', click: () => setPage(1), class: 'button__solid'}
    ]

    onMount(() => {
        nicknameObj.value = coin.nickname;
    })

    const saveNickName = () => {
        CoinStore.update( current => {
            let coinMatch = current.find( c => coin.network === c.network && coin.symbol === c.symbol && coin.vk === c.vk)
            if (coinMatch) {
                coinMatch.nickname = nicknameObj.value === '' ? `My ${coin.name} ${coin.symbol}` : nicknameObj.value;
            }
            return current
        })
        sendMessage()
        setPage(6);
    }

    const sendMessage = () => {
            returnMessage.type = 'success';
            returnMessage.text = `Account Nickname changed!`;
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
    <h5> Edit Account Nickname </h5>

    <InputBox
        id={"modify-edit-nickname"}
        label="nickname"
        margin="0 0 19px 0"
        bind:thisInput={nicknameObj}
    />

    <div id={'modify-edit-info'} class="coin-info text-subtitle3">
        {coin.name}
        <strong>
            {`${balance} ${$currentNetwork.currencySymbol}`}
        </strong> 
    </div>

    <div class="buttons flex-column">
        <Button
            id={"save-btn"}
            classes={'button__solid button__purple'} 
            width={'232px'}
            margin={'0 0 9px 0'}
            name="Save" 
            click={() => saveNickName()} />  

        <Button 
            id={"home-btn"}
            classes={'button__solid'} 
            width={'232px'}
            margin={'0 0 0 0'}
            name="Back" 
            click={() => home()} />    
    </div>
</div>