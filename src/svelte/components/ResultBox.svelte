<script>
    //Components
    import { Components } from '../Router.svelte';
    const { Button } = Components;

    //Images
    import errorCircle from '../../img/menu_icons/icon_error-circle.svg';
    import successCircle from '../../img/menu_icons/icon_success_circle.svg';
    import caution from '../../img/menu_icons/icon_caution.svg';

    //Stores
    import { currentNetwork } from '../../js/stores/stores.js';

    //Props
    export let result;

    let typeIcons = {
        'error': errorCircle,
        caution,
        'success': successCircle
    }

    $: icon = typeIcons[result.type]
    $: resultMessage = result.message ? result.message : result.type;
    $: errorInfo = result.errorInfo ? result.errorInfo : undefined;
    $: addressLookupURL = $currentNetwork.blockExplorer;

</script>

<style>
    h2{
        margin: 1rem 0 0rem;
    }
    .results-box{
        align-items: center;
        min-width: 550px; 
        background: inherit;
    }

    .icon{
        margin-right: 10px;
        min-width: var(--text-huge);
        position: relative;
    }

    .results-box-buttons{
        padding: 2rem 0 10px;
    }

    .message{
        margin: 2rem 0 1rem;
    }
    p{
        margin: 0;
    }
    p#results-message{
        font-size: var(--text-h3);
        font-weight: 300;
    }
    h3#results-subtitle{
        color: var(--font-primary-dim);
    }
    @media screen and (max-width: 830px) {
        .results-box-buttons{
            flex-wrap: wrap;
            width: 100%;
            
        }
        :global(.results-box-buttons > button){
            width: 100%!important;
            margin-bottom: 1rem!important;
        }
    }

    @media screen and (max-width: 550px) {
        .results-box{
            width: 100%;
            min-width: unset;
        }
    }

</style>

<div class="results-box flex-column">
    <h2 id={'results-title'}>{result.title}</h2> 

    <h3 id={'results-subtitle'} >{result.subtitle}</h3>

    <div class="message flex-row flex-align-center">
        <div class="icon">{@html icon}</div>
        <p id={'results-message'} class="text-body1">{resultMessage}</p>
    </div>
    {#if result.txHash && addressLookupURL}
        <div>
            <a class="text-link" target="_blank" rel="noopener noreferrer" href={`${addressLookupURL}/transactions/${result.txHash}`}>
                Click here to view transaction details.
            </a>
        </div>
    {/if}
    {#if errorInfo}
        <div class="error-info text-body1 flex-column">
            <div class="flex-column">
                {#each errorInfo as error}
                    <p class="error">{error}</p>  
                {/each}
            </div>
        </div>
    {/if}
    <div class="results-box-buttons flex-row">
        {#each result.buttons as button, index}
            <Button
                id={button.id} 
                classes={button.class} 
                width={button.width ? button.width : '232px'}
                margin={button.margin ? button.margin : '0 7px'}
                name={button.name}
                click={button.click} />
        {/each}
    </div>
</div>