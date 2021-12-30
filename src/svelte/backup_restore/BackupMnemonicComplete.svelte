<script>
    import { onMount, getContext } from 'svelte';

    //Context
    const { appHome } = getContext('app_functions');

    //Components
	import { Components }  from '../Router.svelte'
    const { Loading } = Components;

    onMount(() => {

        new Promise(function(resolve) {
            setTimeout(() => {
                resolve();
            }, 2500);
        })
        .then(res => {
            appHome()
        })
    });


</script>

<style>
.Verified{
    display: flex;
    flex-grow: 1;
    justify-content: center;    
}

</style>

<div class="Verified">
    <Loading message={'Verified Successfully!'} />
</div>

