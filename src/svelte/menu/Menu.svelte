<script>
	import whitelabel from "../../../whitelabel.json";

	import { fly } from "svelte/transition";
	import { quintOut } from "svelte/easing";

	//Stores
	import {
		currentNetwork  
	} from "../../js/stores/stores.js";

	//Components
	import { MenuBox } from "../Router.svelte";

	//Icons
	import AccountsIcon from "../icons/menu/AccountsIcon.svelte";
	import IdeIcon from "../icons/menu/IdeIcon.svelte";
	import SwapIcon from "../icons/menu/SwapIcon.svelte";
	import DevToolsIcon from "../icons/menu/DevToolsIcon.svelte";
	import BackupIcon from "../icons/menu/BackupIcon.svelte";
	import RestoreIcon from "../icons/menu/RestoreIcon.svelte";
	import SignOutIcon from "../icons/menu/SignOutIcon.svelte";
	import AboutIcon from "../icons/menu/AboutIcon.svelte";
	import FeedbackIcon from "../icons/menu/FeedbackIcon.svelte";
	import AppIcon from "../icons/menu/AppIcon.svelte";
	import SettingsIcon from "../icons/SettingsIcon.svelte";
	import NewsIcon from "../icons/menu/NewsIcon.svelte";

	const icons = {
		account: AccountsIcon,
		app: AppIcon,
		ide: IdeIcon,
		swap: SwapIcon,
		devtools: DevToolsIcon,
		backup: BackupIcon,
		restore: RestoreIcon,
		signout: SignOutIcon,
		about: AboutIcon,
		feedback: FeedbackIcon,
		setting: SettingsIcon,
		news: NewsIcon,
	};

	let menus = whitelabel.menu;
</script>

<div
	class="menus flex-column text-primary"
	in:fly={{
		delay: 0,
		duration: 500,
		x: -50,
		y: 0,
		opacity: 0.0,
		easing: quintOut,
	}}
	>
	{#each menus as menu}
		{#if menu.show}
		{#if menu.heading === "Node Dashbord"}
			{#if $currentNetwork.version === 2}
			<MenuBox heading={menu.heading} menuItems={menu.items} {icons} />
			{/if}
		{:else}
			<MenuBox heading={menu.heading} menuItems={menu.items} {icons} />
		{/if}
		{/if}
	{/each}
</div>

<style>
	.menus {
		padding: 20px 0px 0px 30px;
		width: 240px;
	}

	@media screen and (max-width: 830px) {
		.menus {
			box-sizing: border-box;
			padding: 103px 30px 0px;
			width: 100%;
		}
	}
</style>