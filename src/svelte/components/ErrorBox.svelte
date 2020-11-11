<script>
    //Images
    import errorIcon from '../../img/menu_icons/icon_error-circle.svg';

    export let error, header, buttonText, buttonAction;

</script>

<style>
.errorbox{
    display: flex;
    flex-direction: column;
    background: var(--bg-secondary);
    box-shadow: 0px 1px 48px rgba(0, 0, 0, 0.12), 0px 16px 32px rgba(0, 0, 0, 0.12), 0px 12px 24px rgba(0, 0, 0, 0.12);
    border-radius: 4px;
    width: 280px;
    height: 228px;
}

.header-box{
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 64px;
    padding: 16px;
}

.header{
    margin: 0;
}

.icon{
    width: 17px;
    height: 15px;
}

.message{
    flex-grow: 1;
}

.buttons{
    display: flex;
    justify-content: flex-end;
    align-items: center;
    height: 52px;
}


</style>

<div class="errorbox">
    <div class="header-box">
        <div class="icon" >{@html errorIcon}</div>
        <h6 class="header">{header}</h6>
    </div>
    <div class="message">
        {error}
    </div>
    <div class="buttons">
        <button on:click={() => buttonAction()}>{buttonText}</button>
    </div>
</div>