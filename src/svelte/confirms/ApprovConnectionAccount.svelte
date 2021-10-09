<script>
    import whitelabel from '../../../whitelabel.json'
    
    import { getContext, onMount } from 'svelte'
    import { fly } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';

    //Components
    import Button from '../components/Button.svelte'
    
    import logo from '../../img/logo.svg'

    //Utils
    import { formatAccountAddress } from '../../js/utils.js' 

    //Stores
    import { 
        CoinStore,
        DappStore
    } from '../../js/stores/stores.js';

    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    //Context
    const { setAccount, close } = getContext('confirm_functions');

    export let confirmData

    let vk = confirmData.messageData.wallet? confirmData.messageData.wallet.vk : undefined
    let selectedAccountId; // selected account Id

    $: accountList = $CoinStore ? getAccountList($CoinStore, $DappStore):[];

    const getAccountList = (CoinStore, DappStore) => {
        let accounts = []
        CoinStore.map((coin, index) => {
            coin.id = index
            // return the origin linked account
            if (coin.vk === vk) accounts.push(coin)
            // filter accounts
            // exclude acccouts which sk === watchOnly or have linked with other Dapp
            if (coin.sk !== "watchOnly"){
                const i = Object.values(DappStore).findIndex(dapp => dapp.vk === coin.vk)
                if(i === -1 ) accounts.push(coin)
            }
            return
	    })
        return accounts 
    }


    /**
     * @description Get account id by vk.
     * @param key vk
     * @return id  
    */
    const getIdByVk = (key) => {
        let id = accountList[0]? accountList[0].id : 0
        accountList.map(coin => {
            if (key && coin.vk === key) id = coin.id
        })
        return id
    }
    
    const next = () => {
        setAccount(accountList.find(val => val.id === selectedAccountId));
        dispatch('setStep', 5);
        dispatch('changeAccount', true);
    }

    const select = (index) => {
        selectedAccountId = index;
    }

    onMount(() => {
        selectedAccountId = getIdByVk(vk);
    })


</script>


<style>
    .detail{
        flex-grow: 1;
        padding: 1rem;
    }
    .buttons{
        justify-content: flex-end;
        align-items: center;
        flex-grow: 1;
    }
    .help-link{
        text-align: center;
    }
    p {
        margin: 0 0 1rem;
    }

    .card{
        display: flex;
        flex-direction: row;
        margin-bottom: 16px;
        min-width: 23%;
        background: var(--bg-secondary);
        padding: 16px;
    }

    .card-selected{
        border: 1px solid var(--accent-color);
        filter: brightness(125%);
    }

    .logo{
        display: flex;
        justify-content: center;
        width: 32px;
        position: relative;
        margin-right: 8px;
    }

    .inline{
        display: inline;
    }

    .change{
        padding-top: 4px;
    }
</style>

<div class="flex-column detail"
    in:fly="{{delay: 0, duration: 300, x: 500, y: 0, opacity: 0.25, easing: quintOut}}">

    <p class="text-body2">
        {`Please chose an account to linked with ${confirmData.messageData.appName}`}
    </p>
    <div class="flex-column">
        {#each accountList as account (account.id)}
            {#if selectedAccountId == account.id}
                <div class="card card-selected" on:click={select(account.id)}>
                    <div class="logo flex-center-center"> {@html logo} </div>
                    <div>
                        <div class="inline text-bold">{account.nickname} ({formatAccountAddress(account.vk, 10, 4)})</div>
                        <div class="change text-accent">Selected</div>
                    </div>
                </div>
            {:else}
                <div class="card" on:click={() => select(account.id)}>
                    <div class="logo flex-center-center"> {@html logo} </div>
                    <div>
                        <div class="inline text-bold">{account.nickname} ({formatAccountAddress(account.vk, 10, 4)})</div>
                        <div class="change text-accent">Switch to this account</div>
                    </div>
                </div>
            {/if}
        {/each}
    </div>

    <div class="flex-column buttons">
        <p class="text-body2">Click Link to proceed</p>
        <Button 
            id={'account-link-btn'}
            classes={'button__solid button__primary'}
            name="Link"
            width={'240px'}
            height={'42px'}
            margin={'0 0 0.5rem 0'}
            click={next} />
        <Button 
            id={'account-deny-btn'}
            classes={'button__solid '}
            name="Cancel"
            width={'240px'}
            height={'42px'}
            margin={'0 0 0.5rem 0'}
            click={close} />
    </div>
    <div class="help-link">
        {#if whitelabel.helpLinks.show}
            <a  class="text-link" 
                href={whitelabel.helpLinks.masterURL || "https://docs.lamden.io/docs/wallet/accounts_linked_create"}
                target="_blank" 
                rel="noopener noreferrer" >
                learn about linked accounts
            </a>
        {/if} 
    </div>   
</div>