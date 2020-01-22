<script>
    import { onMount, getContext } from 'svelte';

	//Components
    import { Components }  from '../../js/router.js'
    const { Step } = Components;

    //Stores
    import { steps } from '../../js/stores/stores.js';

    //Images
    import { icons } from '../../js/images.js';
    const { chevronRight } = icons;

    //Context
    const { changeStep } = getContext('functions');

    //Props
    export let back;

    $: noSteps = $steps.stepList.length === 0;
    
    function goBack(){
        changeStep(-1)
    }

</script>

<style>
.steps{
    display: flex;
    flex-direction: row;
}

.back-box{
    display: flex;
    flex-direction: row;
    padding-top: 8px;
}

.back-arrow{
    width: 7px;
    height: 12px;
    margin-right: 9px;
    box-sizing: border-box;
    position: relative;
    top: 1px;
    transform: scaleX(-1);
}

.back-button{
    width: 56px;
    height: 16px;
    text-align: center;
}

.hide{
    display: none;
}
</style>
<div class="steps" class:hide={noSteps}>
    <div class="back-box" class:hide={$steps.currentStep >= $steps.stepList.length }>
        <div class="back-arrow">{@html chevronRight}</div>
        <div class="back-button text-button" on:click={() => goBack()}>{'BACK'}</div>
    </div>
    {#each $steps.stepList as stepInfo, index}
        <Step {stepInfo} first={index === 0} last={(index + 1) === $steps.stepList.length } />
    {/each}
</div>