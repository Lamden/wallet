<script>
	//Components
    import { Components }  from '../../js/router.js'
    const { Step } = Components;

    //Stores
    import { steps } from '../../js/stores/stores.js';

</script>

<style>
.steps{
    display: flex;
    flex-direction: row;
}
</style>
<div class="steps">
    {#each $steps.stepList as stepInfo, index}
        <Step {stepInfo} first={index === 0} last={(index + 1) === $steps.stepList.length } />
    {/each}
</div>