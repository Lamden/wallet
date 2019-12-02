<script>
    //Components
    import { Components, onMount } from '../../js/router.js';
    const { Button } = Components;

    //Images
    import { icons } from '../../js/images.js';
    const { errorCircle, successCircle, warning } = icons;

    //Props
    export let result;

    let typeIcons = {
        'error': errorCircle,
        warning,
        'success': successCircle
    }

    $: icon = typeIcons[result.type]

</script>

<style>
.tx-result{
    align-items: center;    
}

.icon{
    margin-right: 10px;
    width: 20px;
    height: 20px;
}

.buttons{
    padding: 65px 0 25px;
}

.message{
    align-items: center;
    padding-top: 65px;
}
</style>

<div class="tx-result flex-column">
    <h5>{result.title}</h5> 

    <div class="text-body1">{result.subtitle}</div>

    <div class="message flex-row">
        <img class="icon" src={icon} alt={`${result.type} icon`} />
        <h6>{result.message}</h6>
    </div>

    <div class="buttons flex-row">
        {#each result.buttons as button, index}
            <Button classes={button.class} 
                width={button.width ? button.width : '232px'}
                margin={button.margin ? button.margin : '0 7px'}
                name={button.name}
                click={button.click} />
        {/each}
    </div>
</div>