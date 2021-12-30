<script>
    import { getContext } from 'svelte';
    //Images
    import cautionIcon from '../../img/menu_icons/icon_caution_circle.svg'
    
    //Components
	import { Components }  from '../Router.svelte'
    const { Button } = Components;

    //Context
    const { closeModal } = getContext('app_functions');

    let helpLink = "https://docs.lamden.io/docs/develop/wallet_api/overview";

</script>

<style>
    h2{
        margin: 1rem 0 0rem;
    }
    .notification{
        width: 530px;
        align-items: center;
    }
    .warning-icon{
        width: 60px;
        min-width: 30px;
    }
    .msg{
        margin: 1.6rem 0 1rem 0;
    }
    .buttons{
        flex-grow: 1;
        flex-direction: column;
        display: flex;
        padding-top: 27px;
        justify-content: center;
        align-items: center;
    }
</style>

<div class="notification flex-column">
    <div class="warning-icon">{@html cautionIcon}</div>
    <h2>Watched Accounts</h2>
    <div class="text-body1 msg">
        You do not own the private keys for these accounts.
    </div>
    <div class="buttons"> 
            <Button
                id={'ignore-btn'} 
                width={'232px'}
                margin={'0 0 17px 0'}
                classes={'button__solid button__secondary'}
                name="Ignore"
                click={closeModal}
            >
            </Button> 
    </div>
</div>