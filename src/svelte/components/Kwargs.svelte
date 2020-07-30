<script>
    import { afterUpdate } from 'svelte'

    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

	//Components
    import { Components }  from '../Router.svelte';
    const { Kwarg } = Components;

    export let argumentList
    export let methodIndex = undefined
    export let backgroundColor;

    afterUpdate(() => {
        console.log(backgroundColor)
        dispatch('newArgValues', {argumentList, methodIndex})
    })

    const handleArgChanged = (e) => {
        dispatch('newArgValues', {argumentList, methodIndex})
    }
</script>

<style>

</style>

{#each argumentList as argumentInfo, index}
    <Kwarg {argumentInfo} {index} on:argChanged={handleArgChanged} {backgroundColor} />
{/each}