<script>
    //Stores
    import { steps } from '../../js/stores/stores.js';

    //Images
    import checkmark from '../../img/menu_icons/icon_checkmark.svg';

    //Props
    export let stepInfo
    export let first
    export let last

    $: complete = $steps.currentStep > stepInfo.number;
    $: current = $steps.currentStep === stepInfo.number;
</script>

<style>
.step{
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 128px;
}

.middle:before {
    content: "";
    width: 50px;
    border-bottom: 1px solid #848484;
    position: absolute;
    top: 16px;
    left: 0px;
    z-index: -1;
}

.middle:after {
    content: "";
    width: 50px;
    border-bottom: 1px solid #848484;
    position: absolute;
    top: 16px;
    left: 80px;
    z-index: -1;
}

.last:before {
    content: "";
    width: 50px;
    border-bottom: 1px solid #848484;
    position: absolute;
    top: 16px;
    left: 0px;
    z-index: -1;
}

.first:after {
    content: "";
    width: 50px;
    border-bottom: 1px solid #848484;
    position: absolute;
    top: 16px;
    left: 80px;
    z-index: -1;
}

.number-box{
    display: flex;
    text-align: center;
    height: 24px;
    width: 24px;
    border: 4px solid black;
    background: #848484;
    border-radius: 20px;
    margin-bottom: 4px;
}

.number{
    color: black;
    margin: auto;
}

.checkmark{
    margin-top: 3px;
    width: 16px;
}

.current{
    background: #E0E0E0;
}

.done{
    background: #3fa23f
}
div.text-body1, div.text-body2{
    text-align: center;
    width: 100%;
}

</style>

<div class="step" class:middle={!first && !last} class:first={first} class:last={last}>
    <div class="number-box" class:current={current || complete} class:done={complete}>
        <div class="number text-subtitle2 text-black">
            {#if complete}<div class="checkmark">{@html checkmark}</div>
            {:else}{stepInfo.number}
            {/if}
        </div>
    </div>
    <div class="text-body1" 
        class:text-primary-dark={!complete && !current}
        class:text-primary={complete || current}>
        {stepInfo.name}
    </div>
    <div class="text-body2 text-primary-dark">{stepInfo.desc}</div>
</div>