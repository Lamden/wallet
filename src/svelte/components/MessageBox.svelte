<script>
    //Components
    import { Components } from '../../js/router.js';
    const { Button } = Components;

    //Images
    import { icons } from '../../js/images.js';
    const { errorCircle, warning, checkmarkWhite } = icons;

    //Props
    export let message;

    $: text = message.text;
    $: type = message.type;
    $: buttons = message.buttons;

</script>

<style>
.message-box{
    align-items: center;
}

.message{
    align-items: center;
    padding-top: 65px;
}

.icon-background{
    align-items: center;
    height: 20px;
    width: 20px;
    margin-right: 10px;
    background-color: #89ED5B;
    border-radius: 20px;
}

.icon{
    margin-right: 10px;
}

.checkmark{
    width: 83%;
    margin-left: 1px;
    filter: invert(1);
    display: flex;
    align-items: center;
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
        {#if type === 'success'}
            <div class="icon-background flex-row">
                <img id={"success"} class="icon checkmark" src={checkmarkWhite} alt="checkmark icon" />
            </div>
        {/if}
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