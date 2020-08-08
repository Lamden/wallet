<script>
    import { getContext } from 'svelte';

	//Stores
    import { NetworksStore, currentNetwork } from '../../js/stores/stores.js';

    //Components
	import { Components }  from '../Router.svelte'
    const { Button, InputBox } = Components;

    //Props 
    export let closeModal;

    const deleteNetwork = () => {
        NetworksStore.deleteNetwork($currentNetwork)
        closeModal();
    }

</script>

<style>
.network-delete{
    width: 400px;
}
.buttons{
    justify-content: center;
    margin-top: 4rem;
    margin-bottom: 1rem;
}
</style>

<div class="network-delete">
    <h2> Delete Network Connection </h2>


    <div class="subtitle text-subtitle3">
        {`This will delete the network connection information for "${$currentNetwork.name}" but will leave all wallet accounts intact.`}
    </div>
    <div class="buttons flex-row">
        <Button 
            id={"back-btn"}
            classes={'button__solid button__red'} 
            width={'232px'}
            name="Delete" 
            click={() => deleteNetwork()} /> 

        <Button 
            id={"back-btn"}
            classes={'button__solid'} 
            width={'232px'}
            margin={'0 0 0 20px'}
            name="Cancel" 
            click={() => closeModal()} /> 
    </div>
</div>