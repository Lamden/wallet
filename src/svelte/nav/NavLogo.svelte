<script>
    import { navIcons } from '../../js/images.js';
    

</script>

<style>
.box{
    width: 354px;
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
</style>

<div class="box">
        <img class="logo" src={navIcons.lamden_logo} alt="lamden logo">
        <img class="words" src={navIcons.lamden_words} alt="lamden words">
</div>