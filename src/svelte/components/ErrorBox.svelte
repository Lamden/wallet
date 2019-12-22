<script>
    //Images
    import { icons } from '../../js/images.js';

    export let error, header, buttonText, buttonAction;

</script>

<style>
.errorbox{
    display: flex;
    flex-direction: column;
    background: var(--bg-color-dark);
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
        <img class="icon" src={icons.error} alt="error icon" />
        <h6 class="header">{header}</h6>
    </div>
    <div class="message">
        {error}
    </div>
    <div class="buttons">
        <button on:click={() => buttonAction()}>{buttonText}</button>
    </div>
</div>