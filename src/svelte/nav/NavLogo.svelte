<script>
    import { getContext } from 'svelte';

    //Images
    import { icons } from '../../js/images.js';

    //Stores
    import { themeStyle, firstRun } from '../../js/stores/stores.js';

	//Context
    const { switchPage } = getContext('app_functions');

    $: clickable = !$firstRun

    function goHome(){
        if (clickable) switchPage('CoinsMain')
    }
    

</script>

<style>
.box{
    min-width: 354px;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.brand{
    margin-bottom: 6px;
}

.clickable{
    cursor: pointer;
}

.logo {
    width: 32px;
    margin-right: 15.5px;
    margin-left: 51px;
}

.words {
    width: 90px;
}

.svg-black{
    filter: invert(1);
}
</style>

<div class="box">
    <div class="brand flex-row" class:clickable={clickable} on:click={() => goHome()}>
        <img class="logo" class:svg-black={$themeStyle === 'light'} src={icons.lamden_logo} alt="lamden logo">
        <img class="words" class:svg-black={$themeStyle === 'light'} src={icons.lamden_words} alt="lamden words">
    </div>
</div>