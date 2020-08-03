<script>
    import { getContext } from 'svelte'

    //Components
    import { Components } from '../Router.svelte';
    const { Button } = Components;

    //Images
    import successCircle from '../../img/menu_icons/icon_success_circle.svg';
    import errorCircle from '../../img/menu_icons/icon_error-circle.svg';
    import warning from '../../img/menu_icons/icon_warning.svg';

    //Context
    const { getModalData } = getContext('app_functions');

    //Props
    export let message = getModalData();

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
    margin-right: 14px;
    width: 22px;
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
        {#if type === 'error'}<div id={"error"} class="icon">{@html errorCircle}</div>{/if}  
        {#if type === 'warning'}<div id={"warning"} class="icon">{@html warning}</div>{/if}
        {#if type === 'success'}<div id={"success"} class="icon checkmark">{@html successCircle}</div>{/if}
        <h2 id={'message-text'}>{text}</h2>
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