<script>
    import whitelabel from '../../../whitelabel.json'

    import { getContext, setContext, afterUpdate, createEventDispatcher } from 'svelte';
	import { fly } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';

    //Stores
    import { tokenBalanceTotal, currentNetwork, networkKey } from '../../js/stores/stores.js';

    //Components
    import TokenLogo from '../components/TokenLogo.svelte';

    //Icons
     import DirectionalChevronIcon from '../icons/DirectionalChevronIcon.svelte'

    //Utils
    import { displayBalance, formatValue, stringToFixed, getTokenTotalBalance} from '../../js/utils.js'  

    const dispatch = createEventDispatcher()

    // Props
    export let token;

    let logoSize = "38px"

    $: balance = getTokenTotalBalance(networkKey($currentNetwork), token.contractName, $tokenBalanceTotal)

    //Context
    const { switchPage } = getContext('app_functions');

    const handleReorderUp = () => dispatch('reorderToken', {id: token.id, direction: "up"})
    const handleReorderDown = () => dispatch('reorderToken', {id: token.id, direction: "down"})
    
</script>

<style>
.row-box{
    padding: 1rem 28px 1rem 16px;
}

.text{
    display: flex;
    align-items: center;
    flex-wrap: wrap;
}

.logo{
    display: flex;
    justify-content: center;
}

.name{
	width: 234px;
}

.amount{
    padding-left: 15px;
    flex-grow: 1;
    justify-content: center;
}
</style>

<div 
    id={`token-row-${token.tokenSymbol}-${token.tokenName.replace(" ", "")}`} 
    class="row-box flex-row" 
    in:fly="{{delay: 0, duration: 500, x: 0, y: 25, opacity: 0.0, easing: quintOut}}"
    >
    {#if whitelabel.mainPage.token_columns.token_logo.show}
        <div class="logo flex-center-center" style={`height: ${logoSize};`}>
            <TokenLogo tokenMeta={token} width={logoSize} margin="0 76px 0 0" />
        </div>
    {/if}
    {#if whitelabel.mainPage.token_columns.token_name.show}
        <div class="name nickname text text-body2" on:click={() => switchPage('TokenDetails', token)}>
            {`${token.tokenName}`}
        </div>
    {/if}
    {#if whitelabel.mainPage.token_columns.token_amount.show}
        <div class="amount flex-column text-body2 text-primary-dim">
            {`${displayBalance(stringToFixed(balance, 8))} ${token.tokenSymbol}`}
        </div>
    {/if}
    <div class="flex-row flex-center-end">
        <div class="flex-row show-on-hover">
            <button class="button__small reorder-button" on:click={handleReorderUp}>
                <DirectionalChevronIcon width="8px" color="var(--font-primary-dim)"/>
            </button>
            <button class="button__small reorder-button" on:click={handleReorderDown}>
                <DirectionalChevronIcon  width="8px" direction="down" color="var(--font-primary-dim)"/>
            </button>
        </div>  
    </div>
</div>

