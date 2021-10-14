<script>
	import whitelabel from '../../../whitelabel.json'
	
	//Stores
	import { 
			DappStore,
			currentNetwork,
		} from '../../js/stores/stores.js';

	//Components
	import { Connection, ConnectionEmpty, CoinDivider }  from '../Router.svelte'
	
	//Props
	export let name

	$: dappStorage = $DappStore ? Object.values($DappStore).filter(app => !!app[$currentNetwork.type]).map((app, index) => {
		app.id = index
		return app
	}) : []

</script>

<style>
.connectionsmain{
	display: flex;
	flex-direction: column;
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
	margin-left: 84px;
	flex-grow: 1;
}

.header-account{
	justify-content: flex-end;
	margin-right: 28px;  
	width: 203px;
}

</style>

<div class="connectionsmain text-primary">
	{#if dappStorage.length === 0}
		<ConnectionEmpty />
	{:else}
		<div class="header header-accounts header-text text-body1 divider ">
			{#if whitelabel.connections.connection_info.show}
				<div class:logo-space={whitelabel.connections.logo.show} class="header-name header-text">{whitelabel.connections.connection_info.title}</div>
			{/if}
			{#if whitelabel.connections.account.show}
				<div class="header-account header-text">{whitelabel.connections.account.title}</div>
			{/if}
		</div>	
		{#each dappStorage as dapp (dapp.id) }
			<Connection {dapp} />
			<CoinDivider />
		{/each}
	{/if}
</div>