<script>
    import { getContext, setContext } from 'svelte';

	//Stores
    import { DappStore } from '../../js/stores/stores.js';

    //Components
	import { Components, Modals}  from '../Router.svelte'
    const { Button } = Components;

    //Context
    const { getModalData, closeModal } = getContext('app_functions');

    setContext('connectionOption_functions', {
        setPage: (num) => page = num,
        setMessage: (msg) => message = msg,
    });

    let message = '';
    let page = 1
    let pages = [
        {page: 'ConnectionOption', cancelButton: false},
        {page: 'ConnectionTrusted', cancelButton: true},
        {page: 'ConnectionRevoke', cancelButton: true},
        {page: 'MessageBox', cancelButton: true},
        {page: 'MessageBox', cancelButton: false},
    ];

    let data = getModalData();
    let dappInfo = $DappStore[data.url];

</script>

<style>
    #dapp-options{
        background: inherit;
        width: 750px;
    }
    .cancel-button{
        display: flex;
        justify-content: center;
    }
</style>

<div id="dapp-options" class="text-primary">
    <svelte:component this={ Modals[pages[page - 1].page] } {message} dappInfo={dappInfo} />
    {#if pages[page - 1].cancelButton}
    <div class="cancel-button">
        <Button id="cancel-modal-btn"
                classes={'button__text text-caption'} 
                width={'125px'}
                height={'24px'}
                padding={0}
                name="Cancel" 
                click={() => closeModal()} />    
    </div>
    {/if}
</div>
