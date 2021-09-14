<script>
	import whitelabel from '../../../whitelabel.json'

	import { getContext } from 'svelte';
	
	//Stores
	import { 
			CoinStore,
			TokenStore,
			balanceTotal,
			currentNetwork,
			networkKey,
			SettingsStore
		} from '../../js/stores/stores.js';

	//Components
	import { Coin, Token, CoinEmpty, CoinDivider, Modal, Modals, Components }  from '../Router.svelte'
	const { Button } = Components;

	//Images
	import hero_bg from '../../img/backgrounds/hero_bg.png';

	//Icons
	import RefreshIcon from '../icons/RefreshIcon.svelte'
	import PlusIcon from '../icons/PlusIcon.svelte'

	//Utils
	import { displayBalance } from '../../js/utils.js';

	//Context
    const { switchPage, openModal } = getContext('app_functions');
	
	//Props
	export let name

	$: totalBalance = $balanceTotal[networkKey($currentNetwork)] ? $balanceTotal[networkKey($currentNetwork)] : '0';

	let refreshing = false;
	let orderingLocked = false;
	$: coinStorage = $CoinStore ? [...$CoinStore].map((coin, index) => {
		coin.id = index
		return coin
	}) : [];
	$: tokenStorage = $TokenStore[networkKey($currentNetwork)] ? [...$TokenStore[networkKey($currentNetwork)]].map((token, index) => {
		token.id = index
		return token
	}) : [];
	$: hideTokens = $SettingsStore.hideTokens ? true : false;

	const handleRefresh = () => {
		if (refreshing) return
		chrome.runtime.sendMessage({type: 'updateAccountAndTokenBalances'})
		refreshing = true
		setTimeout(() => {
			refreshing = false
		}, 2000);
	}

	const handleReorderToken = (e) => {
		let { id, direction } = e.detail
		if (direction == "up" && !orderingLocked){
			orderingLocked = true;
			chrome.runtime.sendMessage({type: 'tokensReorderUp', data: id}, (success) => {
				if (id !== 0) scrollWindow(-41)
				orderingLocked = false;
			})
		}

		if (direction == "down" && !orderingLocked){
			orderingLocked = true;
			chrome.runtime.sendMessage({type: 'tokensReorderDown', data: id}, (success) => {
				if (id + 1 < tokenStorage.length) scrollWindow(41)
				orderingLocked = false;
			})
		}
	}
	
	const handleReorderAccount = (e) => {
		let { id, direction } = e.detail
		if (direction == "up" && !orderingLocked){
			orderingLocked = true;
			chrome.runtime.sendMessage({type: 'accountsReorderUp', data: id}, (success) => {
				if (id !== 0) scrollWindow(-90)
				orderingLocked = false;
			})
		}

		if (direction == "down" && !orderingLocked){
			orderingLocked = true;
			chrome.runtime.sendMessage({type: 'accountsReorderDown', data: id}, (success) => {
				if (id + 1 < coinStorage.length)scrollWindow(90)
				orderingLocked = false;
			})
		}
	}

	const scrollWindow = (y) => {
		window.scrollBy(0, y)
	}
	
	const handleHideTokens = () =>{
		if (!$SettingsStore.hideTokens) SettingsStore.hideTokens(true)
		else SettingsStore.hideTokens(false)
	}

</script>

<style>
.coinsmain{
	display: flex;
	flex-direction: column;
}

.hero-rec{
	height: 346px;
}

.refresh-icon{
    width: 40px;
	cursor: pointer;
}
.text-huge:first-child{
    margin-right: 10px;
}
.header{
	display: flex;
	flex-direction: row;
	width: 100%;
	padding: 0.5rem 0;
	margin-bottom: 0.5rem;
}
.header-accounts{
	margin-top: 2rem;
}

.divider{
	border-bottom: 1px solid var(--divider-light);
}

.header-text{
	display: flex;
	align-items: center;
}

.header-name{
    width: 234px;
}

.header-amount{
	padding-left: 15px;
	flex-grow: 1;
}

.header-percent{
	justify-content: flex-end;
	margin-right: 28px;  
	width: 203px;
}
.balance-total{
	align-items: center;
	color: var(--font-overlay);
}
.balance-words{
	color: var(--font-overlay);
}
p{
    margin: 0;
}
.buttons{
	align-items: flex-end;
	flex-grow: 1;
}
.logo-space{
	margin-left: 84px;
}
.hide-tokens-button{
	padding: 2px 6px;
}
.show-tokens-button{
	padding: 5px 10px;
}
</style>

<div class="coinsmain text-primary">
	<div class="hero-rec" style="background-image: url({hero_bg});">
		<div class="balance-words text-body1">
			{`${$currentNetwork.currencySymbol}`}
		</div>
		<div class="flex-row balance-total">
			<p class="text-huge">{`${displayBalance(totalBalance)}`}</p>
			<div on:click={handleRefresh} 
				id="refresh-icon"
				class="flex-column refresh-icon" 
				class:spinner={refreshing}>
				<RefreshIcon />
			</div>
		</div>
		<div class="flex-row buttons">
			{#if whitelabel.mainPage.buttons.add_account.show}
				<Button
					id={'add-btn'} 
					classes={'button__outlined button__overlay'}
					name={whitelabel.mainPage.buttons.add_account.name}
					click={() => openModal('CoinAdd')}
				>
					<div slot="icon-before">
						<PlusIcon width="15px" color="var(--color-white)" />
					</div>
				</Button> 
			{/if}
		</div>
	</div>

	{#if $currentNetwork}
		{#if tokenStorage.length > 0 && whitelabel.enableTokens}
			{#if hideTokens}
			<div class="flex-row flex-center-center mb-half">
				<button class="button__small show-tokens-button text-body2"
						on:click={handleHideTokens}
				>
					{`${tokenStorage.length} ${tokenStorage.length === 1 ? 'token' : 'tokens'} hidden`}
				</button>
			</div>

			{:else}
				<div class="header header-text divider text-body1">
					{#if whitelabel.mainPage.token_columns.token_name.show}
						<div class:logo-space={whitelabel.mainPage.logo.show} 
							class="header-name header-text">
							{whitelabel.mainPage.token_columns.token_name.title}
						</div>
					{/if}
					{#if whitelabel.mainPage.token_columns.token_amount.show}
						<div class="header-amount header-text">
							{whitelabel.mainPage.token_columns.token_amount.title}
						</div>
					{/if}
					{#if whitelabel.mainPage.token_columns.token_amount.show}
						<button class="button__small hide-tokens-button text-body2" on:click={handleHideTokens}>{"hide"}</button>
					{/if}
				</div>
				{#each tokenStorage as token (token.id) }
					<Token {token} on:reorderToken={handleReorderToken}/>
				{/each}
			{/if}
		{/if}
		{#if coinStorage.length === 0}
			<CoinEmpty />
		{:else}
			<div class="header header-accounts header-text text-body1 divider ">
				{#if whitelabel.mainPage.account_info.show}
					<div class:logo-space={whitelabel.mainPage.logo.show} class="header-name header-text">{whitelabel.mainPage.account_info.title}</div>
				{/if}
				{#if whitelabel.mainPage.amount.show}
					<div class="header-amount header-text">{whitelabel.mainPage.amount.title}</div>
				{/if}
				{#if whitelabel.mainPage.portfolio.show}
					<div class="header-percent header-text">{whitelabel.mainPage.portfolio.title}</div>
				{/if}
			</div>	
			{#each coinStorage as coin (coin.id) }
				<Coin {coin} on:reorderAccount={handleReorderAccount}/>
				<CoinDivider />
			{/each}
		{/if}
	{/if}
</div>