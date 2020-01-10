<script>
    import { onMount, getContext } from 'svelte';

    //Components
	import { Components }  from '../../js/router.js'
    const { Loading, ErrorBox } = Components;

    //Context
    const { setKeyStore, changeStep, nextPage } = getContext('functions');

    //Props
    export let file;

    let error = '';

    onMount(() => {
        new Promise(function(resolve, reject) {
            setTimeout(() => {
                validateKeyStore(file, resolve, reject);
            }, 1000);
        })
        .then(res => {
            nextPage();
        })
        .catch(err => error = err)
    });

    async function validateKeyStore(fileObj, resolve, reject){
        const reader = new FileReader();      
        reader.onload = async function (e) {
            let output = e.target.result;
            let keystoreObj = {};
            
            try{
                keystoreObj = JSON.parse(JSON.parse(output).data);
            } catch (e) {
                console.log(e)
                reject("This is not a valid keystore file.")
            }

            if (!keystoreObj.ct || !keystoreObj.iv || !keystoreObj.s){
                console.log(e)
                reject("This is not a valid keystore file.")
            }

            setKeyStore(JSON.parse(output));
            resolve();
        };
        await reader.readAsText(fileObj);
    }

    function goBack(){
        setKeyStore(undefined);
        changeStep(0);
    }

</script>

<style>
.page{
    display: flex;
    flex-grow: 1;
    justify-content: center;
    
}

.error-padding{
    padding-top: 320px;
}

</style>

<div class="page" class:error-padding={error !== ''}>
    {#if error === ''}
        <Loading message={'Checking Keystore'} />
    {:else}
        <ErrorBox {error} header="Oops" buttonText="back" buttonAction={() => goBack()}/>
    {/if}
</div>

