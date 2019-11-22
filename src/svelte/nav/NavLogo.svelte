<script>
    import { icons } from '../../js/images.js';

    //Stores
    import { themeStyle } from '../../js/stores/stores.js';
    

</script>

<style>
.box{
    min-width: 354px;
    height: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-content: center;
}

.logo {
    width: 32px;
    margin-right:  15.5px;
    margin-left:    51px;
}

.words {
    width: 90px;
}

.svg-black{
    filter: invert(1);
}
</style>

<div class="box">
        <img class="logo" class:svg-black={$themeStyle === 'light'} src={icons.lamden_logo} alt="lamden logo">
        <img class="words" class:svg-black={$themeStyle === 'light'} src={icons.lamden_words} alt="lamden words">
</div>