<script>
    import { afterUpdate } from 'svelte'

    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

	//Components
    import { Components }  from '../Router.svelte';
    const { Kwarg } = Components;

    export let argumentList
    export let methodIndex = undefined
    export let bgStyle = "primary"

    afterUpdate(() => {
        dispatch('newArgValues', {argumentList, methodIndex})
    })

    const handleArgChanged = (e) => {
        argumentList.forEach(arg => {
            if (arg.value && arg.name === "to" && arg.type === "str") arg.value = arg.value.trim()
        });
        dispatch('newArgValues', {argumentList, methodIndex})
    }
</script>

<style>

</style>

{#each argumentList as argumentInfo, index}
    <Kwarg {argumentInfo} {index} on:argChanged={handleArgChanged} {bgStyle}/>
{/each}
