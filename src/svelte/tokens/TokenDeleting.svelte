<script>
    import { onMount, getContext } from 'svelte';
    
    //Components
    import { Components }  from '../Router.svelte';
    const { Loading } = Components;

    //Context
    const { appHome } = getContext('app_functions');
    const { token, deleteToken, setPage, setResult } = getContext('tokenmodify_functions');

    const buttons = [
        {id: 'home-btn', name: 'Home', click: () => appHome(), class: 'button__solid button__primary'}
    ]

    const successResult= {
        title: 'Token Deleted',
        subtitle: `${token.tokenName} deleted successfully`,
        message: "Successful Deletion",
        type: 'success',
        buttons
    }

    const failedResult= {
        title: 'Delete Failed',
        subtitle: `${token.tokenName} failed to delete`,
        message: "Something went wrong while removing this Token",
        type: 'error',
        buttons
    }

    onMount(() => {
        new Promise(function(resolve, reject) {
            deleteToken(resolve)
        })
        .then(res => {
            if (res){
                setResult(successResult)
            }else{
                setResult(failedResult)
            }
            setPage(4)
        })
        .catch(err => {
            setResult(failedResult)
            setPage(4)  
        })
    })
</script>

<style>
.deleting-coin{
    height: 224px;
    justify-content: center;
    align-items: center;
    background: inherit;
}
</style>

<div class="deleting-coin flex-column">
    <h2>Deleting Token from Lamden Vault</h2>
    <Loading />
</div>