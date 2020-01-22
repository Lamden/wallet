<script>
    //Stores
    import { themeStyle } from '../../js/stores/stores.js';

    //Images
    import spinner from '../../img/menu_icons/icon_spinner.svg';
    

    export let message = '';

</script>

<style>
.loading{
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    justify-content: center;
}

.spinner{
    width: 89px;
    height: 89px;
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

.svg-black{
    filter: invert(1);
}
</style>

<div class="loading">
    <div class:svg-black={$themeStyle === 'light'} class="spinner" >{@html spinner}</div>
    {#if message !== ''}<h6 class="message text-primary">{message}</h6>{/if}
</div>