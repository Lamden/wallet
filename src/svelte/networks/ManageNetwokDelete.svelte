<script>
    import { getContext } from 'svelte'; 

    import { LeftSideFullPage } from '../Router.svelte'

    //Components
	import { Components }  from '../Router.svelte'

    //Stores
    import { NetworksStore } from '../../js/stores/stores.js';

    const { Button } = Components;

    //Context
    const { changeStep, getNetwork, setMessage} = getContext('networks_functions');

    let network = getNetwork();

    const confirm = () => {
        NetworksStore.deleteNetwork(network);
        setMessage({
            left: {
                title: 'Delete Success',
                content: `You've successfully Delete a network!`   
            },
            right: {
                title: `Network named "${network.name}" was deleted`,  
            }
        });
        changeStep(3);
    }
</script>

<style>
    .desc{
        line-height: 24px;
    }
    .wrap{
        width: 352px;  
    }
</style>
<LeftSideFullPage title={'Delete Network'} helpLink="/wallet/network_overview">
    <div slot="body">
        <div class="text-body1 weight-400 desc">
            If the network is deleted, it cannot be be restored.
        </div>
    </div>
<div slot="content" class="flex-column flex-align-center">
    <div class="flex-column wrap">
        <h6 class="text-primary text-center">Delete Network</h6>
        <div class="text-body1 text-primary text-box">
            {`This will delete the network connection information for "${network.name}" but will leave all Lamden Vault accounts intact.`}
        </div>
        <div class="flex-column flow-buttons">
            <Button
                id={'confirm-btn'} 
                width={'347px'}
                margin={'1rem 0 1rem 0'}
                classes={'button__solid button__primary'}
                name={"Remove Network"}
                click={confirm}
            />
            <Button id="back"
            classes={'button__solid'}
            margin={'0 0 .625rem 0'}
            name="Back" 
            width="347px"
            click={() => changeStep(1)} />  
        </div>
    </div>
</div>
</LeftSideFullPage>