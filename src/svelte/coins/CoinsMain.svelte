<script>
	import whitelabel from "../../../whitelabel.json";

	import { getContext, onMount } from "svelte";

	//Stores
	import {
		CoinStore,
		TokenStore,
		balanceTotal,
		currentNetwork,
		networkKey,
		SettingsStore,
		currentNetworkName,
		NetworksStore
	} from "../../js/stores/stores.js";

	//Components
	import {
		Coin,
		Token,
		CoinEmpty,
		CoinDivider,
		Modal,
		Modals,
		Components,
	} from "../Router.svelte";
	const { Button } = Components;

	//Images
	import cautionIcon from "../../img/menu_icons/icon_caution_circle.svg";
	import vaultLogo from "../../img/vault_logo.svg";
	import CollapseIcon from "../icons/CollapseIcon.svelte";
	import ExpandIcon from "../icons/ExpandIcon.svelte";
	import PlusIcon from "../icons/PlusIcon.svelte";

	//Context
	const { switchPage, openModal } = getContext("app_functions");

	let accountsCollapse = {};

	$: vaultExist = false;
	$: totalBalance = $balanceTotal[networkKey($currentNetwork)]
		? $balanceTotal[networkKey($currentNetwork)]
		: "0";

	let refreshing = false;
	let orderingLocked = false;
	$: vaults = $CoinStore
		? [...$CoinStore]
			.map((coin, index) => {
			coin.id = index;
			return coin;
			})
			.filter((c) => c.type === "vault")
		: [];

	$: coinStorage = $CoinStore
		? [...$CoinStore]
			.map((coin, index) => {
			coin.id = index;
			return coin;
			})
			.filter((c) => c.sk !== "watchOnly")
		: [];

	$: oldCoinStorage = $CoinStore
		? [...$CoinStore]
			.map((coin, index) => {
			coin.id = index;
			return coin;
			})
			.filter((c) => c.sk !== "watchOnly" && c.type !== "vault")
		: [];
	$: tokenStorage = $TokenStore[networkKey($currentNetwork)]
		? [...$TokenStore[networkKey($currentNetwork)]].map((token, index) => {
			token.id = index;
			return token;
		})
		: [];
	$: hideTokens = $SettingsStore.hideTokens ? true : false;
	$: coinsTracked = $CoinStore
		? [...$CoinStore]
			.map((coin, index) => {
			coin.id = index;
			return coin;
			})
			.filter((c) => c.sk === "watchOnly")
		: [];

	onMount(() => {
		// get collapse state of account card
		let data = window.localStorage.getItem("accounts_collapse");
		accountsCollapse = data ? JSON.parse(data) : {};

		chrome.runtime.sendMessage({ type: "isVaultCreated" }, (ok) => {
		vaultExist = ok;
		if (ok) {
			SettingsStore.setIsVaultCreated(ok);
		}
		});
	});

	const handleRefresh = () => {
		if (refreshing) return;
		chrome.runtime.sendMessage({ type: "updateAccountAndTokenBalances" });
		refreshing = true;
		setTimeout(() => {
			refreshing = false;
		}, 2000);
	};

	const handleReorderToken = (e) => {
		let { id, direction } = e.detail;
		if (direction == "up" && !orderingLocked) {
			orderingLocked = true;
			chrome.runtime.sendMessage(
				{ type: "tokensReorderUp", data: id },
				(success) => {
				if (id !== 0) scrollWindow(-41);
				orderingLocked = false;
				}
			);
			}

			if (direction == "down" && !orderingLocked) {
			orderingLocked = true;
			chrome.runtime.sendMessage(
				{ type: "tokensReorderDown", data: id },
				(success) => {
				if (id + 1 < tokenStorage.length) scrollWindow(41);
				orderingLocked = false;
				}
			);
		}
	};

	const handleReorderAccount = (e) => {
		let { id, direction } = e.detail;
		if (direction == "up" && !orderingLocked) {
			orderingLocked = true;
			chrome.runtime.sendMessage(
				{ type: "accountsReorderUp", data: id },
				(success) => {
					if (id !== 0) scrollWindow(-130);
						orderingLocked = false;
					}
				);
			}

			if (direction == "down" && !orderingLocked) {
			orderingLocked = true;
			chrome.runtime.sendMessage(
				{ type: "accountsReorderDown", data: id },
				(success) => {
					if (id + 1 < coinStorage.length) scrollWindow(130);
					orderingLocked = false;
				}
			);
		}
	};

	const scrollWindow = (y) => {
		window.scrollBy(0, y);
	};

	const handleHideTokens = () => {
		if (!$SettingsStore.hideTokens) SettingsStore.hideTokens(true);
		else SettingsStore.hideTokens(false);
	};

	const handleCollapseChange = (res) => {
		let data = res.detail;
		accountsCollapse[data.vk] = data.value;
		window.localStorage.setItem(
			"accounts_collapse",
			JSON.stringify(accountsCollapse)
		);
	};

	const expandAll = () => {
		$CoinStore.forEach((coin) => {
			accountsCollapse[coin.vk] = true;
		});
		window.localStorage.setItem(
			"accounts_collapse",
			JSON.stringify(accountsCollapse)
		);
	};

	const collapseAll = () => {
		Object.keys(accountsCollapse).forEach((key) => {
			accountsCollapse[key] = false;
		});
		window.localStorage.setItem(
			"accounts_collapse",
			JSON.stringify(accountsCollapse)
		);
	};
	
	const handleAccountAdd = () => handleCoinAdd("account")
	const handleTokenAdd = () => handleCoinAdd("token")

	const handleCoinAdd = (type) => {
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
		openModal("CoinAdd", type)
	}
	
</script>

<div class="coinsmain text-primary">
	<div class="top-btns">
		<button
			id="expand-btn"
			class="button__small button__primary expand-btn flex-row"
			on:click={handleAccountAdd}
			>
			Add Account
			<div class="icon">
				<PlusIcon width="18px" color="var(--color-white)" />
			</div>
		</button>

		<button
			id="expand-btn"
			class="button__small button__primary expand-btn flex-row"
			on:click={handleTokenAdd}
			>
			Add Token
			<div class="icon">
				<PlusIcon width="18px" color="var(--color-white)" />
			</div>
		</button>

		<button
			id="expand-btn"
			class="button__small button__primary expand-btn flex-row"
			on:click={expandAll}
			>
			Expand All
			<div class="icon">
				<ExpandIcon width="18px" color="var(--color-white)" />
			</div>
		</button>

		<button
			id="collapse-btn"
			class="button__small button__primary collapse-btn flex-row"
			on:click={collapseAll}
			>
			Collapse All
			<div class="icon">
				<CollapseIcon width="18px" color="var(--color-white)" />
			</div>
		</button>
	</div>

	{#if $currentNetwork}
		<div class="header flex-row flex-align-center text-body1 weight-800">
			<div class="flex-row flex-align-center flex-grow-1">
				My Vault Accounts
				<div class="warning-icon">{@html vaultLogo}</div>
			</div>

			{#if vaultExist && vaults.length > 0}
				<div class="header-item hide">{$currentNetwork.currencySymbol} / {$SettingsStore.fiat}</div>
			{/if}

		</div>

		{#if vaultExist}
			{#if vaults.length > 0}
				{#each vaults as coin (coin.vk)}
				<Coin
					{coin}
					collapse={!!accountsCollapse[coin.vk]}
					refreshTx={handleRefresh}
					on:collapseChange={handleCollapseChange}
					on:reorderAccount={handleReorderAccount}
				/>
				{/each}
			{:else}
				<Button
				id={"add-new-vaulte-button"}
				classes={"button__solid button__primary"}
				width={"232px"}
				margin={"1rem 0 0 0"}
				name="Create Vault Account"
				click={() => openModal("CoinAdd")}
				/>
			{/if}

		{:else}
			<CoinEmpty />
		{/if}

		{#if oldCoinStorage.length !== 0}
			<div class="header flex-row flex-align-center text-body1 weight-800">
				<div class="header-title flex-row flex-align-center flex-grow-1">
					{whitelabel.mainPage.account_info.title}
					<div
						class="warning-icon"
						on:click={() => openModal("CoinLegacyModal")}
						>
						{@html cautionIcon}
					</div>
				</div>
				
				<div class="header-item hide">{$currentNetwork.currencySymbol} / {$SettingsStore.fiat}</div>
			</div>

			{#each oldCoinStorage as coin (coin.vk)}
				<Coin
				{coin}
				collapse={!!accountsCollapse[coin.vk]}
				refreshTx={handleRefresh}
				on:collapseChange={handleCollapseChange}
				on:reorderAccount={handleReorderAccount}
				/>
			{/each}

		{/if}
		{#if coinsTracked.length > 0}
			<div class="header header-watched text-body1 weight-800">
				<div class="header-name header-item">
					Watched Accounts
					<div
						class="warning-icon"
						on:click={() => openModal("CoinWatchedModal")}
					>
						{@html cautionIcon}
					</div>
				</div>
			</div>

			<div class="header-msg header-item weight-600">
				You do not own the private keys for these accounts
			</div>

			{#each coinsTracked as coin (coin.vk)}
				<Coin
					{coin}
					collapse={!!accountsCollapse[coin.vk]}
					refreshTx={handleRefresh}
					on:collapseChange={handleCollapseChange}
					on:reorderAccount={handleReorderAccount}
				/>
			{/each}
		{/if}
	{/if}
</div>

<style>
	.top-btns {
		display: flex;
		justify-content: flex-end;
		margin-bottom: 2em;
	}
	.expand-btn,
	.collapse-btn {
		padding: 4px 11px;
		letter-spacing: 0.5px;
		align-items: center;
		font-weight: bold;
	}

	.expand-btn > .icon,
	.collapse-btn > .icon {
		width: 18px;
		height: 18px;
		margin-left: 8px;
	}
	.coinsmain {
		display: flex;
		flex-direction: column;
	}

	.warning-icon {
		width: 20px;
		margin-left: 10px;
		min-width: 20px;
		cursor: pointer;
	}
	.header{
		display: flex;
		flex-direction: row;
		margin-top: 1rem;
	}
	.header-item{
		margin-right: 20px;
	}

	@media screen and (max-width: 830px) {
		.top-btns {
			justify-content: space-around;
		}
		.hide{
			display: none;
		}

	}
</style>
