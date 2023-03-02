<script>
	import { getContext } from "svelte";

	//Stores
	import {
		currentPage,
		needsBackup,
		newEventNum,
		menu_open
	} from "../../js/stores/stores.js";

	//Context
	const { switchPage } = getContext("app_functions");

	//Props
	export let menuItem;
	export let icons;

	let feedbackURL =
		"https://docs.google.com/forms/d/e/1FAIpQLSf-X4wWIDLKAJc9tZBV7vZYYD3qyMGMxbTgij1ltmr8CfSxbw/viewform?usp=sf_link";

	$: isSelected = $currentPage.name === menuItem.page.name;
	$: backupPage = menuItem.name === "Backup Lamden Vault";
	$: whatsnew = menuItem.name === "What's New";

	const menuAction = () => {
		if (menuItem.page.name === "LockScreen") {
			chrome.runtime.sendMessage({ type: "lockWallet" });
			return;
		}
		if (menuItem.page.name === "Feedback") {
			window.open(feedbackURL, "_blank");
			return;
		}
		switchPage(menuItem.page.name);
		menu_open.set(false)
	};
</script>

<div
	id={menuItem.id}
	class="item"
	class:selected={isSelected}
	class:notselected={!isSelected}
	on:click={() => menuAction()}
	>
	<div class="logo">
		<svelte:component
		this={icons[menuItem.logo]}
		width="14px"
		color={isSelected ? "var(--font-primary-inverse)" : "var(--font-primary)"}
		/>
	</div>
	<span class="name" class:warning={backupPage && $needsBackup}>
		{menuItem.name}
	</span>
	<div class="floating-label text-subtitle2 ">
		{menuItem.name}
	</div>
	{#if whatsnew && $newEventNum > 0}
		<div class="badger">{$newEventNum}</div>
	{/if}
</div>

<style>
	.item {
		position: relative;
		display: flex;
		flex-direction: row;
		justify-content: flex-end;
		align-items: center;
		cursor: pointer;
		margin: 2px 0;
		height: 32px;
		padding: 6px 0;
		border-radius: 3px;
	}

	.floating-label {
		display: none;
	}

	.item:hover > .floating-label {
		display: block;
		position: absolute;
		top: inherit;
		left: 50px;
		z-index: 100;
		width: 120px;
		background-color: var(--color-grey-2);
		color: var(--font-primary);
		border-radius: 0 4px 4px 0;
		padding: 13px;
		font-weight: 300;
		box-shadow: var(--box-shadow-2);
		-webkit-box-shadow: var(--box-shadow-2);
		-moz-box-shadow: var(--box-shadow-2);
	}

	.item.selected:hover > .floating-label {
		background-color: var(--primary-color-lighter);
		color: var(--font-primary-inverted);
		border: 1px solid transparent;
	}

	.item:hover {
		background-color: var(--primary-color-lighter);
	}

	.notselected:hover {
		background-color: var(--color-grey-2);
	}

	.logo {
		position: relative;
		top: -1px;
		width: 14px;
		height: 14px;
		margin-right: 15px;
	}

	.name {
		display: block;
		font-size: var(--text-body1);
		width: 180px;
		line-height: 20px;
	}

	.selected {
		background-color: var(--primary-color);
		color: var(--font-primary-inverse);
	}

	.warning {
		color: var(--font-warning);
	}

	.badger {
		display: block;
		background: #4fb8ff;
		width: 18px;
		height: 18px;
		border-radius: 50%;
		text-align: center;
		line-height: 18px;
		font-weight: 500;
		position: absolute;
		right: 24px;
		font-size: 12px;
	}

	@media screen and (max-width: 830px){
		.item {
			justify-content: flex-start;
			margin: 2px 0;
			padding: 6px 31px;
		}
		.item:hover > .floating-label{
			display: none;
		}
	}
</style>
