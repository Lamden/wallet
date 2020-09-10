<script>
    import { swapsbyCreatedDate, currentNetwork, networkKey } from '../../js/stores/stores.js'

    //Components
    import { Components }  from '../Router.svelte'
    const { SwapStatus } = Components;

    const blockexplorers = {
        "Lamden Testnet|testnet|lamden": {
            "ethereum":'https://kovan.etherscan.io',
            "lamden":"https://testnet.lamden.io"
        },
        "Lamden Mainnet|mainnet|lamden": {
            "ethereum":'https://etherscan.io',
            "lamden":"https://mainnet.lamden.io"
        },
        "custom":{
            "ethereum":"",
            "lamden":""  
        }
    }
    $: swapList = $swapsbyCreatedDate[networkKey($currentNetwork)] || []
    $: blockexplorer = blockexplorers[networkKey($currentNetwork)] || blockexplorers["custom"]

</script>

{#each swapList as swap}
    <SwapStatus {swap} {blockexplorer} currencySymbol={$currentNetwork.currencySymbol}/>
{/each}