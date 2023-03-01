<script>
	import whitelabel from "../../../whitelabel.json";

	import {
		getContext,
		setContext,
		afterUpdate,
		createEventDispatcher,
		onMount,
	} from "svelte";
	import { fly } from "svelte/transition";
	import { quintOut } from "svelte/easing";

	//Stores
	import {
		NodesStore,
		currentNetwork,
		BalancesStore,
		balanceTotal,
		networkKey,
		TokenBalancesStore,
		DappStore,
		TokenStore,
		PriceStore,
		TauPrice,
		SettingsStore,
		currentNetworkName,
		NetworksStore
	} from "../../js/stores/stores.js";

	//Images
	import arrowIn from "../../img/arrow_in.svg";
	import arrowOut from "../../img/arrow_out.svg";
	import History from "../../img/history.svg";

	import SettingsIcon from "../icons/SettingsIcon.svelte";

	//Components

	import { Token, Components } from "../Router.svelte";
	const { Identicons, TokenLogo } = Components;

	//Utils
	import {
		formatAccountAddress,
		displayBalance,
		getKeyValue,
		createCharmKey,
		formatValue,
		stringToFixed,
		getTokenBalance,
		copyToClipboard,
		toBigNumber,
		calcValue,
	} from "../../js/utils.js";

	//Images
	import logo from "../../img/logo.svg";

	//Icons
	import CheckmarkIcon from "../icons/CheckmarkIcon.svelte";
	import CopyIcon from "../icons/CopyIcon.svelte";
	import DirectionalChevronIcon from "../icons/DirectionalChevronIcon.svelte";

	import Lamden from "lamden-js";
		import CoinDelete from "./CoinDelete.svelte";
	const { Encoder } = Lamden;

	const dispatch = createEventDispatcher();

	// Props
	export let coin;
	export let token;
	export let refreshTx;
	export let collapse = false;

	const formats = {
		number: { default: 0 },
		string: { default: "None" },
	};

	let divElm;

	let copied = false;

	$: currentFiat = $SettingsStore.fiat;
	$: fiatGraphSymbol = whitelabel.fiat[currentFiat];
	$: collapseStatus = collapse;

	$: direction = collapseStatus ? "down" : "right";

	//Context
	const { switchPage, openModal, closeModal } = getContext("app_functions");

	const genericIcon_base64_svg =
		"PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiPjxjaXJjbGUgc3Ryb2tlPSJub25lIiBmaWxsPSIjOGU3Yjk4IiByPSI0OCUiIGN4PSI1MCUiIGN5PSI1MCUiPjwvY2lyY2xlPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDUwIDUwKSBzY2FsZSgwLjY5IDAuNjkpIHJvdGF0ZSgwKSB0cmFuc2xhdGUoLTUwIC01MCkiIHN0eWxlPSJmaWxsOiNmZmZmZmYiPjxzdmcgZmlsbD0iI2ZmZmZmZiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgdmVyc2lvbj0iMS4xIiBzdHlsZT0ic2hhcGUtcmVuZGVyaW5nOmdlb21ldHJpY1ByZWNpc2lvbjt0ZXh0LXJlbmRlcmluZzpnZW9tZXRyaWNQcmVjaXNpb247aW1hZ2UtcmVuZGVyaW5nOm9wdGltaXplUXVhbGl0eTsiIHZpZXdCb3g9IjAgMCA1OCA4OCIgeD0iMHB4IiB5PSIwcHgiIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIj48ZGVmcz48c3R5bGUgdHlwZT0idGV4dC9jc3MiPgogICAKICAgIC5maWwwIHtmaWxsOiNmZmZmZmZ9CiAgIAogIDwvc3R5bGU+PC9kZWZzPjxnPjxwYXRoIGNsYXNzPSJmaWwwIiBkPSJNMCAyNGMwLC0zMSA1OCwtMzMgNTgsLTEgMCwxOSAtMTksMTggLTIzLDM2IC0yLDkgLTE0LDggLTE0LC0yIDAsLTE3IDE0LC0xOCAyMCwtMjkgNCwtOCAtMywtMTYgLTExLC0xNiAtMTcsMCAtMTEsMTkgLTIyLDE5IC00LDAgLTgsLTMgLTgsLTd6bTI4IDY0Yy0xMiwwIC0xMSwtMTggMCwtMTggMTIsMCAxMiwxOCAwLDE4eiI+PC9wYXRoPjwvZz48L3N2Zz48L2c+PC9zdmc+";

	$: addressLookupURL = $currentNetwork.blockExplorer;
	$: onMainnet = $currentNetwork.type === "mainnet" ? true : false;
	$: netKey = networkKey($currentNetwork);
	$: watching = coin.sk === "watchOnly";
	$: balance = BalancesStore.getBalance($currentNetwork, coin.vk);
	$: balanceStr = balance ? displayBalance(stringToFixed(balance, 8)) : "0";
	$: balanceValue = calcValue(balance, $TauPrice);
	$: percent =
		typeof $balanceTotal[netKey] === "undefined" ? "" : toPercentString();

	$: tokenBalance =
		token && coin
		? getTokenBalance(
			netKey,
			coin.vk,
			token.contractName,
			$TokenBalancesStore
			)
		: "0";
	$: tokenBalanceTruncated = stringToFixed(tokenBalance.toString(), 8);
	$: tokenBalanceString = displayBalance(tokenBalanceTruncated);
	$: hasVisibleBalance = toBigNumber(tokenBalanceTruncated).isGreaterThan(0);
	$: tokenPrice =
		token && token.contractName
		? $PriceStore[token.contractName]
			? $PriceStore[token.contractName]["value"]
			: "0"
		: "0";
	$: tokenValue = calcValue(
		tokenBalance,
		calcValue(tokenPrice, $TauPrice, null)
	);
	$: totalValue = getTotalValue(
		tokenList,
		coin,
		balance,
		$TauPrice,
		$PriceStore,
		$currentNetwork,
		$TokenBalancesStore
	);

	$: dapps = $DappStore
		? Object.values($DappStore)
			.filter((app) => !!app[`${$currentNetworkName}|${$currentNetwork.type}`] && app.vk === coin.vk)
			.map((app, index) => {
			app.id = index;
			return app;
			})
		: [];

	$: tokenList = getTokens(netKey, coin.vk, $TokenStore, $TokenBalancesStore);
	$: tokensNum = tokenList.length;
	$: isVaultAccount = coin.type === "vault";
	$: isNodeAccount = $NodesStore.findIndex(x => x.vk === coin.vk && x.netKey === netKey) > -1

	afterUpdate(() => {
		balance = BalancesStore.getBalance($currentNetwork, coin.vk);
		balanceStr = balance ? balance.toLocaleString("en") : "0";
		percent =
		typeof $balanceTotal[networkKey($currentNetwork)] === "undefined"
			? "0.0 %"
			: toPercentString();
	});

	const toPercentString = () => {
		if (isNaN(balance / $balanceTotal[networkKey($currentNetwork)]))
		return "0.0 %";
		return (
		((balance / $balanceTotal[networkKey($currentNetwork)]) * 100)
			.toFixed(2)
			.toString() + " %"
		);
	};

	const getTotalValue = (
		tokenList,
		coin,
		balance,
		tauPrice,
		PriceStore,
		currentNetwork,
		TokenBalancesStore
	) => {
		if (
		!tokenList ||
		!coin ||
		!tauPrice ||
		!PriceStore ||
		!currentNetwork ||
		currentNetwork.type === "testnet" ||
		!TokenBalancesStore
		) {
		return "0";
		}
		let value = Encoder("bigNumber", "0");
		tokenList.forEach((token) => {
		let tokenbalance = getTokenBalance(
			networkKey(currentNetwork),
			coin.vk,
			token.contractName,
			TokenBalancesStore
		);
		let tokenprice = PriceStore[token.contractName]
			? PriceStore[token.contractName]["value"]
			: "0";
		let tokenvalue = calcValue(
			tokenbalance,
			calcValue(tokenprice, tauPrice, null, false),
			null,
			false
		);
		value = value.plus(tokenvalue);
		});
		value = value.plus(calcValue(balance, tauPrice, null, false));
		return value.toFormat(2, {
		decimalSeparator: ".",
		groupSeparator: ",",
		groupSize: 3,
		});
	};

	const handleAddressCopy = () => {
		copyToClipboard(coin.vk);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	};

	const handleReorderUp = () => {
		dispatch("reorderAccount", { id: coin.id, direction: "up" });
	};
	const handleReorderDown = () => {
		dispatch("reorderAccount", { id: coin.id, direction: "down" });
	};

	const handleSend = () => {  
		if (!$currentNetwork.online && $currentNetworkName === 'legacy' && new Date().getTime() < 1675116000000) {
			openModal("MessageBox", {
				title: "Arko Update in Progress",
				text: `The Lamden Network is down pending an upgrade to the Arko Network. All your balances will be transferred to the new network.  Please be patient as we being up the new network.  Visit <a class="text-link text-decoration" href="https://t.me/lamdenchat" target="__blank">Lamden Telegram Room</a> for updates`,
				buttons: [{name: 'Cancel', click: () => closeModal(), class: 'button__solid button__primary'}],
		})
		return
		}

		if ($currentNetwork.online && $currentNetworkName === 'legacy' && new Date().getTime() > 1675116000000) {
			openModal("MessageBox", {
				title: "Network Decommissioned",
				text: `The Legacy Lamden network has been upgraded to the new Arko Network.  Please switch wallet to “Arko Mainnet”.`,
				buttons: [{name: 'Switch To Arko', click: () => {
					let arkomainnet = $NetworksStore.lamden.find(t => t.networkName === "arko" && t.type === "mainnet")
					NetworksStore.setCurrentNetwork(arkomainnet);
					closeModal()
				}, class: 'button__solid button__primary'}, {name: 'Cancel', click: () => closeModal(), class: 'button__solid button__primary'}],
			})
			return
		}

		if (balance.isGreaterThan(0)) {
		if (token) {
			openModal("TokenLamdenSend", {
			token,
			coin,
			txMethod: "transfer",
			refreshTx: () => refreshTx(),
			});
		} else {
			openModal("CoinLamdenSend", { coin, refreshTx: () => refreshTx() });
		}
		} else {
		openModal("MessageBox", {
			text: `You have no ${$currentNetwork.currencySymbol} balances. Please get some coins before making a transaction.`,
			type: "caution",
			buttons: [{name: 'Cancel', click: () => closeModal(), class: 'button__solid button__primary'}],
		})
		}
	};

	const handleReceive = () => {
		openModal("CoinLamdenReceive", { coin });
	};

	const handleCollapse = () => {
		collapseStatus = !collapseStatus;
		dispatch("collapseChange", { vk: coin.vk, value: collapseStatus });
	};

	const getTokens = (netKey, vk, tokenStore, tokenBalancesStore) => {
		if (!tokenStore[netKey]) return [];
		if (!tokenBalancesStore[netKey]) return [];
		if (!tokenBalancesStore[netKey][vk]) return [];
		let tokens = [];
		Object.keys(tokenBalancesStore[netKey][vk]).forEach((key) => {
		if (
			!tokenBalancesStore[netKey][vk][key] ||
			tokenBalancesStore[netKey][vk][key] == "0"
		)
			return;
		let item = tokenStore[netKey].find((t) => t.contractName === key);
		if (item) {
			item.balance = tokenBalancesStore[netKey][vk][key];
			tokens.push(item);
		}
		});
		return tokens;
	};

	const handleHistoryClick = () => {
		window.open(`${addressLookupURL}/addresses/${coin.vk}`, "_blank");
	};

	const handleOptionClick = () => {
		openModal("CoinModify", coin);
	};

	const handleManageClick = () => {
		switchPage("DashboardNodeList");
	}
</script>

{#if !token || (token && hasVisibleBalance)}
	<div class="wrap" class:wrap-leagyc={!isVaultAccount}>
		<div class="wrap-second">
			<div
				id={`coin-row-${coin.id}`}
				bind:this={divElm}
				class="row-box flex-column text-body1"
				class:active-bg={collapseStatus}
				class:text-primary={isVaultAccount}
			>
				<div class="coin-main-row flex-row flex-align-center">
					<div class="collapse-btn" on:click={handleCollapse}>
						<DirectionalChevronIcon
							strokeWidth={2.75}
							{direction}
							width="16px"
							color="var(--font-primary)"
						/>
					</div>

					{#if whitelabel.mainPage.logo.show}
						<div class="logowrap">
							<div class="logo flex-center-center">
							<Identicons margin="0" iconValue={coin.vk} width="27px" />
							</div>
						</div>
					{/if}

					<div class="header-wrapper flex-grow-1">
						<div id={`coin-nickname-${coin.id}`} class="name flex-row flex-align-center flex-grow-1 text-body1 text-primary">
								{`${coin.nickname}`}
								{#if isNodeAccount}
									<span class="badge weight-400">Node</span>
								{/if}
								<div class="num-of-tokens tooltip">
									<div class="token-amount">{tokensNum}</div>
									<div class="tooltip-text">{tokensNum} {tokensNum === 1 ? "Token" : "Tokens"}</div>
								</div>
						</div>
	
						<div class="detail flex-row flex-center-end">
							<!-- AMOUNT OF TAU -->
							{#if whitelabel.mainPage.amount.show}
								<div class="detail-item flex-column">
									{#if token}
										<div class="token-balance">
											{`${tokenBalanceString} ${token.tokenSymbol}`}
										</div>
									{/if}
									<div>
										{`${balanceStr} ${$currentNetwork.currencySymbol}`}
									</div>
								</div>
							{/if}
							
	
							{#if onMainnet}
								<div class="detail-item flex-column">
									{#if token}
										<div>{fiatGraphSymbol}{tokenValue}</div>
									{/if}
									<div>{fiatGraphSymbol}{balanceValue}</div>
								</div>
							{/if}
						</div>
					</div>

				</div>
				{#if collapseStatus}
					<div class="flex-row coinmenus">
						{#if !token}
							<div class="flex-row flex-align-center reorder-btns">
								<button
									class="button__small round button__primary"
									on:click|stopPropagation={handleReorderUp}
								>

								<DirectionalChevronIcon width={"100%"} margin="0 0 0 3px" color="white" />

								</button>

								<button
									class="button__small round button__primary"
									on:click|stopPropagation={handleReorderDown}
								>
									<DirectionalChevronIcon
										width={"100%"}
										direction="down"
										color="white"
									/>
								</button>
							</div>
						{/if}
						<div class="coin-btns">
							{#if coin.sk !== "watchOnly"}
								<button
									id="send-btn"
									class:send-btn={!token}
									class="button__small button__primary coin-btn flex-row"
									on:click|stopPropagation={handleSend}
								>
									{`Send ${
										token ? token.tokenSymbol : $currentNetwork.currencySymbol
									}`}
									<div class="icon">
										{@html arrowOut}
									</div>
								</button>
								<button
									id="receive-btn"
									class="button__small button__primary coin-btn flex-row"
									on:click|stopPropagation={handleReceive}
								>
									{`Receive ${
										token ? token.tokenSymbol : $currentNetwork.currencySymbol
									}`}
									<div class="icon">
										{@html arrowIn}
									</div>
								</button>
							{/if}
							<button
								class="button__small address coin-btn flex-row button__primary"
								class:success={copied}
								on:click|stopPropagation={handleAddressCopy}
								title="copy account address"
							>
								{formatAccountAddress(coin.vk, 7, 0)}
								<div class="icon icon-copy">
									{#if !copied}
										<CopyIcon color="var(--color-white)" />
									{:else}
										<CheckmarkIcon color="var(--success-color)" />
									{/if}
								</div>
							</button>
							<button
								id="history-btn"
								class="button__small button__primary coin-btn flex-row"
								on:click|stopPropagation={handleHistoryClick}
							>
								View Transaction History
								<div class="icon">
									{@html History}
								</div>
							</button>
							<button
								id="options"
								class="button__small button__primary coin-btn flex-row"
								on:click|stopPropagation={handleOptionClick}
							>
								Options
								<div class="icon">
									<SettingsIcon color="var(--color-white)" />
								</div>
							</button>
							{#if isNodeAccount} 
								<button
								id="options"
								class="button__small button__primary coin-btn flex-row"
								on:click|stopPropagation={handleManageClick}
								>
									Manage
									<div class="icon">
										<SettingsIcon color="var(--color-white)" />
									</div>
								</button>
							{/if}
							{#if coin.sk !== "watchOnly"}
								<div class="dapps">
									{#each dapps as dapp (dapp.appName)}
										<span
										class="avatar"
										on:click|stopPropagation={() =>
											switchPage("ConnectionDetails", dapp)}
										>
											<img src={`${dapp.url}${dapp.logo}`} alt="" />
										</span>
									{/each}
								</div>
							{/if}
						</div>
					</div>
				
					{#if tokenList.length > 0}
						<div class="header header-text divider">
							<div class="header-name header-text">My Tokens</div>
							<div class="header-amount header-text">Amount</div>
								{#if onMainnet}
									<div class="header-price header-text">Value</div>
								{/if}
							</div>
							<div class="tokenlist">
								{#each tokenList as token (token.contractName)}
									<Token {token} vk={coin.vk} />
								{/each}
							</div>
					{/if}

					{#if onMainnet}
						<div class="total-wallet-value text-body2">Total Account Value: {fiatGraphSymbol}{totalValue}</div>
						<div class="percet-of-portfolio text-body2 text-secondary">{`${percent} of portfolio`}</div>
					{/if}
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.badge {
		background-color: var(--accent-color);
		color: var(--font-black);
		border-radius: 10px;
		padding: 0 8px;
		font-weight: 800;
		margin: 10px;
	}
	.reorder-btns {
		margin-top: 1rem;
		align-self: start;
	}
	.coin-btns {
		flex-wrap: wrap;
		display: flex;
	}
	.wrap {
		width: 100%;
		height: 100%;
		margin: 0.5rem 0;
		box-sizing: border-box;
		border-radius: 6px;
		background-image: linear-gradient(#a26bfa, #4f06c6);
	}
	.wrap-leagyc {
		background: var(--outline);
	}
	.wrap-second {
		background-color: var(--bg-primary);
		margin: 2px;
		box-sizing: border-box;
		border-radius: 6px;
	}
	.row-box {
		padding: 10px 20px;
		box-sizing: border-box;
		background: linear-gradient(
			95.08deg,
			var(--row-box-bg-1) 2.49%,
			var(--row-box-bg-2) 97.19%
		);
	}

	.logowrap {
		margin-left: 20px;
		justify-content: center;
		display: flex;
	}

	.coin-main-row{
		line-height: 1.5;
	}

	.header-wrapper{
		width: 100%;
		display: flex;
		flex-direction: row;
	}

	.logo {
		width: 43px;
		box-sizing: border-box;
		display: flex;
		justify-content: center;
		padding: 5px;
		background: black;
		border-radius: 999px;
		border: 3px solid var(--color-grey-3);
	}

	.detail{
		align-items: center;
		justify-content: end;
		font-weight: 300;
	}

	.detail-item{
		margin-left: 20px;
	}

	.name {
		margin-left: 20px;
		width: max-content;
	}

	.num-of-tokens{
		position: relative;
		border: 1px solid var(--font-primary-dim);
		background-color: transparent;
		border-radius: 99px;
		width: 20px;
		height: 20px;
		margin-left: 20px;
	}

	.num-of-tokens > .token-amount {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		font-weight: 400;
		color: var(--font-primary);
		font-size: var(--text-body3);
		font-weight: 300;
	}

	.num-of-tokens > .tooltip-text{
		margin-left: 20px;
	}

	.address {
		background: var(--primary-color);
		cursor: pointer;
		border-radius: 16px;
	}
	.address:hover {
		background: var(--bg-secondary-hover);
	}
	.address.success {
		color: var(--success-color);
		border: 1px solid var(--success-color);
	}
	.icon-copy {
		width: 10px;
		height: 10px;
		margin-left: 8px;
		margin-bottom: 4px;
	}
	.coin-btn {
		padding: 8px 14px;
		margin-left: 14px;
		font-size: 0.8em;
		align-items: center;
		margin-top: 1rem;
	}

	.coin-btn > .icon {
		width: 12px;
		height: 12px;
		margin-left: 8px;
	}

	.dapps {
		margin: 14px 14px 0 14px;
		display: flex;
		align-items: center;
	}

	.dapps .avatar {
		display: inline-block;
		width: 23px;
		height: 23px;
		border-radius: 50%;
		border: 2px solid white;
		background: var(--bg-secondary);
		overflow: hidden;
		cursor: pointer;
	}
	.dapps .avatar:not(:first-child) {
		margin-left: -8px;
	}

	.dapps .avatar:hover {
		position: relative;
		width: 25px;
		height: 25px;
		z-index: 635;
	}
	.dapps .avatar img {
		width: 100%;
		height: 100%;
		max-width: 100%;
		max-height: 100%;
		vertical-align: middle;
	}

	.coinmenus {
		padding-left: 82px;
		margin-bottom: 1.5rem;
		margin-top: 0.8rem;
	}
	.header-text {
		display: flex;
		align-items: center;
	}
	.header {
		display: flex;
		flex-direction: row;
		width: 100%;
		padding: 0.5rem 80px;
		margin-bottom: 0.5rem;
		font-weight: 800;
		background: rgba(170, 170, 170, 0.1);
		box-sizing: border-box;
	}
	.active-bg {
		background: linear-gradient(
			95.08deg,
			var(--active-bg-1) 2.49%,
			var(--active-bg-2) 97.19%
		);
	}
	.collapse-btn {
		cursor: pointer;
		justify-content: end;
		display: flex;
	}
	.tokenlist {
		padding-left: 64px;
		margin-bottom: 2rem;
	}
	.header-amount {
		margin-left: 242px;
	}
	.header-price {
		margin-left: 180px;
	}
	.total-wallet-value {
		font-weight: 300;
		text-align: center;
	}
	.percet-of-portfolio{
		font-weight: 300;
		text-align: center;
		margin-bottom: 1rem;
	}

	@media screen and (max-width: 830px) {
		.tokenlist {
			padding: 0 5%;
			box-sizing: border-box;
		}
		.header-amount{
			display: none;
		}
		.header-price{
			display: none;
		}
		.header {
			padding: 0.5rem 5%;
		}
		.header-wrapper{
			flex-direction: column;
		}
		.name{
			justify-content: space-between;
			width: 100%;
		}
		.detail{
			justify-content: flex-start;
		}
		.num-of-tokens{
			margin-left: 0px;
			margin-right: 11px;
		}
		.coinmenus {
			padding-left: 0px;
		}
	}
</style>
