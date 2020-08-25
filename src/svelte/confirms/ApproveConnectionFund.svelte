<script>
    import { getContext } from 'svelte'
    import { fly } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';

    //Components
    import Button from '../components/Button.svelte'
    import DropDown from '../components/DropDown.svelte'
    import InputBox from '../components/InputBox.svelte'

	import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    //Icons
    import send_coins from '../../img/menu_icons/icon_send_coins.svg'    

    //Context
    const { openNewTab, setFunding } = getContext('confirm_functions');

    export let confirmData;

    let selectedAccount = {};
    let amount = 0;

    const filterAccounts = () => {
        let filteredAccounts = [...confirmData.messageData.accounts.map((account, index) => {
            return {
                value: account,
                name: `${account.nickname} - ${account.balance.toLocaleString()} ${confirmData.messageData.network.currencySymbol}`,
                selected: false
            }
        }).filter(account => account.value.balance > 0 || account.sk !== 'watchOnly')]
        if (filteredAccounts.length > 0) filteredAccounts[0].selected = true;
        return [...filteredAccounts]
    }

    let accounts = filterAccounts();

    const set = () => {
        if (!amount || amount <= 0) setFunding(false)
        else setFunding({account: selectedAccount, amount})
        next();
    }

    const next = () => dispatch('setStep', 3)
    const back = () => dispatch('setStep', 1)

    const handleSelected = (e) => e.detail.selected ? selectedAccount = e.detail.selected.value : {}

    const handleChanged = (e) => {
        let percision = 0;
        try {
            percision =  e.detail.target.value.split(".")[1].length
            if (percision > 8) {
                amount = Number(e.detail.target.value.split(".")[0] + "." + e.detail.target.value.split(".")[1].substring(0, 8))
            }
        } catch (e){}

    }

    const confirmMessage = (txamount) => {
        if (!txamount || txamount <= 0) {
            return " "
        } else {
            return `Transfer ${txamount.toLocaleString('en-US', { style: 'decimal', maximumFractionDigits : 8 })} ${confirmData.messageData.network.currencySymbol} to this account?`;
        }
    }
</script>

<style>
    .detail{
        align-items: center;
        flex-grow: 1;
        justify-content: space-between;
        padding-top: 2rem;
    }
    .flex-row{
        width: 100%;
    }
    .inputs{
        width: 75%;
        padding-right: 10px;
    }
    .fund-details{
        height: 160px;
        justify-content: center;
        align-items: center;
    }
    .icon{
        width: 25%;
        box-sizing: border-box;
        padding: 30px 20px 20px 20px;
    }
    .buttons{
        margin-bottom: 0.5rem;
    }
    .help-link{
        text-align: center;
    }
    p{
        font-size: 1.2em;
        text-align: center;
        margin: 0.25rem 0;
        line-height: 1.4;
    }
    .buttons{
        padding: 1rem 0;
    }
    .confirm-message{
        height: 25px;
        font-size: 1.5em;
        margin: 2rem 0 0;  
        align-self: center;  
    }
</style>


<div class="flex-column detail"
    in:fly="{{delay: 0, duration: 300, x: 500, y: 0, opacity: 0.25, easing: quintOut}}">

    <p>
        You can send {confirmData.messageData.network.currencySymbol} to your 
        {confirmData.messageData.appName} <a class="outside-link" href="www.lamden.io" rel="noopener noreferrer" target="_blank">linked account</a> 
        to start using it right away.

    </p>
    <div class="flex-row fund-details">
        <div class="icon" >
            {@html send_coins}
        </div>
        <div class="inputs flex-column">
            {#if typeof accounts !== 'undefined'}
                <DropDown 
                    label="Fund from this account"
                    items={accounts}
                    on:selected={handleSelected}
                />
            {/if}

            <InputBox
                id="fund-amount-input"
                label={`Amount to transfer (${confirmData.messageData.network.currencySymbol})`}
                inputType={"number"}
                bind:value={amount}
                on:changed={handleChanged}
            />
        </div>
    </div>

    <p class= "confirm-message" class:text-primary-dark={!amount || amount <= 0}>{confirmMessage(amount)}</p>

    <div class="flex-column">
        <div class="buttons flex-row">
            <Button 
                id={'fund-back-btn'}
                classes={'button__solid '}
                name="Back"
                width={'175px'}
                height={'42px'}
                margin={'0 20px 0 0'}
                click={back} />

            <Button 
                id={'fund-next-btn'}
                classes={'button__solid button__purple'}
                name={amount > 0 ? "Yes" : "Skip"}
                width={'175px'}
                height={'42px'}
                click={set} />
        </div>
        <div class="help-link">
            <a class="outside-link" href="www.lamden.io" rel="noopener noreferrer" target="_blank">learn more</a>
        </div>  
    </div>
</div>

