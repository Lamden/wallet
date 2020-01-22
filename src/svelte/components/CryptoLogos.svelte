<script>
    //Stores
    import { themeStyle } from '../../js/stores/stores.js';

    //Images
    import defaultLogoLamden from '../../img/coin_logos/lamden_logo_new.svg';
    import TAU from '../../img/coin_logos/lamden_logo_new.svg';

    //Props
    export let coin;
    export let styles;
    export let dark = true;

    $: logo = coin.logo ? coin.logo : logos[coin.network][coin.symbol.replace("-", "_")] || logos[coin.network].default ;


    const logos = {
        'lamden': {
            'default' : defaultLogoLamden,
            TAU
        },
    }
</script>

<style>
.svg-black{
    filter: invert(1);
}
</style>

<div class:svg-black={$themeStyle === 'light'} style={styles}>{@html logo}</div>



