<script>
    import { getContext } from 'svelte'

    //Components
    import { Components } from '../../js/router.js';
    const { Button } = Components;

    //Images
    import { icons } from '../../js/images.js';
    const { errorCircle, warning, successCircle } = icons;

    //Context
    const { getModalData } = getContext('app_functions');

    //Props
    export let message  = getModalData();;

    $: text = message.text;
    $: type = message.type;
    $: buttons = message.buttons;

</script>

<style>
.message-box{
    align-items: center;
    min-width: 500px;
}

.message{
    align-items: center;
    padding-top: 65px;
}

.icon{
    margin-right: 10px;
}

.checkmark{
    width: 22px;
}

.buttons{
    padding: 42px 0;
    align-items: center;
}
</style>

<div class="message-box flex-column">
    <div class="message flex-row">
        {#if type === 'error'}<img id={"error"} class="icon" src={errorCircle} alt="error icon" />{/if}   
        {#if type === 'warning'}<img id={"warning"} class="icon" src={warning} alt="warning icon" />{/if}
        {#if type === 'success'}<img id={"success"} class="icon checkmark" src={successCircle} alt="checkmark icon" />{/if}
        <h5 id={'message-text'}>{text}</h5>
    </div>
    <div class="buttons flex-row">
        {#each buttons as button, index}
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