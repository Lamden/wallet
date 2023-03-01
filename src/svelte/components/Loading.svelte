<script>
    //Images
    import spinner from '../../img/menu_icons/icon_spinner.svg';
    

    export let message = '';
    export let subMessage = '';
    export let width = '89px';
    export let mainStyle = ";"

</script>

<style>
.loading{
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    flex-grow: 1;
    position: fixed;
    width: 100vw;
    height: 100vh;
    top: 0;
    left: 0;
}

.spinner{
	animation: rotation 5s infinite linear;
}

@keyframes rotation {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(359deg);
  }
}

.message{
    margin: 36px 0 0 0;
}

</style>

<div class="loading" style={mainStyle}>
    <div class="spinner" style={`width: ${width}; height: ${width};`}>{@html spinner}</div>
    {#if message !== ''}<h3 class="message text-primary">{message}</h3>{/if}
    {#if subMessage !== ''}<p class="text-primary text-subtitle2">{subMessage}</p>{/if}
</div>