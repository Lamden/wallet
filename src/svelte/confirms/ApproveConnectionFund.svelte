<script>
    import whitelabel from '../../../whitelabel.json'

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
                name: `${account.nickname} - ${account.balance} ${confirmData.messageData.network.currencySymbol}`,
                selected: false
            }
        }).filter(account => parseFloat(account.value.balance) > 0 || account.sk !== 'watchOnly')]
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
        flex-grow: 1;
        padding: 1rem;
    }
    .flex-row{
        width: 100%;
    }
    .inputs{
        width: 100%;
    }
    .icon{
        width: 60px;
        margin: 0.5rem auto;
    }
    .help-link{
        text-align: center;
    }
    .buttons{
        justify-content: flex-end;
        align-items: center;
        flex-grow: 1;
    }
    p{
        margin: 0;
    }
</style>


<div class="flex-column detail"
    in:fly="{{delay: 0, duration: 300, x: 500, y: 0, opacity: 0.25, easing: quintOut}}">

    <p class="text-body2">
        You can send {confirmData.messageData.network.currencySymbol} to your 
        {confirmData.messageData.appName} <a class="text-link" href="https://docs.lamden.io/docs/wallet/accounts_linked_overview" rel="noopener noreferrer" target="_blank">linked account</a> 
        to start using it right away.

    </p>
    <div class="icon" >
        {@html send_coins}
    </div>
    <div class="flex-row">
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

    <div class="flex-column buttons">
        <p class= "text-body2" class:text-secondary={!amount || amount <= 0}>{confirmMessage(amount)}</p>
         <Button 
            id={'fund-next-btn'}
            classes={'button__solid button__primary'}
            name={amount > 0 ? "Yes" : "Skip"}
            width={'240px'}
            height={'42px'}
            margin={'0 0 0.5rem 0'}
            click={set} />
        <Button 
            id={'fund-back-btn'}
            classes={'button__solid '}
            name="Back"
            width={'240px'}
            height={'42px'}
            margin={'0 0 0.5rem 0'}
            click={back} />
        <div class="help-link">
                    {#if whitelabel.helpLinks.show}
                <a  class="text-link" 
                    href={whitelabel.helpLinks.masterURL || "https://docs.lamden.io/docs/wallet/accounts_linked_create#fund-linked-account"}
                    target="_blank" 
                    rel="noopener noreferrer" >
                    learn more
                </a>
            {/if} 
        </div>  
    </div>
</div>

