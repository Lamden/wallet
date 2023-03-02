<script>
	import whitelabel from "../../../whitelabel.json";

	import { getContext, onMount } from "svelte";
	//Images
	import nav_bg from "../../img/backgrounds/nav_bg.png";

	//Stores
	import {
		CoinStore,
		TokenStore,
		balanceTotal,
		currentNetwork,
		networkKey,
		SettingsStore,
		TokenBalancesStore,
		PriceStore,
		TauPrice,
		currentNetworkName,
		NetworksStore,
	} from "../../js/stores/stores.js";

	//Icons
	import RefreshIcon from "../icons/RefreshIcon.svelte";
	import PlusIcon from "../icons/PlusIcon.svelte";

	//Components
	import { NavLogo, NavControls, Components, MobileMenu } from "../Router.svelte";
	const { Button } = Components;

	//Context
	const { openModal, closeModal } = getContext("app_functions");

	import Lamden from "lamden-js";
	const { Encoder } = Lamden;

	//Utils
	import { displayBalance, calcValue } from "../../js/utils.js";
	import DropDown from "../components/DropDown.svelte";

	const fiatList = [{ name: "Add Network", value: "add", selected: false }];

	$: currentFiat = $SettingsStore.fiat || "USD";
	$: onMainnet = $currentNetwork.type === "mainnet" ? true : false;
	$: totalBalance = $balanceTotal[networkKey($currentNetwork)]
		? $balanceTotal[networkKey($currentNetwork)]
		: "0";
	$: totalBalanceVaule = calcValue($TauPrice, totalBalance, null, false);
	$: totalTokenValue = getTotalTokenValue(
		$TauPrice,
		$CoinStore,
		$PriceStore,
		$currentNetwork,
		$TokenStore,
		$TokenBalancesStore
	);
	$: totalValue = totalTokenValue.plus(totalBalanceVaule).toFormat(2, {
		decimalSeparator: ".",
		groupSeparator: ",",
		groupSize: 3,
	});

	const getTotalTokenValue = (
		tauPrice,
		CoinStore,
		PriceStore,
		currentNetwork,
		TokenStore,
		TokenBalancesStore
	) => {
		let netkey = networkKey(currentNetwork);
		if (
		!CoinStore ||
		!tauPrice ||
		!PriceStore ||
		!currentNetwork ||
		currentNetwork.type === "testnet" ||
		!TokenStore ||
		!TokenBalancesStore ||
		!TokenBalancesStore[netkey]
		) {
		return Encoder("bigNumber", "0");
		}
		let totalTokenValue = Encoder("bigNumber", "0");
		Object.keys(TokenBalancesStore[netkey]).forEach((account) => {
		let coin = CoinStore.find((f) => f.vk === account);
		// the usd value of tracked accounts will not be calcuated
		if (coin && coin.sk === "watchOnly") return;
		Object.keys(TokenBalancesStore[netkey][account]).forEach(
			(contractName) => {
			let tokenBalance = TokenBalancesStore[netkey][account][contractName];
			let tokenPrice = PriceStore[contractName]
				? PriceStore[contractName]["value"]
				: "0";
			let tokenValue = calcValue(
				tokenBalance,
				calcValue(tokenPrice, tauPrice, null),
				null,
				false
			);
			totalTokenValue = totalTokenValue.plus(tokenValue);
			}
		);
		});
		return totalTokenValue;
	};

	let refreshing = false;

	const handleRefresh = () => {
		console.log({refreshing})
		if (refreshing) return;
		chrome.runtime.sendMessage({ type: "updateAccountAndTokenBalances" });
		refreshing = true;

		setTimeout(() => {
			refreshing = false;
		}, 2000);
	};

</script>

<div class="nav text-primary" style="background-image: url({nav_bg});">
	<div class="wrapper">
		<div class="mobile-menu">
			<MobileMenu />
		</div>
		<div class="mask" />
		<NavLogo
			style={`fill: var(--overlay-color);`}
		/>
	
		<div class="flex-column details">
			<div class="balance-words">
				{`Total ${$currentNetwork.currencySymbol}`}
			</div>

			<div class="balance-total">
				<p class="text-huge">{`${displayBalance(totalBalance)}`}</p>
			</div>

			{#if onMainnet}
				<div class="total-fiat">
					Total {currentFiat}
					{whitelabel.fiat[currentFiat]}
					{totalValue}
				</div>
			{/if}

			<button
				id="refresh-icon"
				class="refresh-icon button__small button__primary expand-btn flex-row"
				disabled={refreshing}
				on:click={handleRefresh}
				>
				Refresh
				<div class="icon">
					<RefreshIcon width="16px" color="var(--color-white)" />
				</div>
			</button>

		</div>
	
		{#if whitelabel.nav.showNetworkBox}
			<NavControls style={`height: 80px;margin: 2rem 61px 2rem 0;`} />
		{/if}
	</div>
</div>

<style>
	.nav {
		display: flex;
		flex-direction: row;
		position: fixed;
		left: 0;
		top: 0;
		z-index: 29;
		border-bottom: 1px solid var(--divider-light);
		height: 212px;
		width: 100%;
		max-width: 1920px;
		background-repeat: no-repeat;
		background-size: 100% 200%;
		background-position: 0 10%;
		justify-content: space-between;

	}

	.wrapper{
		position: relative;
		width: 100%;
		height: 100%;
		padding-bottom: 0;
	}
	button{
		padding: 4px 11px;
		margin-left: 10px;
		letter-spacing: 0.5px;
		align-items: center;
		font-weight: bold;
		align-items: center;
	}
	button > .icon{
		margin-left: 5px;
	}
	.mobile-menu{
		display: none;
	}

	.balance-total {
		align-items: center;
		color: var(--font-overlay);
	}
	.balance-words {
		color: var(--font-overlay);
		font-size: var(--text-h2);
	}
	p {
		margin: 0;
	}
	.total-fiat{
		color: var(--color-white);
		font-weight: 200;
		margin-bottom: 5px;
		font-size: var(--text-h2);
	}
	.details {
		align-items: center;
		justify-content: center;
		margin-top: 1rem;
		height: 100%;
	}
	.mask {
		width: 100%;
		height: 100%;
		position: absolute;
		z-index: -1;
	}
	.refresh-icon:disabled{
		filter: grayscale(100%);
	}

	@media screen and (max-width: 830px) {
		.nav {
			margin: 0 auto;
			flex-direction: column;
		}
		.wrapper{
			position: relative;
			width: 100%;
			height: 100%;
			padding-bottom: 10px;
		}
		.mobile-menu{
			display: block;
		}
		.details{
			align-items: center;
			justify-content: center;
    		margin-top: 1.5rem;
		}
		.balance-words {
			align-items: center;
		}
		.refresh-icon{
			margin: 0.5rem 0 0;
		}
	}


	@media screen and (min-width: 1920px) {
		.nav {
			margin: 0 auto;
		}
	}
</style>
