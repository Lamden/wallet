<script>
    import { getContext } from 'svelte';

    //Images
    import lamden_logo from '../../img/coin_logos/lamden_logo_white.svg';
    import lamden_words from '../../img/nav/lamden_words.svg';

	//Context
    const { switchPage, firstRun } = getContext('app_functions');

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
    width: 32px;
    margin-right: 15.5px;
    margin-left: 51px;
}

.words {
    width: 90px;
}

</style>

<div class="box flex-column">
    <div class="brand flex-row" class:clickable={clickable} on:click={() => goHome()}>
        <div class="logo">{@html lamden_logo}</div>
        <div class="words">{@html lamden_words}</div>
    </div>
</div>