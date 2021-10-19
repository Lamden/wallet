<script>
    	//Stores
	import { 
			currentNetwork,
		} from '../../js/stores/stores.js';
</script>

<style>
    .empty{
        display: block;
    }
</style>

<div id="connection-empty" class="empty">
    <h3> You have no <strong>{$currentNetwork.type.toUpperCase()}</strong> connections.</h3>
</div>