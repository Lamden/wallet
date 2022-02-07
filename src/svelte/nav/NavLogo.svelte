<script>
    import { getContext } from 'svelte';

    //Images
    import logo_full from '../../img/logo_full.svg';

	//Context
    const { switchPage, firstRun } = getContext('app_functions');

    export let style = "fill: var(--font-primary)";

    $: clickable = !firstRun()

    const goHome = () => {
        if (clickable) switchPage('CoinsMain')
    }
    

</script>

<style>
.box{
    width: 354px;
    min-width: 200px;
    height: 100%;
    justify-content: center;
}

.brand{
    margin-bottom: 6px;
    align-items: center;
}

.logo {
    width: 240px;
    margin-right: 15.5px;
    margin-left: 51px;
}
</style>

<div class="box flex-column" style={style}>
    <div class="brand" class:clickable={clickable} on:click={() => goHome()}>
        <div class="logo">{@html logo_full}</div>
    </div>
</div>