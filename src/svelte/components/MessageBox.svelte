<script>
    import { getContext } from 'svelte'

    //Components
    import { Components } from '../Router.svelte';
    const { Button } = Components;

    //Images
    import successCircle from '../../img/menu_icons/icon_success_circle.svg';
    import errorCircle from '../../img/menu_icons/icon_error-circle.svg';
    import caution from '../../img/menu_icons/icon_caution.svg';

    //Context
    const { getModalData } = getContext('app_functions');

    //Props
    export let message = getModalData();

    $: title = message.title;
    $: text = message.text;
    $: type = message.type;
    $: buttons = message.buttons;
</script>

<style>
    .message-box{
        align-items: center;
        min-width: 500px;
        background: inherit;
    }

    .message{
        margin: 2rem 0 0.5rem;
        width: 100%;
        justify-content: center;
    }

    .icon{
        margin-right: 14px;
        min-width: var(--text-huge);
    }

    .checkmark{
        min-width: var(--text-huge);
    }

    .message-box-buttons{
        padding: 42px 0;
        align-items: center;
    }
    h2{
        margin: 0;
    }

    @media screen and (max-width: 528px){
        .message-box{
            min-width: unset;
            width: 100%;

        }
    }
    @media screen and (max-width: 830px) {
        .message-box-buttons{
            flex-wrap: wrap;
            width: 100%;
            
        }
        :global(.message-box-buttons > button){
            width: 100%!important;
            margin-bottom: 1rem!important;
        }
    }

    @media screen and (max-width: 550px) {
        .message-box{
            width: 100%;
            min-width: unset;
        }
    }
</style>

<div class="message-box flex-column">
    {#if title}
        <h2 id={'message-title'}>{title}</h2>
    {/if}
    <div class="message flex-row flex-align-center">
        {#if type === 'error'}<div id={"error"} class="icon">{@html errorCircle}</div>{/if}  
        {#if type === 'caution'}<div id={"caution"} class="icon">{@html caution}</div>{/if}
        {#if type === 'success'}<div id={"success"} class="icon checkmark">{@html successCircle}</div>{/if}
        <div id={'message-text'} class="text-body1">{@html text}</div>
    </div>
    <div class="message-box-buttons flex-row">
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