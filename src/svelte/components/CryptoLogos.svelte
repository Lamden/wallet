<script>
    import whitelabel from '../../../whitelabel.json'
    
    //Images
    import TAU from '../../img/logo.svg';
    import ETH from '../../img/coin_logos/ethereum.svg';

    //Props
    export let coin = {};
    export let styles;
    export let dark = true;

    $: logo = coin.logo ? coin.network ? coin.logo : logos[coin.network][coin.symbol.replace("-", "_")] || logos[coin.network].default : logos['lamden'].default;

    const logos = {
        'lamden': {
            'default' : TAU,
            TAU
        },
        'ethereum': {
            'default' : ETH,
            ETH
        },
    }
</script>

<style>

</style>

<div style={styles}>{@html logo}</div>





