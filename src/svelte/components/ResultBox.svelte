<script>
    //Components
    import { Components } from '../Router.svelte';
    const { Button } = Components;

    //Images
    import errorCircle from '../../img/menu_icons/icon_error-circle.svg';
    import successCircle from '../../img/menu_icons/icon_success_circle.svg';
    import warning from '../../img/menu_icons/icon_warning.svg';

    //Props
    export let result;

    let typeIcons = {
        'error': errorCircle,
        warning,
        'success': successCircle
    }

    $: icon = typeIcons[result.type]
    $: resultMessage = result.message ? result.message : result.type;
    $: errorInfo = result.errorInfo ? result.errorInfo : undefined;

</script>

<style>
.results-box{
    align-items: center;   
    max-width: 800px; 
    min-width: 600px;
}

.error-box{
    align-items: center;
}

.icon{
    margin-right: 10px;
    width: 20px;
    height: 20px;
}

.buttons{
    padding: 2rem 0 10px;
}

.message{
    align-items: center;
    margin: 2rem 0 1rem;
}
p{
    margin: 0;
}

</style>

<div class="results-box flex-column">
    <h2 id={'results-title'}>{result.title}</h2> 

    <div id={'results-subtitle'} class="text-body1">{result.subtitle}</div>

    <div class="message flex-row">
        <div class="icon">{@html icon}</div>
        <p id={'results-message'} class="text-body1">{resultMessage}</p>
    </div>
    {#if errorInfo}
        <div class="error-info text-body1 flex-column">
            <div class="flex-column">
                {#each errorInfo as error}
                    <div class="error">{error}</div>  
                {/each}
            </div>
        </div>
    {/if}
    <div class="buttons flex-row">
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