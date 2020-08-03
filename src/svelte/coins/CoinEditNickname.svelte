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
    
    $: balance = BalancesStore.getBalance($currentNetwork, coin.vk).toLocaleString('en') || '0'

    let returnMessage = {};
    
    returnMessage.buttons = [
        {id: "home-btn", name: 'Home', click: () => appHome(), class: 'button__solid button__purple'},
        {id: "back-btn", name: 'Back', click: () => setPage(1), class: 'button__solid'}
    ]

    onMount(() => {
        nicknameObj.value = coin.nickname;
    })

    const saveNickName = () => {
        let newNickname = nicknameObj.value === '' ? `My ${coin.name} ${coin.symbol}` : nicknameObj.value;
        chrome.runtime.sendMessage({type: 'changeCoinNickname', data: {coinInfo: coin, newNickname}}, () => {
            sendMessage()
            setPage(6);
        })
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
p{
    text-align: right;
    margin: 0.5rem 0 1rem;
}
</style>

<div class="edit-nickname">
    <h2> Edit Account Nickname </h2>

    <InputBox
        id={"modify-edit-nickname"}
        label="nickname"
        bind:thisInput={nicknameObj}
    />

    <p id={'modify-edit-info'} class="coin-info text-subtitle2">
            {`${balance} ${$currentNetwork.currencySymbol}`}
    </p>

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