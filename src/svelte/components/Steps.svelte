<script>
    import { getContext } from 'svelte';

	//Components
    import { Components }  from '../Router.svelte'
    const { Step } = Components;

    //Stores
    import { steps } from '../../js/stores/stores.js';

    //Icon
    import DirectionalChevronIcon from '../icons/DirectionalChevronIcon.svelte'

    //Context
    const { changeStep } = getContext('functions');

    //Props
    export let back;
    export let hideBack;

    $: noSteps = $steps.stepList.length === 0;
    
    const goBack = () => {
        changeStep(back)
    }

</script>

<style>
.steps{
    margin: 2rem 60px 0;
}

.back-box{
    padding-top: 8px;
}

.back-arrow{
    margin: 2px 1px 0 0;
    transform: scaleX(-1);
}

.back-button{
    width: 56px;
    height: 16px;
    text-align: center;
}

:global(.back-box:hover .menu-icon){
    fill: var(--font-accent);
}

.back-box:hover{
    color: var(--font-accent);
}

.hide{
    display: none;
}
</style>

<div class="flex-row steps" class:hide={noSteps}>
    {#if hideBack}
        <div class="flex-row back-box" class:hide={$steps.currentStep >= $steps.stepList.length } on:click={() => goBack()}>
            <div class="back-arrow">
                <DirectionalChevronIcon width="12px" direction="right"/>
            </div>
            <div class="back-button text-button">{'BACK'}</div>
        </div>
    {/if}
    {#each $steps.stepList as stepInfo, index}
        <Step {stepInfo} first={index === 0} last={(index + 1) === $steps.stepList.length } />
    {/each}
</div>