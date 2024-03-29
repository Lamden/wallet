<script>
    import whitelabel from '../../../whitelabel.json'
    
    import { onMount, getContext} from 'svelte';
    import lamden, { Network } from 'lamden-js';
    const { Encoder } = lamden;
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

	//Stores
    import { coinsDropDown, currentNetwork, BalancesStore, networkKey, TokenStore, TokenBalancesStore} from '../../js/stores/stores.js';

    //Components
    import { Components }  from '../Router.svelte'
    const { DropDown, InputBox, Button, TokenLogo } = Components;

    //Utils
    import { displayBalanceToFixed, formatAccountAddress, getTokenBalance, stringToFixed} from '../../js/utils.js'

    //Context
	const { nextPage } = getContext('tx_functions');

    //DOM NODES
    let receiverField;

    let error = undefined;
    let nameResolveError = undefined;
    let receiverType = 1;
    let tokenSymbol;
    let from;
    let to;
    let loading = false;

    let stampLimit = 50;

    let amount = 0;

    //Props
    export let coin;
    export let token;
    export let currentPage;
    export let accountList;
    export let startingContract;

    $: type = coin? "coin" : "token";
    $: contractName = startingContract || 'currency';
    $: netKey = networkKey($currentNetwork);
    $: currencySymbol = $currentNetwork.currencySymbol;
    $: accounts = creacteAccounts($coinsDropDown, $BalancesStore, $TokenBalancesStore, contractName);
    $: toAccounts = creacteToAccounts($coinsDropDown, from);
    $: buttonGroup = [
            {id:"external-account-btn", name: 'An External Account', click: () => receiverType = 1, class: receiverType === 1 ? ' button__primary buttonGroup__left' : 'buttonGroup__left' },
            {id:"my-account-btn", name: 'One of My Accounts', click: () =>  receiverType = 2, class: receiverType === 2 ? ' button__primary buttonGroup__right' : 'buttonGroup__right' },
        ]
    $: tokens = from? createTokensDropDown(from.vk, BalancesStore) : [];

    const createTokensDropDown = () => {
        let returnList = [{
            token: true,
            value: {
                contractName: "currency",
                logo_base64_png: "iVBORw0KGgoAAAANSUhEUgAAACIAAAAiCAYAAAA6RwvCAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAPsAAAD7AB6X6cvQAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAFtSURBVFiFvdc9TsNAEAXgNwYJAgdAinwUokCBASHOE7o4HVwHpSEUyLLoOAZKBRVCjgsyVIkAZ9fz4/DaHXk/zcqjXcCZLC3ys35x6/0OeRFgGgMAM989zoc3/w75iVjFgzFBNiG8GDUkhvBgVBAJwooRQzQIC0YEsSC0mMSNICpBVIaXaZSlRe6CCDrxvL+gq71l7wKgp2AV07ht6AWPRoSok8v7t+MPALjuvxzUVE0BPg16Ise0EaJFrOLBNCBWhBfzC+JFeDBrSFcIK4a2gbBgaFsILSYhJJVlA2nqr3dicHSCE5KKAOA8LUfMHBs4pq5kRw+HvNubEnASLGLKZ/PBZC3tGqNBAH9+364wWkQD0gXGgtgI8WCsiCDEgvEgohANZrHzufQgWiGA8GIEAMyDcA1PZq/DPLaP6Koo6Ew4LZ1QQcwYIUIFUWMUCDVEjFEiTJBWjAFhhgQxRoQL0sA4EJ0kS4tc8oBqyzfkwZ98LtP+lwAAAABJRU5ErkJggg==",
                tokenName: currencySymbol,
                tokenSymbol: currencySymbol
            },
            name: `${currencySymbol}`,
            selected: true
        }];
        if (!$TokenStore[netKey]) return returnList;
        $TokenStore[netKey].map(token => {
            returnList.push({
                token: true,
                value: token,
                name: `${token.tokenName}: ${displayBalanceToFixed(getTokenBalance(netKey, from.vk, token.contractName, $TokenBalancesStore), 8)} ${token.tokenSymbol}`,
                selected: false
            })
        })
        return returnList;
    }

    const creacteAccounts = (coinsDropDown, balancesStore, tokenBalancesStore, contract) => {
        let returnList = coinsDropDown.filter(f => {
            if (!f.value) return false
            if (f.value.sk === "watchOnly") return false
            if (contract === "currency") {
                if (!balancesStore[netKey] || !balancesStore[netKey][f.value.vk]) return false
                let balance = Encoder('bigNumber', balancesStore[netKey][f.value.vk]["balance"])
                if (balance.isGreaterThan(0)) return true
                return false
            }
            if (!tokenBalancesStore[netKey][f.value.vk]) return false
            if (!tokenBalancesStore[netKey][f.value.vk][contract]) return false
            let balance = Encoder('bigNumber', tokenBalancesStore[netKey][f.value.vk][contract])
            if (balance.isGreaterThan(0)) return true
            return false
        }).map(c => {
            let item = {}
            if (c.value){
                if(coin){
                    item.selected = c.value.network === coin.network && c.value.symbol === coin.symbol && c.value.vk === coin.vk
                }
                if (contract === "currency"){
                    item.name = `
                        ${formatAccountAddress(c.value.vk, 8, 0)} - ${c.value.nickname}:
                        ${displayBalanceToFixed(balancesStore[netKey][c.value.vk]?balancesStore[netKey][c.value.vk]["balance"]:"0", 8)}
                        ${currencySymbol}
                    `
                } else {
                    item.name = `
                        ${formatAccountAddress(c.value.vk, 8, 0)} - ${c.value.nickname}:
                        ${displayBalanceToFixed(tokenBalancesStore[netKey][c.value.vk]?tokenBalancesStore[netKey][c.value.vk][contract]:"0", 8)}
                        ${tokenSymbol}
                    ` 
                }
            }
            return {
                ...c,
                ...item
            }
        });
        return returnList;
    }

    const creacteToAccounts = (coinsDropDown, sender) => {
        let returnList = sender ? coinsDropDown.filter(item => item.value && item.value.vk !== sender.vk) : coinsDropDown.filter(item => !!item.value);
        return returnList;
    }

    const getTokenBal = () => {
        if (!from) return "0";
        return displayBalanceToFixed(getTokenBalance(netKey, from.vk, contractName, $TokenBalancesStore), 8);
    }

    const handleSenderAddrSelect = (e) => {
        amount = 0;
        from = e.detail.selected.value;
    }

    const handleReceiverAddrSelect = (e) => {
        to = e.detail.selected.value.vk.trim();
    }

    const handleTokenSelect = (e) => {
        contractName = e.detail.selected.value.contractName;
        tokenSymbol = e.detail.selected.value.tokenSymbol;
        amount = 0;
    }

    const handleNext = () => {
        validate().then(res => {
            if (res) {
                dispatch('contractSimpleDetails', {
                    sender: from,
                    txInfo: {
                        senderVk: from.vk.trim(),
                        contractName: contractName, 
                        methodName: "transfer", 
                        stampLimit,
                        kwargs: {
                            amount: Encoder("float", amount),
                            to: Encoder("str", to.trim())
                        }
                    }
                })
            }
        })
    }

    const validate = async () => {
        error = undefined;
        nameResolveError = undefined;
        if (!from) {
            error = "No account was selected."
            return false
        };
        const sendAmount = Encoder('bigNumber', amount) ;
        const taublance = BalancesStore.getBalance($currentNetwork, from.vk);

        if (contractName === "currency") {
            if (sendAmount.isGreaterThan(taublance)) {
                error = `Insufficient amount.`
                return false
            }
        } else {
            const tokenblance = getTokenBalance(netKey, from.vk, contractName, $TokenBalancesStore);
            if (sendAmount.isGreaterThan(tokenblance)) {
                error = `Insufficient amount.`
                return false
            }
        }
        if (receiverType === 1) {
            receiverField.setCustomValidity('')
            if (!to || to.length === 0) {
                receiverField.setCustomValidity('The receiver address cannot be empty.')
                receiverField.reportValidity()
                return false;
            }
        }

        // all name is lowercase
        let receiver = to.trim().toLowerCase()
        if (receiver.endsWith('.tau')) {
            loading = true
            let success = false
            await fetch(`${$currentNetwork.nameService}/${receiver}`)
            .then(res => res.json())
            .then(data => {
                if (data.status === "success") {
                    to = data.response
                    success = true
                } else {
                    nameResolveError = data.response
                    success = false
                }
            })
            .catch(() => {
                nameResolveError = "Network Error. Can not resolve the receiver address."
                success = false
            })
            .finally(() => {
                loading = false
            })
            return success
        } else {
            return true
        }
    }
    const maxAmount = () => {
        if (contractName === "currency") {
            const taublance = BalancesStore.getBalance($currentNetwork, from.vk);
            if (taublance.isGreaterThan(0)){
                amount = stringToFixed(taublance, 14);
            } else {
                amount = '0'
            }
        } else {
            amount = stringToFixed(getTokenBalance(netKey, from.vk, contractName, $TokenBalancesStore), 14);
        }
    } 
</script>

<style>
    .send-lamden{
        width: 525px;
        background: inherit;
    }
    .receiver{
        display: flex;
        flex-direction: column;
    }
    .buttons{
        padding-top: 27px;
        display: flex;
        justify-content: center;
        align-items: flex-end;
    }
    .hide{
        display: none;
    }
    #advanced > span{
        cursor: pointer;
    }

    .button-group{
        margin-bottom: 1rem;
        border-radius: 4px;
        box-shadow: var(--box-shadow-2);
        -webkit-box-shadow: var(--box-shadow-2);
        -moz-box-shadow: var(--box-shadow-2);

    }
    #dropdown-error{
        margin-top: 0.2rem;
    }
    .max-btn{
        position: absolute;
        right: 0;
        top: 50%;
        margin-right: 8px;
        text-decoration: underline;
        color: #5CC8E2;
        cursor: pointer;
    }
</style>

<div class="send-lamden flex-column" class:hide={currentPage !== 'CoinLamdenSimpleContract'}>
    <h2> Make a {whitelabel.companyName} Transaction</h2>
    <div class="button-group flex-row">
        {#each buttonGroup as button, index}
            <Button
                id={button.id} 
                classes={`button__solid ${button.class}`} 
                width={'100%'}
                name={button.name}
                click={button.click}
                tabIndex={"-1"} />
        {/each}        
    </div>
    <div class="inputbox" style={`margin: 0 0 0.5rem 0; width: "100%"; background: var(--bg-primary);`}>
        {#if type === "token"}
            <!-- svelte-ignore a11y-label-has-associated-control -->
            <label class="inputbox-label"> Token </label>
            <div class="mainbox" id="tokeninput">
                <TokenLogo margin="0 10px 0 0" width={"20px"} tokenMeta={token} />
                {`${token.tokenName}`}
            </div>
        {:else}
            <DropDown  
                items={tokens}
                id={'tokendrop'} 
                label={'Token'}
                margin="0 0 1rem 0"
                on:selected={ handleTokenSelect }
            />
        {/if}
        {#if error}
            <div id="dropdown-error" class="text-warning">{error}</div>
        {/if}
    </div>
    <DropDown
        items={accountList || accounts}
        id={'sender'}
        label={'From Address'} 
        margin="0 0 1rem 0"
        required={true}
        on:selected={handleSenderAddrSelect}
    />
    <div class="receiver">
        {#if receiverType === 1}
            <InputBox
                id="receiver-input"
                width="100%"
                height="39px"
                placeholder={"Enter receiver address"}
                label={"To Address"}
                required={true}
                bind:thisInput={receiverField}
                on:changed={() => to = receiverField.value}
            />
            {#if nameResolveError}
                <div id="dropdown-error" class="text-warning">{nameResolveError}</div>
            {/if}
        {:else}
            <DropDown
                items={toAccounts} 
                id={'receiver-dropdown'}
                label={'To Address'} 
                required={true}
                on:selected={handleReceiverAddrSelect}
            />
        {/if}
    </div>
    <InputBox
        id="amount"
        width="100%"
        bind:value={amount}
        label={"Amount"}
        margin="1rem 0 2rem 0"
        inputType={"number"}
        required={true}
    >
        <span slot="button" class="max-btn" on:click={maxAmount}>Max</span>
    </InputBox>
    {#if !$currentNetwork.blockservice.host} 
        <InputBox
            id="stamp-input"
            width="100%"
            bind:value={stampLimit}
            label={"Stamp Limit"}
            margin="0 0 1rem 0"
            inputType={"number"}
            required={true}
        />
    {/if}
    <div id="advanced" on:click={ () => { nextPage() } }>
        <span class="text-accent">Click Here To Send An Advanced Transaction</span>
    </div>
    <div class="buttons">
        <Button id="lamden-tx-next-btn"
                classes={'button__solid button__primary'} 
                width={'232px'}
                margin={'0 0 17px 0'}
                name="Next"
                loadingText = "Resolving Name"
                loading = {loading}
                click={() => handleNext()} />
    </div>
</div>


