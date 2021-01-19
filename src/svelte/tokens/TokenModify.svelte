<script>
    import { getContext, setContext } from 'svelte';

    //Components
    import { Modals, Components } from '../Router.svelte';
    const { Button } = Components;

    //Stores 
    import { BalancesStore } from '../../js/stores/stores'

	//Context
    const { closeModal, getModalData } = getContext('app_functions');

    let token = getModalData();

	setContext('tokenmodify_functions', {
        nextPage: () => currentStep = currentStep + 1,
        setPage: (num) => currentStep = num,
        setResult: (result) => resultInfo = result,
        setMessage: (msg) => message = msg,
        home: () => currentStep = 1,
        close: () => closeModal(),
        deleteToken: (resolve) => deleteToken(resolve),
        token: (() => token)()
    });
    
    let resultInfo = {}
    let message = '';
    let steps = [
        {page: 'TokenOptions', cancelButton: false},
        {page: 'TokenDelete', cancelButton: true},
        {page: 'TokenDeleting', cancelButton: false},
        {page: 'ResultBox', cancelButton: false},
        {page: 'MessageBox', cancelButton: false},
    ]
    let currentStep = 1;

    const deleteToken = (resolve, contractName) => {
        chrome.runtime.sendMessage({type: 'deleteTokenOne', data: token}, (result) => {
            if (!result || chrome.runtime.lastError) {
                resolve(false)
            }
            resolve(result)
        })
    }
</script>

<style>
.token-modify{
    width: 550px;
    background: inherit;
}
.cancel-button{
    display: flex;
    justify-content: center;
    margin-top: 1rem;
}

</style>

<div class="token-modify">
    <svelte:component this={Modals[steps[currentStep - 1].page]} result={resultInfo} {message} />
    <div class="cancel-button">
        <Button id="cancel-modal-btn"
                classes={'button__text text-caption'} 
                width={'125px'}
                height={'24px'}
                padding={0}
                name="Cancel" 
                click={() => closeModal()} />    
    </div>
</div>