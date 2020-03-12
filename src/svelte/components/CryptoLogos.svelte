<script>
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

</style>

<div style={styles}>{@html logo}</div>



