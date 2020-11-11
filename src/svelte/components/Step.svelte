<script>
    //Stores
    import { steps } from '../../js/stores/stores.js';

    //Images
    import checkmarkWhite from '../../img/menu_icons/icon_checkmark-white.svg';

    //Props
    export let stepInfo
    export let first
    export let last

    $: complete = $steps.currentStep > stepInfo.number;
    $: current = $steps.currentStep === stepInfo.number;
    $: display = complete ? checkmarkWhite : stepInfo.number;
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
    border-bottom: 1px solid var(--outline);
    position: absolute;
    top: 16px;
    left: 0px;
    z-index: -1;
}

.middle:after {
    content: "";
    width: 50px;
    border-bottom: 1px solid var(--outline);
    position: absolute;
    top: 16px;
    left: 80px;
    z-index: -1;
}

.last:before {
    content: "";
    width: 50px;
    border-bottom: 1px solid var(--outline);
    position: absolute;
    top: 16px;
    left: 0px;
    z-index: -1;
}

.first:after {
    content: "";
    width: 50px;
    border-bottom: 1px solid var(--outline);
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
    border: 4px solid var(--black-color);
    background: var(--bg-secondary);
    border-radius: 20px;
    margin-bottom: 4px;
}

.number{
    color: var(--font-secondary);
    margin: auto;
}

.checkmark{
    margin-top: 5px;
    width: 16px;
}

.current{
    filter: brightness(175%)
}

.done{
    background: var(--success-color)
}
div.text-body1, div.text-body2{
    text-align: center;
    width: 100%;
}

</style>

<div class="step" class:middle={!first && !last} class:first={first} class:last={last}>
    <div class="number-box" class:current={current || complete} class:done={complete}>
        <div class="number text-subtitle2 text-black" class:checkmark={complete}>
            {@html display}
        </div>
    </div>
    <div class="text-body1" 
        class:text-secondary={!complete && !current}
        class:text-primary={complete || current}>
        {stepInfo.name}
    </div>
    <div class="text-body2 text-secondary">{stepInfo.desc}</div>
</div>