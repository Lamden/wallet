<script>
    //Images
    import cautionIcon from '../../img/menu_icons/icon_caution.svg'
    
    //Components
	import { Components }  from '../Router.svelte'
    const { Button } = Components;

    export let message
    
    $: title = message.title;
    $: text = message.text;
    $: buttons = message.buttons;

</script>

<style>
    h2{
        margin: 1rem 0 0rem;
    }
    .notification{
        width: 530px;
        align-items: center;
    }
    .warning-icon{
        width: 60px;
        min-width: 30px;
    }
    .msg{
        margin: 1.6rem 0 1rem 0;
    }
    .buttons{
        flex-grow: 1;
        flex-direction: column;
        display: flex;
        padding-top: 27px;
        justify-content: center;
        align-items: center;
    }
</style>

<div class="notification flex-column">
    <div class="warning-icon">{@html cautionIcon}</div>
    <h2>{title}</h2>
    <div class="text-body1 msg">
        {text}
    </div>
    <div class="buttons">
        {#each buttons as button, index}
            <Button 
                id={button.id} 
                classes={button.class} 
                width={button.width ? button.width : '232px'}
                margin={button.margin ? button.margin : '0 0 17px 0'}
                name={button.name}
                click={button.click} />
        {/each}
    </div>
</div>